"""
LifeSphere AI - Longitudinal Medical Timeline Endpoints
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.security.auth import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/timeline", tags=["Medical Timeline"])

@router.get("")
def get_medical_timeline(
    year: Optional[int] = None,
    record_type: Optional[str] = None,
    patient_id: Optional[str] = None,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_patient_id = current_user.id
    if current_user.role == "doctor" and patient_id:
        consent = db.query(models.Consent).filter(
            models.Consent.patient_id == patient_id,
            models.Consent.doctor_id == current_user.id,
            models.Consent.access_status == "Granted"
        ).first()
        if not consent:
            raise HTTPException(status_code=403, detail="Access denied: No active patient consent")
        target_patient_id = patient_id
    elif current_user.role == "admin" and patient_id:
        target_patient_id = patient_id

    query = db.query(models.MedicalRecord).filter(models.MedicalRecord.patient_id == target_patient_id)

    if record_type and record_type != "All":
        query = query.filter(models.MedicalRecord.record_type == record_type)

    records = query.order_by(models.MedicalRecord.record_date.desc()).all()

    # Filter by year in python for sqlite/postgres cross-compatibility
    if year:
        records = [r for r in records if r.record_date.year == year]

    # Group timeline items by year
    years_available = sorted(list(set(r.record_date.year for r in query.all())), reverse=True)
    
    timeline_items = []
    for r in records:
        timeline_items.append({
            "id": r.id,
            "title": r.title,
            "record_type": r.record_type,
            "record_date": str(r.record_date),
            "year": r.record_date.year,
            "description": r.description,
            "hospital_name": r.hospital_name,
            "doctor_name": r.doctor_name,
            "document_url": r.document_url,
            "is_verified": r.is_verified
        })

    AuditService.log_event(
        db=db,
        action="VIEW_TIMELINE",
        resource_type="TIMELINE",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=target_patient_id,
        details={"events_returned": len(timeline_items)}
    )

    return {
        "years_available": years_available,
        "selected_year": year,
        "total_events": len(timeline_items),
        "events": timeline_items
    }
