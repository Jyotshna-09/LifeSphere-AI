"""
LifeSphere AI - Medical Records Endpoints
"""
import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import MedicalRecordCreate, MedicalRecordResponse
from app.security.auth import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])

@router.get("", response_model=List[MedicalRecordResponse])
def get_medical_records(
    record_type: Optional[str] = None,
    search: Optional[str] = None,
    patient_id: Optional[str] = None,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Determine target patient
    target_patient_id = current_user.id
    if current_user.role == "doctor" and patient_id:
        # Check doctor access consent
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

    if search:
        query = query.filter(
            (models.MedicalRecord.title.ilike(f"%{search}%")) |
            (models.MedicalRecord.description.ilike(f"%{search}%")) |
            (models.MedicalRecord.hospital_name.ilike(f"%{search}%")) |
            (models.MedicalRecord.doctor_name.ilike(f"%{search}%"))
        )

    records = query.order_by(models.MedicalRecord.record_date.desc()).all()

    # Log audit event
    AuditService.log_event(
        db=db,
        action="VIEW_MEDICAL_RECORDS",
        resource_type="MEDICAL_RECORD",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=target_patient_id,
        details={"record_count": len(records), "filter_type": record_type}
    )

    return records

@router.post("", response_model=MedicalRecordResponse)
def create_medical_record(
    req: MedicalRecordCreate,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = models.MedicalRecord(
        id=str(uuid.uuid4()),
        patient_id=current_user.id,
        record_type=req.record_type,
        title=req.title,
        description=req.description,
        record_date=req.record_date or date.today(),
        hospital_name=req.hospital_name or "Self-Reported / Clinical Center",
        doctor_name=req.doctor_name or "Attending Physician",
        document_url=req.document_url,
        is_verified=True
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    AuditService.log_event(
        db=db,
        action="CREATE_MEDICAL_RECORD",
        resource_type="MEDICAL_RECORD",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=record.id,
        details={"title": record.title, "record_type": record.record_type}
    )

    return record

@router.delete("/{record_id}")
def delete_medical_record(
    record_id: str,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = db.query(models.MedicalRecord).filter(
        models.MedicalRecord.id == record_id,
        models.MedicalRecord.patient_id == current_user.id
    ).first()

    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found or unauthorized")

    db.delete(record)
    db.commit()

    AuditService.log_event(
        db=db,
        action="DELETE_MEDICAL_RECORD",
        resource_type="MEDICAL_RECORD",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=record_id
    )

    return {"success": True, "message": "Record deleted successfully"}
