"""
LifeSphere AI - Doctor Portal Endpoints
Enforces strict consent checks before releasing any patient health information.
"""
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.security.auth import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(prefix="/doctor", tags=["Doctor Portal"])

@router.get("/patients")
def get_authorized_patients(
    search: Optional[str] = None,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Doctor role required")

    # Find active consents granted to this doctor
    active_consents = db.query(models.Consent).filter(
        models.Consent.doctor_id == current_user.id,
        models.Consent.access_status == "Granted"
    ).all()

    authorized_patient_ids = [c.patient_id for c in active_consents]

    if not authorized_patient_ids:
        return []

    query = db.query(models.Profile).filter(models.Profile.id.in_(authorized_patient_ids))

    if search:
        query = query.filter(
            (models.Profile.full_name.ilike(f"%{search}%")) |
            (models.Profile.health_id.ilike(f"%{search}%")) |
            (models.Profile.email.ilike(f"%{search}%"))
        )

    patients = query.all()

    results = []
    for pat in patients:
        consent = next((c for c in active_consents if c.patient_id == pat.id), None)
        rec_count = db.query(models.MedicalRecord).filter(models.MedicalRecord.patient_id == pat.id).count()
        latest_pred = db.query(models.RiskPrediction).filter(models.RiskPrediction.patient_id == pat.id).order_by(models.RiskPrediction.created_at.desc()).first()

        results.append({
            "id": pat.id,
            "full_name": pat.full_name,
            "email": pat.email,
            "phone": pat.phone,
            "health_id": pat.health_id,
            "avatar_url": pat.avatar_url,
            "record_count": rec_count,
            "latest_risk_category": latest_pred.risk_category if latest_pred else "Not Assessed",
            "latest_probability": round(latest_pred.probability, 4) if latest_pred else None,
            "consent_status": "Granted",
            "granted_at": consent.granted_at.strftime("%b %d, %Y") if (consent and consent.granted_at) else None,
            "permissions": consent.permissions if consent else {}
        })

    AuditService.log_event(
        db=db,
        action="DOCTOR_VIEW_AUTHORIZED_PATIENTS",
        resource_type="PATIENTS_LIST",
        user_id=current_user.id,
        user_role=current_user.role,
        details={"patients_count": len(results)}
    )

    return results

@router.get("/patients/{patient_id}")
def get_patient_clinical_file(
    patient_id: str,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "doctor" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Doctor role required")

    # STRICT CONSENT CHECK
    consent = db.query(models.Consent).filter(
        models.Consent.patient_id == patient_id,
        models.Consent.doctor_id == current_user.id,
        models.Consent.access_status == "Granted"
    ).first()

    if not consent and current_user.role != "admin":
        # Check if consent was revoked
        revoked = db.query(models.Consent).filter(
            models.Consent.patient_id == patient_id,
            models.Consent.doctor_id == current_user.id,
            models.Consent.access_status == "Revoked"
        ).first()
        
        status_msg = "Access revoked by patient." if revoked else "No active clinical consent granted by this patient."
        
        AuditService.log_event(
            db=db,
            action="UNAUTHORIZED_DOCTOR_ACCESS_ATTEMPT",
            resource_type="PATIENT_FILE",
            user_id=current_user.id,
            user_role=current_user.role,
            resource_id=patient_id,
            status="Blocked",
            details={"reason": status_msg}
        )
        raise HTTPException(status_code=403, detail=f"Access Denied: {status_msg}")

    # Fetch authorized clinical domains
    permissions = consent.permissions if consent else {
        "medical_records": True, "lab_reports": True, "prescriptions": True,
        "timeline": True, "health_trends": True, "ai_summary": True,
        "documents": True, "risk_assessment": True
    }

    patient_profile = db.query(models.Profile).filter(models.Profile.id == patient_id).first()
    if not patient_profile:
        raise HTTPException(status_code=404, detail="Patient record not found")

    patient_details = db.query(models.Patient).filter(models.Patient.id == patient_id).first()

    # Update doctor last accessed timestamp
    access = db.query(models.DoctorPatientAccess).filter(
        models.DoctorPatientAccess.doctor_id == current_user.id,
        models.DoctorPatientAccess.patient_id == patient_id
    ).first()
    if access:
        access.last_accessed_at = db.query(models.AuditLog).first().created_at if False else None

    # Load permitted records
    records = []
    if permissions.get("medical_records", True):
        records = db.query(models.MedicalRecord).filter(
            models.MedicalRecord.patient_id == patient_id
        ).order_by(models.MedicalRecord.record_date.desc()).all()

    # Latest prediction & SHAP
    latest_pred = None
    if permissions.get("risk_assessment", True):
        latest_pred = db.query(models.RiskPrediction).filter(
            models.RiskPrediction.patient_id == patient_id
        ).order_by(models.RiskPrediction.created_at.desc()).first()

    AuditService.log_event(
        db=db,
        action="DOCTOR_ACCESS_PATIENT_FILE",
        resource_type="PATIENT_FILE",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=patient_id,
        status="Success"
    )

    return {
        "patient": {
            "id": patient_profile.id,
            "full_name": patient_profile.full_name,
            "email": patient_profile.email,
            "phone": patient_profile.phone,
            "health_id": patient_profile.health_id,
            "avatar_url": patient_profile.avatar_url,
            "dob": str(patient_details.dob) if (patient_details and patient_details.dob) else None,
            "gender": patient_details.gender if patient_details else None,
            "blood_group": patient_details.blood_group if patient_details else None,
            "allergies_summary": patient_details.allergies_summary if patient_details else None,
            "conditions_summary": patient_details.conditions_summary if patient_details else None
        },
        "consent": {
            "status": "Granted",
            "granted_at": consent.granted_at.strftime("%b %d, %Y") if consent and consent.granted_at else None,
            "permissions": permissions
        },
        "records": [
            {
                "id": r.id,
                "title": r.title,
                "record_type": r.record_type,
                "record_date": str(r.record_date),
                "hospital_name": r.hospital_name,
                "doctor_name": r.doctor_name,
                "description": r.description,
                "document_url": r.document_url
            }
            for r in records
        ],
        "latest_prediction": {
            "prediction_id_display": latest_pred.prediction_id_display,
            "model_name": latest_pred.model_name,
            "probability": latest_pred.probability,
            "risk_category": latest_pred.risk_category,
            "shap_summary": latest_pred.shap_summary,
            "created_at": latest_pred.created_at.strftime("%b %d, %Y")
        } if latest_pred else None
    }
