"""
LifeSphere AI - Pydantic Request & Response Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# --- Auth Schemas ---
class UserRegister(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    password: str
    confirm_password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str = Field(default="patient") # 'patient', 'doctor', 'admin'
    dob: Optional[date] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    hospital_affiliation: Optional[str] = None
    department: Optional[str] = None

class UserLogin(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

class SwitchDemoUser(BaseModel):
    role: str # 'patient', 'doctor', 'admin'

class UserProfileResponse(BaseModel):
    id: str
    username: Optional[str] = None
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    health_id: Optional[str] = None
    avatar_url: Optional[str] = None
    patient_details: Optional[Dict[str, Any]] = None
    doctor_details: Optional[Dict[str, Any]] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse

# --- Medical Records ---
class MedicalRecordCreate(BaseModel):
    record_type: str
    title: str
    description: Optional[str] = None
    record_date: Optional[date] = None
    hospital_name: Optional[str] = None
    doctor_name: Optional[str] = None
    document_url: Optional[str] = None

class MedicalRecordResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: Optional[str]
    record_type: str
    title: str
    description: Optional[str]
    record_date: date
    hospital_name: Optional[str]
    doctor_name: Optional[str]
    document_url: Optional[str]
    is_verified: bool
    created_at: datetime

# --- Health Metrics ---
class HealthMetricCreate(BaseModel):
    metric_type: str
    value_primary: float
    value_secondary: Optional[float] = None
    unit: str
    notes: Optional[str] = None
    recorded_at: Optional[datetime] = None

class HealthMetricResponse(BaseModel):
    id: str
    patient_id: str
    metric_type: str
    value_primary: float
    value_secondary: Optional[float]
    unit: str
    recorded_at: datetime
    notes: Optional[str]

# --- ML & SHAP Schemas ---
class PredictionRequest(BaseModel):
    model_name: str = "random_forest"
    Pregnancies: float = 2.0
    Glucose: float = 120.0
    BloodPressure: float = 75.0
    SkinThickness: float = 20.0
    Insulin: float = 80.0
    BMI: float = 28.5
    DiabetesPedigreeFunction: float = 0.45
    Age: float = 40.0

class ShapContribution(BaseModel):
    feature_name: str
    feature_value: float
    shap_value: float
    abs_shap: float
    feature_impact: str
    clinical_meaning: str

class PredictionResponse(BaseModel):
    prediction_id_display: str
    model_name: str
    probability: float
    probability_percentage: float
    risk_category: str
    risk_description: str
    features_used: Dict[str, float]
    shap_contributions: List[ShapContribution]
    disclaimer: str
    timestamp: str

# --- Consent Schemas ---
class ConsentGrantRequest(BaseModel):
    doctor_id: str
    permissions: Optional[Dict[str, bool]] = None

class ConsentResponse(BaseModel):
    id: str
    patient_id: str
    doctor_id: str
    doctor_name: Optional[str]
    doctor_specialization: Optional[str]
    access_status: str
    permissions: Dict[str, bool]
    granted_at: Optional[datetime]
    expires_at: Optional[datetime]
    revoked_at: Optional[datetime]

# --- Audit Logs ---
class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    user_role: Optional[str]
    action: str
    resource_type: str
    resource_id: Optional[str]
    status: str
    ip_address: Optional[str]
    details: Dict[str, Any]
    created_at: datetime
