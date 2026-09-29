"""
LifeSphere AI - AI Health Summary Endpoints
Generates the comprehensive 10-point longitudinal clinical report synthesized from database records.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.security.auth import get_current_user
from app.services.ai_summary_engine import AISummaryEngine
from app.services.audit_service import AuditService

router = APIRouter(prefix="/ai", tags=["AI Health Summary"])

@router.get("/summary")
def get_ai_health_summary(
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
            raise HTTPException(status_code=403, detail="Access denied: Doctor does not have active patient consent")
        target_patient_id = patient_id
    elif current_user.role == "admin" and patient_id:
        target_patient_id = patient_id

    try:
        summary_data = AISummaryEngine.generate_health_summary(db, target_patient_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    AuditService.log_event(
        db=db,
        action="GENERATE_AI_HEALTH_SUMMARY",
        resource_type="AI_SUMMARY",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=target_patient_id
    )

    return summary_data
