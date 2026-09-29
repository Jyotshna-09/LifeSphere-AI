"""
LifeSphere AI - Health Trends & Current vs Previous Comparison Endpoints
"""
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db import models
from app.schemas.schemas import HealthMetricCreate, HealthMetricResponse
from app.security.auth import get_current_user
from app.services.audit_service import AuditService

router = APIRouter(tags=["Health Trends"])

TRACKED_METRICS = [
    {"type": "Blood Pressure", "unit": "mmHg", "is_dual": True},
    {"type": "Fasting Glucose", "unit": "mg/dL", "is_dual": False},
    {"type": "Total Cholesterol", "unit": "mg/dL", "is_dual": False},
    {"type": "Weight", "unit": "kg", "is_dual": False},
    {"type": "BMI", "unit": "kg/m²", "is_dual": False},
    {"type": "Heart Rate", "unit": "bpm", "is_dual": False}
]

@router.get("/health-trends")
def get_health_trends(
    time_range: str = Query("all", regex="^(7d|30d|6m|1y|all)$"),
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

    # Filter cutoff
    now = datetime.utcnow()
    cutoff = None
    if time_range == "7d":
        cutoff = now - timedelta(days=7)
    elif time_range == "30d":
        cutoff = now - timedelta(days=30)
    elif time_range == "6m":
        cutoff = now - timedelta(days=180)
    elif time_range == "1y":
        cutoff = now - timedelta(days=365)

    trends_data = {}
    comparisons = []

    for metric_meta in TRACKED_METRICS:
        m_type = metric_meta["type"]
        query = db.query(models.HealthMetric).filter(
            models.HealthMetric.patient_id == target_patient_id,
            models.HealthMetric.metric_type == m_type
        )
        if cutoff:
            query = query.filter(models.HealthMetric.recorded_at >= cutoff)

        records = query.order_by(models.HealthMetric.recorded_at.asc()).all()

        # Build Recharts series
        series = []
        for r in records:
            point = {
                "date": r.recorded_at.strftime("%b %d, %Y"),
                "timestamp": r.recorded_at.isoformat(),
                "value": r.value_primary,
                "unit": r.unit
            }
            if r.value_secondary is not None:
                point["value_secondary"] = r.value_secondary
            series.append(point)

        # Comparison calculation (Latest vs Previous)
        all_for_metric = db.query(models.HealthMetric).filter(
            models.HealthMetric.patient_id == target_patient_id,
            models.HealthMetric.metric_type == m_type
        ).order_by(models.HealthMetric.recorded_at.desc()).all()

        if len(all_for_metric) >= 2:
            latest = all_for_metric[0]
            prev = all_for_metric[1]
            diff = round(latest.value_primary - prev.value_primary, 2)
            
            if diff > 0:
                direction = "increased"
                statement = f"{m_type} increased compared with the previous recorded value."
            elif diff < 0:
                direction = "decreased"
                statement = f"{m_type} decreased compared with the previous recorded value."
            else:
                direction = "stable"
                statement = f"{m_type} remained unchanged compared with the previous recorded value."

            comparisons.append({
                "metric_type": m_type,
                "current_value": latest.value_primary,
                "current_secondary": latest.value_secondary,
                "current_date": latest.recorded_at.strftime("%b %d, %Y"),
                "previous_value": prev.value_primary,
                "previous_secondary": prev.value_secondary,
                "previous_date": prev.recorded_at.strftime("%b %d, %Y"),
                "difference": diff,
                "unit": latest.unit,
                "direction": direction,
                "statement": statement
            })
        elif len(all_for_metric) == 1:
            latest = all_for_metric[0]
            comparisons.append({
                "metric_type": m_type,
                "current_value": latest.value_primary,
                "current_secondary": latest.value_secondary,
                "current_date": latest.recorded_at.strftime("%b %d, %Y"),
                "previous_value": None,
                "previous_date": None,
                "difference": 0.0,
                "unit": latest.unit,
                "direction": "initial",
                "statement": "Initial recorded baseline measurement."
            })

        trends_data[m_type] = {
            "metric_type": m_type,
            "unit": metric_meta["unit"],
            "has_sufficient_data": len(series) >= 2,
            "message": None if len(series) >= 2 else "Not enough historical data to display this trend.",
            "data": series,
            "latest_value": all_for_metric[0].value_primary if all_for_metric else None,
            "latest_secondary": all_for_metric[0].value_secondary if (all_for_metric and all_for_metric[0].value_secondary) else None
        }

    return {
        "time_range": time_range,
        "trends": trends_data,
        "comparisons": comparisons
    }

@router.post("/health-metrics", response_model=HealthMetricResponse)
def add_health_metric(
    req: HealthMetricCreate,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    metric = models.HealthMetric(
        id=str(uuid.uuid4()) if 'uuid' in globals() else None,
        patient_id=current_user.id,
        metric_type=req.metric_type,
        value_primary=req.value_primary,
        value_secondary=req.value_secondary,
        unit=req.unit,
        recorded_at=req.recorded_at or datetime.utcnow(),
        notes=req.notes
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)

    AuditService.log_event(
        db=db,
        action="ADD_HEALTH_METRIC",
        resource_type="HEALTH_METRIC",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=metric.id,
        details={"metric": metric.metric_type, "value": metric.value_primary}
    )

    return metric
