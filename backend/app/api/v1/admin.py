"""
LifeSphere AI - Administrator Dashboard & System Metrics Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.security.auth import get_current_user

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/overview")
def get_admin_overview(
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access forbidden: Administrator role required")

    total_users = db.query(models.Profile).count()
    patients_count = db.query(models.Profile).filter(models.Profile.role == "patient").count()
    doctors_count = db.query(models.Profile).filter(models.Profile.role == "doctor").count()
    records_count = db.query(models.MedicalRecord).count()
    docs_count = db.query(models.MedicalDocument).count()
    predictions_count = db.query(models.RiskPrediction).count()
    active_consents = db.query(models.Consent).filter(models.Consent.access_status == "Granted").count()

    recent_activity = db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(8).all()

    return {
        "stats": {
            "total_users": total_users,
            "patients": patients_count,
            "doctors": doctors_count,
            "medical_records": records_count,
            "uploaded_documents": docs_count,
            "risk_assessments": predictions_count,
            "active_consents": active_consents
        },
        "recent_activity": [
            {
                "id": a.id,
                "action": a.action,
                "user_role": a.user_role or "system",
                "status": a.status,
                "created_at": a.created_at.strftime("%b %d, %H:%M:%S")
            }
            for a in recent_activity
        ]
    }
