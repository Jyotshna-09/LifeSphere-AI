"""
LifeSphere AI - SQLAlchemy Models
Corresponds directly to the Supabase PostgreSQL Schema.
"""
import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Float, ForeignKey, DateTime, Date, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(100), unique=True, nullable=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=True) # For direct auth demonstration
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(20), nullable=False, default="patient") # 'patient', 'doctor', 'admin'
    health_id = Column(String(50), unique=True, nullable=True, index=True)
    avatar_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient_details = relationship("Patient", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    doctor_details = relationship("Doctor", back_populates="profile", uselist=False, cascade="all, delete-orphan")
    medical_records = relationship("MedicalRecord", back_populates="patient", foreign_keys="MedicalRecord.patient_id")
    health_metrics = relationship("HealthMetric", back_populates="patient")
    documents = relationship("MedicalDocument", back_populates="patient")
    predictions = relationship("RiskPrediction", back_populates="patient")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Patient(Base):
    __tablename__ = "patients"

    id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    dob = Column(Date, nullable=True)
    gender = Column(String(20), nullable=True)
    blood_group = Column(String(10), nullable=True)
    emergency_contact_name = Column(String(255), nullable=True)
    emergency_contact_phone = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    allergies_summary = Column(Text, nullable=True)
    conditions_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="patient_details")

