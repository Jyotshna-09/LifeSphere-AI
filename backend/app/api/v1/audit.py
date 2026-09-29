"""
LifeSphere AI - Tamper-Evident Audit Log Endpoints
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.security.auth import get_current_user

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("")
def get_audit_logs(
    limit: int = Query(50, le=200),
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(models.AuditLog)

    # Patients see own logs; Admins see system-wide logs
    if current_user.role == "patient":
        query = query.filter(models.AuditLog.user_id == current_user.id)
    elif current_user.role == "doctor":
        query = query.filter(
            (models.AuditLog.user_id == current_user.id) |
            (models.AuditLog.details.contains(current_user.id))
        )

    logs = query.order_by(models.AuditLog.created_at.desc()).limit(limit).all()

    return [
        {
            "id": log.id,
            "action": log.action,
            "resource_type": log.resource_type,
            "resource_id": log.resource_id,
            "status": log.status,
            "ip_address": log.ip_address,
            "user_role": log.user_role or "user",
            "details": log.details or {},
            "created_at": log.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
        for log in logs
    ]
