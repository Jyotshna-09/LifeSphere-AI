-- LifeSphere AI: Supabase PostgreSQL Schema Migration
-- Unified Lifelong Digital Health Ecosystem with Explainable AI

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    health_id VARCHAR(50) UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    dob DATE,
    gender VARCHAR(20),
    blood_group VARCHAR(10),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    address TEXT,
    allergies_summary TEXT,
    conditions_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Hospitals Table
CREATE TABLE IF NOT EXISTS hospitals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    contact_phone VARCHAR(50),
    contact_email VARCHAR(255),
    license_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    hospital_affiliation VARCHAR(255),
    consultation_fee NUMERIC(10, 2) DEFAULT 0.00,
    available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Medical Records (Core Unified Record Entity)
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    hospital_id UUID REFERENCES hospitals(id) ON DELETE SET NULL,
    record_type VARCHAR(50) NOT NULL CHECK (record_type IN (
        'Consultation', 'Diagnosis', 'Prescription', 'Laboratory Report',
        'X-Ray', 'Scan Report', 'Vaccination', 'Surgery', 'Medical Document', 'Other'
    )),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    hospital_name VARCHAR(255),
    doctor_name VARCHAR(255),
    document_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Consultations
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    chief_complaint TEXT,
    clinical_notes TEXT,
    provisional_diagnosis TEXT,
    recommendations TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Diagnoses
CREATE TABLE IF NOT EXISTS diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    condition_name VARCHAR(255) NOT NULL,
    icd10_code VARCHAR(20),
    severity VARCHAR(50) CHECK (severity IN ('Mild', 'Moderate', 'Severe', 'Critical')),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Managed', 'Resolved', 'Chronic')),
    diagnosed_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Lab Reports
CREATE TABLE IF NOT EXISTS lab_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    test_name VARCHAR(255) NOT NULL,
    test_category VARCHAR(100),
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    laboratory_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Prescriptions
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    instructions TEXT,
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Discontinued')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Medications Knowledge Reference
CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage_form VARCHAR(100),
    standard_dosage VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Patient Active/Historical Medications
CREATE TABLE IF NOT EXISTS patient_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
    medication_name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Allergies
CREATE TABLE IF NOT EXISTS allergies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    allergen_type VARCHAR(100) CHECK (allergen_type IN ('Drug', 'Food', 'Environmental', 'Other')),
    reaction VARCHAR(255),
    severity VARCHAR(50) CHECK (severity IN ('Mild', 'Moderate', 'Severe', 'Life-threatening')),
    diagnosed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Vaccinations
CREATE TABLE IF NOT EXISTS vaccinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    dose_number INT DEFAULT 1,
    administered_date DATE NOT NULL,
    administered_by VARCHAR(255),
    batch_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Surgeries
CREATE TABLE IF NOT EXISTS surgeries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    surgery_name VARCHAR(255) NOT NULL,
    hospital_name VARCHAR(255),
    surgeon_name VARCHAR(255),
    surgery_date DATE NOT NULL,
    outcome VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. Health Metrics (Biomarkers & Vitals)
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL CHECK (metric_type IN (
        'Blood Pressure', 'Fasting Glucose', 'Postprandial Glucose', 'Random Glucose',
        'HbA1c', 'Total Cholesterol', 'HDL', 'LDL', 'Triglycerides',
        'Heart Rate', 'Weight', 'BMI', 'Oxygen Saturation', 'Hemoglobin'
    )),
    value_primary NUMERIC(10, 2) NOT NULL,
    value_secondary NUMERIC(10, 2), -- e.g. Diastolic for BP
    unit VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Medical Documents (Uploaded Files)
CREATE TABLE IF NOT EXISTS medical_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(100),
    extracted_text TEXT,
    is_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Document Analyses (AI Structured Findings)
