"""
LifeSphere AI - Machine Learning Prediction & Real SHAP Explainability Endpoints
"""
import os
import json
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config import MODELS_DIR
from app.db.database import get_db
from app.db import models
from app.schemas.schemas import PredictionRequest, PredictionResponse
from app.security.auth import get_current_user
from app.ml.predictor import risk_predictor
from app.services.audit_service import AuditService

router = APIRouter(prefix="/ml", tags=["Machine Learning & Explainable AI"])

@router.post("/predict", response_model=PredictionResponse)
def predict_risk(
    req: PredictionRequest,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    features_dict = {
        'Pregnancies': req.Pregnancies,
        'Glucose': req.Glucose,
        'BloodPressure': req.BloodPressure,
        'SkinThickness': req.SkinThickness,
        'Insulin': req.Insulin,
        'BMI': req.BMI,
        'DiabetesPedigreeFunction': req.DiabetesPedigreeFunction,
        'Age': req.Age
    }

    # Execute real model inference and mathematical SHAP computation
    result = risk_predictor.predict_risk(
        features=features_dict,
        model_name=req.model_name
    )

    # Persist in database
    prediction_record = models.RiskPrediction(
        id=str(uuid.uuid4()),
        prediction_id_display=result["prediction_id_display"],
        patient_id=current_user.id,
        model_name=result["model_name"],
        probability=result["probability"],
        risk_category=result["risk_category"],
        features_used=result["features_used"],
        shap_summary=[item for item in result["shap_contributions"]],
        disclaimer=result["disclaimer"]
    )
    db.add(prediction_record)

    # Add individual SHAP feature contributions
    for item in result["shap_contributions"]:
        feat_record = models.RiskPredictionFeature(
            prediction_id=prediction_record.id,
            feature_name=item["feature_name"],
            feature_value=item["feature_value"],
            shap_value=item["shap_value"],
            feature_impact=item["feature_impact"]
        )
        db.add(feat_record)

    db.commit()

    # Audit log
    AuditService.log_event(
        db=db,
        action="ML_RISK_PREDICTION",
        resource_type="RISK_PREDICTION",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=prediction_record.prediction_id_display,
        details={
            "model": result["model_name"],
            "probability": result["probability"],
            "risk_category": result["risk_category"]
        }
    )

    return result

@router.get("/predictions")
def get_prediction_history(
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

    preds = db.query(models.RiskPrediction).filter(
        models.RiskPrediction.patient_id == target_patient_id
    ).order_by(models.RiskPrediction.created_at.desc()).all()

    return [
        {
            "id": p.id,
            "prediction_id_display": p.prediction_id_display,
            "model_name": p.model_name,
            "probability": p.probability,
            "probability_percentage": round(p.probability * 100, 1),
            "risk_category": p.risk_category,
            "created_at": p.created_at.strftime("%b %d, %Y %H:%M"),
            "features_used": p.features_used,
            "shap_summary": p.shap_summary
        }
        for p in preds
    ]

@router.get("/predictions/{prediction_id}")
def get_prediction_detail(
    prediction_id: str,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pred = db.query(models.RiskPrediction).filter(
        (models.RiskPrediction.id == prediction_id) |
        (models.RiskPrediction.prediction_id_display == prediction_id)
    ).first()

    if not pred:
        raise HTTPException(status_code=404, detail="Prediction not found")

    # Authorization
    if current_user.role == "patient" and pred.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to prediction")

    return {
        "id": pred.id,
        "prediction_id_display": pred.prediction_id_display,
        "model_name": pred.model_name,
        "probability": pred.probability,
        "probability_percentage": round(pred.probability * 100, 1),
        "risk_category": pred.risk_category,
        "created_at": pred.created_at.strftime("%b %d, %Y %H:%M"),
        "features_used": pred.features_used,
        "shap_contributions": pred.shap_summary,
        "disclaimer": pred.disclaimer
    }

@router.get("/insights")
def get_ml_insights():
    """
    Returns authentic training metrics, ROC-AUC, confusion matrices, and feature importances
    generated directly from model training.
    """
    metrics_file = os.path.join(MODELS_DIR, "evaluation_metrics.json")
    if not os.path.exists(metrics_file):
        raise HTTPException(status_code=404, detail="Evaluation metrics not found. Train models first.")

    with open(metrics_file, "r") as f:
        data = json.load(f)

    return data
