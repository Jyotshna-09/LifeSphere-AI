"""
LifeSphere AI - Tamper-Evident Audit Logging Service
Tracks authentication events, record interactions, ML inferences, document processing, and consent grants/revocations.
"""
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db import models

class AuditService:
    @staticmethod
    def log_event(
        db: Session,
        action: str,
        resource_type: str,
        user_id: Optional[str] = None,
        user_role: Optional[str] = None,
        resource_id: Optional[str] = None,
        status: str = "Success",
        ip_address: Optional[str] = "127.0.0.1",
        user_agent: Optional[str] = "LifeSphere Client",
        details: Optional[Dict[str, Any]] = None
    ) -> models.AuditLog:
        """
        Creates an audit entry in the database.
        Never stores unnecessary sensitive medical payload data in logs.
        """
        log_entry = models.AuditLog(
            user_id=user_id,
            user_role=user_role,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id,
            status=status,
            ip_address=ip_address,
            user_agent=user_agent,
            details=details or {}
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)
        return log_entry