CREATE TABLE IF NOT EXISTS document_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES medical_documents(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    important_findings JSONB DEFAULT '[]'::jsonb,
    extracted_values JSONB DEFAULT '[]'::jsonb,
    reference_checks JSONB DEFAULT '[]'::jsonb,
    possible_concerns JSONB DEFAULT '[]'::jsonb,
    medical_terms JSONB DEFAULT '[]'::jsonb,
    disclaimer TEXT DEFAULT 'This information is for informational and decision-support purposes only and should be verified with a qualified healthcare professional.',
    confidence_score NUMERIC(5, 2) DEFAULT 0.95,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. AI Health Summaries (Comprehensive 10-Point Longitudinal Report)
CREATE TABLE IF NOT EXISTS ai_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_overview TEXT NOT NULL,
    medical_history TEXT NOT NULL,
    recent_events TEXT NOT NULL,
    current_medications TEXT NOT NULL,
    known_allergies TEXT NOT NULL,
    lab_trends TEXT NOT NULL,
    recorded_diagnoses TEXT NOT NULL,
    recent_changes TEXT NOT NULL,
    doctor_review_points TEXT NOT NULL,
    supporting_records JSONB DEFAULT '[]'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 19. Risk Predictions (Machine Learning Inference Log)
CREATE TABLE IF NOT EXISTS risk_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id_display VARCHAR(50) NOT NULL,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    model_name VARCHAR(100) NOT NULL,
    probability NUMERIC(6, 4) NOT NULL,
    risk_category VARCHAR(50) NOT NULL CHECK (risk_category IN ('Low Risk', 'Moderate Risk', 'Elevated Risk')),
    features_used JSONB NOT NULL,
    shap_summary JSONB NOT NULL,
    disclaimer TEXT DEFAULT 'This is an AI-based research/decision-support estimate and NOT a medical diagnosis.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 20. Risk Prediction Features (Individual Feature SHAP Contributions)
CREATE TABLE IF NOT EXISTS risk_prediction_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prediction_id UUID NOT NULL REFERENCES risk_predictions(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value NUMERIC(12, 4) NOT NULL,
    shap_value NUMERIC(12, 6) NOT NULL,
    feature_impact VARCHAR(20) CHECK (feature_impact IN ('Increases Risk', 'Decreases Risk', 'Neutral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 21. Consents (Patient Controlled Doctor Access Policy)
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    access_status VARCHAR(50) DEFAULT 'Pending' CHECK (access_status IN ('Granted', 'Pending', 'Rejected', 'Revoked')),
    permissions JSONB DEFAULT '{"medical_records": true, "lab_reports": true, "prescriptions": true, "timeline": true, "health_trends": true, "ai_summary": true, "documents": true, "risk_assessment": true}'::jsonb,
    granted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 22. Doctor Patient Access (Enforcement Mapping)
CREATE TABLE IF NOT EXISTS doctor_patient_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    consent_id UUID REFERENCES consents(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 23. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 24. Audit Logs (Tamper-evident Security Log)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Success',
    ip_address VARCHAR(50),
    user_agent TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 25. Medication Interactions Knowledge Base
CREATE TABLE IF NOT EXISTS medication_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medication_a VARCHAR(255) NOT NULL,
    medication_b VARCHAR(255) NOT NULL,
    interaction_description TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL CHECK (severity IN ('Major', 'Moderate', 'Minor')),
    clinical_advice TEXT,
    source VARCHAR(255) DEFAULT 'Clinical Pharmacology Reference'
);

-- 26. Duplicate Test Alerts
CREATE TABLE IF NOT EXISTS duplicate_test_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    current_test_name VARCHAR(255) NOT NULL,
    previous_test_name VARCHAR(255) NOT NULL,
    current_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    previous_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
    days_difference INT NOT NULL,
    alert_reason TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_records_date ON medical_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_patient ON health_metrics(patient_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_metrics_recorded ON health_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_docs_patient ON medical_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_consents_patient ON consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_consents_doctor ON consents(doctor_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_patient ON risk_predictions(patient_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_summaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Allow users access to own data, or doctors with active consent)
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Patients view own data" ON patients FOR ALL USING (auth.uid() = id);
CREATE POLICY "Patients manage own records" ON medical_records FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "Patients manage own metrics" ON health_metrics FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "Patients manage own documents" ON medical_documents FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "Patients manage own predictions" ON risk_predictions FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "Patients manage own consents" ON consents FOR ALL USING (auth.uid() = patient_id);
CREATE POLICY "Doctors view granted consents" ON consents FOR SELECT USING (auth.uid() = doctor_id);
CREATE POLICY "Users view own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);