class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(255), nullable=True)
    license_no = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), primary_key=True)
    specialization = Column(String(255), nullable=False)
    license_number = Column(String(100), unique=True, nullable=False)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    hospital_affiliation = Column(String(255), nullable=True)
    consultation_fee = Column(Float, default=0.0)
    available_days = Column(String(100), default="Mon,Tue,Wed,Thu,Fri")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship("Profile", back_populates="doctor_details")

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    hospital_id = Column(String(36), ForeignKey("hospitals.id", ondelete="SET NULL"), nullable=True)
    record_type = Column(String(50), nullable=False) # 'Consultation', 'Diagnosis', 'Prescription', 'Laboratory Report', etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    record_date = Column(Date, default=date.today, nullable=False, index=True)
    hospital_name = Column(String(255), nullable=True)
    doctor_name = Column(String(255), nullable=True)
    document_url = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient = relationship("Profile", foreign_keys=[patient_id], back_populates="medical_records")
    doctor = relationship("Profile", foreign_keys=[doctor_id])

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    record_id = Column(String(36), ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=True)
    consultation_date = Column(Date, default=date.today, nullable=False)
    chief_complaint = Column(Text, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    provisional_diagnosis = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    follow_up_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    record_id = Column(String(36), ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=True)
    condition_name = Column(String(255), nullable=False)
    icd10_code = Column(String(20), nullable=True)
    severity = Column(String(50), nullable=True) # Mild, Moderate, Severe, Critical
    status = Column(String(50), default="Active") # Active, Managed, Resolved, Chronic
    diagnosed_date = Column(Date, default=date.today, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class LabReport(Base):
    __tablename__ = "lab_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    record_id = Column(String(36), ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=True)
    test_name = Column(String(255), nullable=False)
    test_category = Column(String(100), nullable=True)
    test_date = Column(Date, default=date.today, nullable=False)
    laboratory_name = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Prescription(Base):
    __tablename__ = "prescriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    doctor_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    record_id = Column(String(36), ForeignKey("medical_records.id", ondelete="CASCADE"), nullable=True)
    prescription_date = Column(Date, default=date.today, nullable=False)
    instructions = Column(Text, nullable=True)
    status = Column(String(50), default="Active") # Active, Completed, Discontinued
    created_at = Column(DateTime, default=datetime.utcnow)

class PatientMedication(Base):
    __tablename__ = "patient_medications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    prescription_id = Column(String(36), ForeignKey("prescriptions.id", ondelete="SET NULL"), nullable=True)
    medication_name = Column(String(255), nullable=False)
    generic_name = Column(String(255), nullable=True)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(100), nullable=False)
    start_date = Column(Date, default=date.today, nullable=False)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Allergy(Base):
    __tablename__ = "allergies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    allergen = Column(String(255), nullable=False)
    allergen_type = Column(String(100), nullable=True)
    reaction = Column(String(255), nullable=True)
    severity = Column(String(50), nullable=True)
    diagnosed_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Vaccination(Base):
    __tablename__ = "vaccinations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    vaccine_name = Column(String(255), nullable=False)
    dose_number = Column(Integer, default=1)
    administered_date = Column(Date, nullable=False)
    administered_by = Column(String(255), nullable=True)
    batch_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Surgery(Base):
    __tablename__ = "surgeries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    surgery_name = Column(String(255), nullable=False)
    hospital_name = Column(String(255), nullable=True)
    surgeon_name = Column(String(255), nullable=True)
    surgery_date = Column(Date, nullable=False)
    outcome = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class HealthMetric(Base):
    __tablename__ = "health_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    metric_type = Column(String(100), nullable=False) # 'Blood Pressure', 'Fasting Glucose', 'BMI', etc.
    value_primary = Column(Float, nullable=False)
    value_secondary = Column(Float, nullable=True)
    unit = Column(String(50), nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Profile", back_populates="health_metrics")

class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    record_id = Column(String(36), ForeignKey("medical_records.id", ondelete="SET NULL"), nullable=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_path = Column(Text, nullable=False)
    mime_type = Column(String(100), nullable=True)
    extracted_text = Column(Text, nullable=True)
    is_processed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Profile", back_populates="documents")
    analysis = relationship("DocumentAnalysis", back_populates="document", uselist=False, cascade="all, delete-orphan")

class DocumentAnalysis(Base):
    __tablename__ = "document_analyses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("medical_documents.id", ondelete="CASCADE"), nullable=False)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    summary = Column(Text, nullable=False)
    important_findings = Column(JSON, default=list)
    extracted_values = Column(JSON, default=list)
    reference_checks = Column(JSON, default=list)
    possible_concerns = Column(JSON, default=list)
    medical_terms = Column(JSON, default=list)
    disclaimer = Column(Text, default="This information is for informational and decision-support purposes only and should be verified with a qualified healthcare professional.")
    confidence_score = Column(Float, default=0.95)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("MedicalDocument", back_populates="analysis")

class AISummary(Base):
    __tablename__ = "ai_summaries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_overview = Column(Text, nullable=False)
    medical_history = Column(Text, nullable=False)
    recent_events = Column(Text, nullable=False)
    current_medications = Column(Text, nullable=False)
    known_allergies = Column(Text, nullable=False)
    lab_trends = Column(Text, nullable=False)
    recorded_diagnoses = Column(Text, nullable=False)
    recent_changes = Column(Text, nullable=False)
    doctor_review_points = Column(Text, nullable=False)
    supporting_records = Column(JSON, default=list)
    generated_at = Column(DateTime, default=datetime.utcnow)

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prediction_id_display = Column(String(50), nullable=False)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    model_name = Column(String(100), nullable=False)
    probability = Column(Float, nullable=False)
    risk_category = Column(String(50), nullable=False) # 'Low Risk', 'Moderate Risk', 'Elevated Risk'
    features_used = Column(JSON, nullable=False)
    shap_summary = Column(JSON, nullable=False)
    disclaimer = Column(Text, default="This is an AI-based research/decision-support estimate and NOT a medical diagnosis.")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Profile", back_populates="predictions")
    feature_contributions = relationship("RiskPredictionFeature", back_populates="prediction", cascade="all, delete-orphan")

class RiskPredictionFeature(Base):
    __tablename__ = "risk_prediction_features"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prediction_id = Column(String(36), ForeignKey("risk_predictions.id", ondelete="CASCADE"), nullable=False)
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(Float, nullable=False)
    shap_value = Column(Float, nullable=False)
    feature_impact = Column(String(20), nullable=False) # 'Increases Risk', 'Decreases Risk', 'Neutral'
    created_at = Column(DateTime, default=datetime.utcnow)

    prediction = relationship("RiskPrediction", back_populates="feature_contributions")

class Consent(Base):
    __tablename__ = "consents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    doctor_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    access_status = Column(String(50), default="Pending") # 'Granted', 'Pending', 'Rejected', 'Revoked'
    permissions = Column(JSON, default=dict)
    granted_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DoctorPatientAccess(Base):
    __tablename__ = "doctor_patient_access"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    doctor_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    consent_id = Column(String(36), ForeignKey("consents.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    last_accessed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False) # 'consent', 'clinical_alert', 'document', 'system'
    is_read = Column(Boolean, default=False)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("Profile", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    user_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(100), nullable=True)
    status = Column(String(50), default="Success")
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(Text, nullable=True)
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("Profile", back_populates="audit_logs")

class MedicationInteraction(Base):
    __tablename__ = "medication_interactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    medication_a = Column(String(255), nullable=False)
    medication_b = Column(String(255), nullable=False)
    interaction_description = Column(Text, nullable=False)
    severity = Column(String(50), nullable=False) # 'Major', 'Moderate', 'Minor'
    clinical_advice = Column(Text, nullable=True)
    source = Column(String(255), default="Clinical Pharmacology Reference")

class DuplicateTestAlert(Base):
    __tablename__ = "duplicate_test_alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    patient_id = Column(String(36), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    current_test_name = Column(String(255), nullable=False)
    previous_test_name = Column(String(255), nullable=False)
    current_record_id = Column(String(36), ForeignKey("medical_records.id", ondelete="SET NULL"), nullable=True)
    previous_record_id = Column(String(36), ForeignKey("medical_records.id", ondelete="SET NULL"), nullable=True)
    days_difference = Column(Integer, nullable=False)
    alert_reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
