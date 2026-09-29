"""
LifeSphere AI - Notification Management Endpoints
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.security.auth import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(models.Notification).filter(
        models.Notification.user_id == current_user.id
    ).order_by(models.Notification.created_at.desc()).all()

    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at.strftime("%b %d, %Y %H:%M")
        }
        for n in notifs
    ]

@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: str,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notification_id,
        models.Notification.user_id == current_user.id
    ).first()

    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    db.commit()
    return {"success": True}
