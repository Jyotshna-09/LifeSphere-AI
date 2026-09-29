"""
LifeSphere AI - Medication Interactions & Duplicate Test Alert Endpoints
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.security.auth import get_current_user
from app.services.safety_engine import SafetyEngine
from app.services.audit_service import AuditService

router = APIRouter(prefix="/safety", tags=["Clinical Safety & Alerts"])

@router.get("/medication-interactions")
def get_medication_interactions(
    patient_id: Optional[str] = None,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_patient_id = current_user.id
    if current_user.role == "doctor" and patient_id:
        target_patient_id = patient_id
    elif current_user.role == "admin" and patient_id:
        target_patient_id = patient_id

    interactions = SafetyEngine.check_medication_interactions(db, target_patient_id)

    AuditService.log_event(
        db=db,
        action="CHECK_MEDICATION_INTERACTIONS",
        resource_type="SAFETY_MODULE",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=target_patient_id,
        details={"interactions_found": len(interactions)}
    )

    return interactions

@router.get("/duplicate-tests")
def get_duplicate_test_alerts(
    threshold_days: int = 60,
    patient_id: Optional[str] = None,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_patient_id = current_user.id
    if current_user.role == "doctor" and patient_id:
        target_patient_id = patient_id
    elif current_user.role == "admin" and patient_id:
        target_patient_id = patient_id

    alerts = SafetyEngine.detect_duplicate_tests(db, target_patient_id, threshold_days=threshold_days)

    AuditService.log_event(
        db=db,
        action="CHECK_DUPLICATE_TESTS",
        resource_type="SAFETY_MODULE",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=target_patient_id,
        details={"alerts_found": len(alerts)}
    )

    return alerts
