"""
LifeSphere AI - Patient Controlled Consent & Doctor Access Endpoints
Enforces granular access permissions and immediate revocation.
"""
import uuid
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import ConsentGrantRequest
from app.security.auth import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/consents", tags=["Consent & Access Control"])

@router.get("")
def get_consents(
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role == "patient":
        consents = db.query(models.Consent).filter(models.Consent.patient_id == current_user.id).all()
    elif current_user.role == "doctor":
        consents = db.query(models.Consent).filter(models.Consent.doctor_id == current_user.id).all()
    else:
        consents = db.query(models.Consent).all()

    result = []
    for c in consents:
        doc = db.query(models.Profile).filter(models.Profile.id == c.doctor_id).first()
        doc_details = db.query(models.Doctor).filter(models.Doctor.id == c.doctor_id).first()
        pat = db.query(models.Profile).filter(models.Profile.id == c.patient_id).first()

        result.append({
            "id": c.id,
            "patient_id": c.patient_id,
            "patient_name": pat.full_name if pat else "Patient",
            "patient_health_id": pat.health_id if pat else None,
            "doctor_id": c.doctor_id,
            "doctor_name": doc.full_name if doc else "Doctor",
            "doctor_specialization": doc_details.specialization if doc_details else "Specialist",
            "access_status": c.access_status,
            "permissions": c.permissions or {},
            "granted_at": c.granted_at.strftime("%b %d, %Y") if c.granted_at else None,
            "expires_at": c.expires_at.strftime("%b %d, %Y") if c.expires_at else None,
            "revoked_at": c.revoked_at.strftime("%b %d, %Y") if c.revoked_at else None
        })

    return result

@router.post("/grant")
def grant_doctor_access(
    req: ConsentGrantRequest,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Only patients can grant access to medical records")

    doctor = db.query(models.Profile).filter(
        models.Profile.id == req.doctor_id,
        models.Profile.role == "doctor"
    ).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    default_permissions = {
        "medical_records": True,
        "lab_reports": True,
        "prescriptions": True,
        "timeline": True,
        "health_trends": True,
        "ai_summary": True,
        "documents": True,
        "risk_assessment": True
    }
    permissions = req.permissions if req.permissions is not None else default_permissions

    # Check if consent already exists
    consent = db.query(models.Consent).filter(
        models.Consent.patient_id == current_user.id,
        models.Consent.doctor_id == req.doctor_id
    ).first()

    now = datetime.utcnow()
    expires = now + timedelta(days=365)

    if not consent:
        consent = models.Consent(
            id=str(uuid.uuid4()),
            patient_id=current_user.id,
            doctor_id=req.doctor_id,
            access_status="Granted",
            permissions=permissions,
            granted_at=now,
            expires_at=expires
        )
        db.add(consent)
    else:
        consent.access_status = "Granted"
        consent.permissions = permissions
        consent.granted_at = now
        consent.expires_at = expires
        consent.revoked_at = None

    # Update or create active DoctorPatientAccess mapping
    access = db.query(models.DoctorPatientAccess).filter(
        models.DoctorPatientAccess.patient_id == current_user.id,
        models.DoctorPatientAccess.doctor_id == req.doctor_id
    ).first()

    if not access:
        access = models.DoctorPatientAccess(
            id=str(uuid.uuid4()),
            patient_id=current_user.id,
            doctor_id=req.doctor_id,
            consent_id=consent.id,
            is_active=True
        )
        db.add(access)
    else:
        access.is_active = True
        access.consent_id = consent.id

    # Create Notifications
    notif_doc = models.Notification(
        user_id=doctor.id,
        title="Patient Access Granted",
        message=f"{current_user.full_name} has granted you clinical access to their health records.",
        notification_type="consent",
        metadata_json={"patient_id": current_user.id}
    )
    db.add(notif_doc)

    AuditService.log_event(
        db=db,
        action="CONSENT_GRANTED",
        resource_type="CONSENT",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=consent.id,
        details={"doctor_name": doctor.full_name, "permissions": permissions}
    )

    db.commit()

    return {
        "success": True,
        "message": f"Clinical access successfully granted to {doctor.full_name}",
        "consent_id": consent.id
    }

@router.post("/{consent_id}/revoke")
def revoke_doctor_access(
    consent_id: str,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    consent = db.query(models.Consent).filter(
        models.Consent.id == consent_id,
        models.Consent.patient_id == current_user.id
    ).first()

    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found or unauthorized")

    now = datetime.utcnow()
    consent.access_status = "Revoked"
    consent.revoked_at = now

    # Instantly deactivate DoctorPatientAccess mapping
    access = db.query(models.DoctorPatientAccess).filter(
        models.DoctorPatientAccess.patient_id == current_user.id,
        models.DoctorPatientAccess.doctor_id == consent.doctor_id
    ).first()
    if access:
        access.is_active = False

    doctor = db.query(models.Profile).filter(models.Profile.id == consent.doctor_id).first()

    # Create notification to doctor
    if doctor:
        notif_doc = models.Notification(
            user_id=doctor.id,
            title="Access Revoked",
            message=f"{current_user.full_name} has revoked clinical access to their health records.",
            notification_type="consent",
            metadata_json={"patient_id": current_user.id}
        )
        db.add(notif_doc)

    AuditService.log_event(
        db=db,
        action="CONSENT_REVOKED",
        resource_type="CONSENT",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=consent.id,
        details={"doctor_id": consent.doctor_id}
    )

    db.commit()

    return {
        "success": True,
        "message": "Doctor access has been permanently revoked. Further access is immediately blocked."
    }
