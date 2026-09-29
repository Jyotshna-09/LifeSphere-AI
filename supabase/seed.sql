-- LifeSphere AI: Comprehensive Demonstration Seed Data
-- Fictional academic demonstration records for B.Tech review presentation

-- Fixed Demo UUIDs for seamless testing
-- Patient 1: John Doe (patient@lifesphere.ai)
-- Patient 2: Sarah Connor (sarah@lifesphere.ai)
-- Doctor 1: Dr. Marcus Vance (dr.vance@lifesphere.ai - Cardiologist)
-- Doctor 2: Dr. Elena Rostova (dr.rostova@lifesphere.ai - Endocrinologist)
-- Admin: Admin User (admin@lifesphere.ai)

-- 1. Demo Hospital
INSERT INTO hospitals (id, name, address, contact_phone, contact_email, license_no)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'MetroHealth Academic Medical Center', '742 Healthcare Ave, Silicon Valley, CA', '+1-800-555-0199', 'info@metrohealth.org', 'HOSP-CA-98421'),
    ('22222222-2222-2222-2222-222222222222', 'St. Jude Specialty Care & Research Institute', '120 Innovation Blvd, Cambridge, MA', '+1-800-555-0244', 'contact@stjude-spec.org', 'HOSP-MA-11029')
ON CONFLICT (id) DO NOTHING;

-- 2. User Profiles
INSERT INTO profiles (id, email, full_name, phone, role, health_id, avatar_url)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'patient@lifesphere.ai', 'Johnathan Doe', '+1-555-123-4567', 'patient', 'LSP-928104', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
    ('a0000000-0000-0000-0000-000000000002', 'sarah@lifesphere.ai', 'Sarah M. Connor', '+1-555-234-5678', 'patient', 'LSP-441829', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
    ('b0000000-0000-0000-0000-000000000001', 'dr.vance@lifesphere.ai', 'Dr. Marcus Vance, MD, FACC', '+1-555-888-0001', 'doctor', 'LSP-DOC-001', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'),
    ('b0000000-0000-0000-0000-000000000002', 'dr.rostova@lifesphere.ai', 'Dr. Elena Rostova, MD, PhD', '+1-555-888-0002', 'doctor', 'LSP-DOC-002', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150'),
    ('c0000000-0000-0000-0000-000000000001', 'admin@lifesphere.ai', 'System Administrator', '+1-555-999-0000', 'admin', 'LSP-ADM-001', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150')
ON CONFLICT (id) DO NOTHING;

-- 3. Patient Details
INSERT INTO patients (id, dob, gender, blood_group, emergency_contact_name, emergency_contact_phone, address, allergies_summary, conditions_summary)
VALUES
    ('a0000000-0000-0000-0000-000000000001', '1985-06-15', 'Male', 'O+', 'Jane Doe (Spouse)', '+1-555-123-9999', '142 Market Street, San Francisco, CA', 'Penicillin (Severe Hives)', 'Essential Hypertension, Impaired Fasting Glucose'),
    ('a0000000-0000-0000-0000-000000000002', '1992-11-20', 'Female', 'A-', 'Kyle Reese (Brother)', '+1-555-234-8888', '890 Sunset Blvd, Los Angeles, CA', 'Sulfa Drugs', 'Mild Asthma')
ON CONFLICT (id) DO NOTHING;

-- 4. Doctor Details
INSERT INTO doctors (id, specialization, license_number, hospital_id, hospital_affiliation, consultation_fee, available_days)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Cardiology & Internal Medicine', 'MED-CA-992140', '11111111-1111-1111-1111-111111111111', 'MetroHealth Academic Medical Center', 150.00, 'Mon,Tue,Wed,Thu,Fri'),
    ('b0000000-0000-0000-0000-000000000002', 'Endocrinology & Diabetology', 'MED-MA-448102', '22222222-2222-2222-2222-222222222222', 'St. Jude Specialty Care & Research Institute', 180.00, 'Tue,Wed,Thu,Sat')
ON CONFLICT (id) DO NOTHING;

-- 5. Medical Records for Patient Johnathan Doe
INSERT INTO medical_records (id, patient_id, doctor_id, hospital_id, record_type, title, description, record_date, hospital_name, doctor_name, is_verified)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Consultation', 'Annual Comprehensive Cardiovascular & Metabolic Evaluation', 'Comprehensive checkup for BP monitoring and fasting glucose management. Mildly elevated systolic blood pressure noted.', '2026-08-10', 'MetroHealth Academic Medical Center', 'Dr. Marcus Vance, MD', TRUE),
    ('d0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Laboratory Report', 'Comprehensive Metabolic Panel (CMP) & HbA1c', 'Fasting blood glucose, lipid profile, and HbA1c panel performed after 10-hour fast.', '2026-08-12', 'MetroHealth Clinical Laboratory', 'Dr. Marcus Vance, MD', TRUE),
    ('d0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Prescription', 'Antihypertensive & Cardiometabolic Therapy Plan', 'Prescription for blood pressure regulation and dietary lifestyle modification.', '2026-08-14', 'MetroHealth Pharmacy Services', 'Dr. Marcus Vance, MD', TRUE),
    ('d0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Laboratory Report', 'Follow-up Fasting Blood Glucose & Lipid Panel', 'Follow-up laboratory assessment to evaluate dietary intervention and medication response.', '2026-09-02', 'St. Jude Diagnostic Labs', 'Dr. Elena Rostova, MD', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 6. Health Metrics (Biomarkers with longitudinal history)
INSERT INTO health_metrics (patient_id, metric_type, value_primary, value_secondary, unit, recorded_at, notes)
VALUES
    -- Blood Pressure History
    ('a0000000-0000-0000-0000-000000000001', 'Blood Pressure', 142.00, 92.00, 'mmHg', '2026-06-01 09:00:00+00', 'Initial clinical visit reading'),
    ('a0000000-0000-0000-0000-000000000001', 'Blood Pressure', 138.00, 88.00, 'mmHg', '2026-07-05 08:30:00+00', 'Home automated cuff monitoring'),
    ('a0000000-0000-0000-0000-000000000001', 'Blood Pressure', 134.00, 86.00, 'mmHg', '2026-08-10 10:15:00+00', 'Post-consultation follow-up reading'),
    ('a0000000-0000-0000-0000-000000000001', 'Blood Pressure', 128.00, 82.00, 'mmHg', '2026-09-10 09:00:00+00', 'Follow-up showing improvement after therapy'),

    -- Fasting Glucose History (demonstrates comparison: previous 122 -> latest 135)
    ('a0000000-0000-0000-0000-000000000001', 'Fasting Glucose', 114.00, NULL, 'mg/dL', '2026-06-01 08:00:00+00', 'Baseline fasting assessment'),
    ('a0000000-0000-0000-0000-000000000001', 'Fasting Glucose', 122.00, NULL, 'mg/dL', '2026-08-12 08:00:00+00', 'Laboratory CMP panel test'),
    ('a0000000-0000-0000-0000-000000000001', 'Fasting Glucose', 135.00, NULL, 'mg/dL', '2026-09-02 08:00:00+00', 'Follow-up fasting panel - elevated'),

    -- Total Cholesterol History
    ('a0000000-0000-0000-0000-000000000001', 'Total Cholesterol', 218.00, NULL, 'mg/dL', '2026-06-01 08:00:00+00', 'Baseline screening'),
    ('a0000000-0000-0000-0000-000000000001', 'Total Cholesterol', 205.00, NULL, 'mg/dL', '2026-08-12 08:00:00+00', 'CMP lipid breakdown'),
    ('a0000000-0000-0000-0000-000000000001', 'Total Cholesterol', 198.00, NULL, 'mg/dL', '2026-09-02 08:00:00+00', 'Showing dietary improvement'),

    -- Weight & BMI
    ('a0000000-0000-0000-0000-000000000001', 'Weight', 84.50, NULL, 'kg', '2026-06-01 09:00:00+00', 'Baseline scale weight'),
    ('a0000000-0000-0000-0000-000000000001', 'Weight', 83.20, NULL, 'kg', '2026-08-10 09:00:00+00', 'Down 1.3 kg'),
    ('a0000000-0000-0000-0000-000000000001', 'BMI', 27.60, NULL, 'kg/m²', '2026-06-01 09:00:00+00', 'Overweight category'),
    ('a0000000-0000-0000-0000-000000000001', 'BMI', 27.10, NULL, 'kg/m²', '2026-08-10 09:00:00+00', 'Progress recorded'),

    -- Heart Rate
    ('a0000000-0000-0000-0000-000000000001', 'Heart Rate', 78.00, NULL, 'bpm', '2026-08-10 09:00:00+00', 'Resting pulse'),
    ('a0000000-0000-0000-0000-000000000001', 'Heart Rate', 74.00, NULL, 'bpm', '2026-09-10 09:00:00+00', 'Good resting rhythm')
ON CONFLICT DO NOTHING;

-- 7. Active Patient Medications
INSERT INTO patient_medications (patient_id, medication_name, generic_name, dosage, frequency, start_date, is_active, notes)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Lisinopril', 'Lisinopril', '10 mg', 'Once daily in the morning', '2026-08-14', TRUE, 'For blood pressure control'),
    ('a0000000-0000-0000-0000-000000000001', 'Metformin', 'Metformin Hydrochloride', '500 mg', 'Twice daily with meals', '2026-08-15', TRUE, 'For glycemic regulation'),
    ('a0000000-0000-0000-0000-000000000001', 'Atorvastatin', 'Atorvastatin Calcium', '20 mg', 'Once daily at bedtime', '2026-08-14', TRUE, 'For lipid management')
ON CONFLICT DO NOTHING;

-- 8. Known Medication Interactions Reference Base
INSERT INTO medication_interactions (medication_a, medication_b, interaction_description, severity, clinical_advice, source)
VALUES
    ('Lisinopril', 'Spironolactone', 'Concurrent use may result in severe hyperkalemia due to additive potassium-sparing effects.', 'Major', 'Monitor serum potassium and renal function closely.', 'Lexicomp Drug Interactions'),
    ('Lisinopril', 'Ibuprofen', 'NSAIDs may decrease the antihypertensive effect of ACE inhibitors and increase the risk of acute renal impairment.', 'Moderate', 'Consider alternative analgesics like acetaminophen. Monitor blood pressure and renal parameters.', 'DrugBank Clinical Knowledgebase'),
    ('Metformin', 'Contrast Media (Iodinated)', 'Presents increased risk of lactic acidosis and contrast-induced nephropathy.', 'Major', 'Temporarily withhold Metformin 48 hours before and after contrast-enhanced imaging.', 'FDA Drug Safety Communication'),
    ('Atorvastatin', 'Clarithromycin', 'Macrolide antibiotic significantly increases serum concentration of atorvastatin, increasing risk of myopathy or rhabdomyolysis.', 'Major', 'Avoid co-administration or temporarily suspend atorvastatin during macrolide therapy.', 'AHA Scientific Statement')
ON CONFLICT DO NOTHING;

-- 9. Consents & Access Controls
INSERT INTO consents (id, patient_id, doctor_id, access_status, permissions, granted_at, expires_at)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Granted', '{"medical_records": true, "lab_reports": true, "prescriptions": true, "timeline": true, "health_trends": true, "ai_summary": true, "documents": true, "risk_assessment": true}'::jsonb, '2026-08-10 10:00:00+00', '2027-08-10 10:00:00+00'),
    ('e0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000002', 'Pending', '{"medical_records": true, "lab_reports": true, "prescriptions": true, "timeline": true, "health_trends": true, "ai_summary": true, "documents": false, "risk_assessment": true}'::jsonb, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO doctor_patient_access (doctor_id, patient_id, consent_id, is_active, last_accessed_at)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', TRUE, '2026-09-12 14:20:00+00')
ON CONFLICT DO NOTHING;

-- 10. Audit Logs Demonstration
INSERT INTO audit_logs (user_id, user_role, action, resource_type, resource_id, status, ip_address, details)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'patient', 'AUTH_LOGIN', 'SESSION', 'a0000000-0000-0000-0000-000000000001', 'Success', '192.168.1.45', '{"method": "password", "client": "Chrome 128 / Windows"}'::jsonb),
    ('a0000000-0000-0000-0000-000000000001', 'patient', 'CONSENT_GRANTED', 'CONSENT', 'e0000000-0000-0000-0000-000000000001', 'Success', '192.168.1.45', '{"doctor_name": "Dr. Marcus Vance", "permissions_count": 8}'::jsonb),
    ('b0000000-0000-0000-0000-000000000001', 'doctor', 'VIEW_PATIENT_RECORDS', 'MEDICAL_RECORDS', 'a0000000-0000-0000-0000-000000000001', 'Success', '10.0.4.12', '{"authorized_by_consent": "e0000000-0000-0000-0000-000000000001"}'::jsonb),
    ('a0000000-0000-0000-0000-000000000001', 'patient', 'ML_RISK_PREDICTION', 'RISK_MODEL', 'LSP-PRD-88219', 'Success', '192.168.1.45', '{"model": "Random Forest", "risk_category": "Moderate Risk", "shap_features": 8}'::jsonb)
ON CONFLICT DO NOTHING;

-- 11. Initial Notifications
INSERT INTO notifications (user_id, title, message, notification_type, is_read, metadata)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Doctor Access Granted', 'Dr. Marcus Vance was granted access to your medical history and health trends.', 'consent', FALSE, '{"doctor_id": "b0000000-0000-0000-0000-000000000001"}'::jsonb),
    ('a0000000-0000-0000-0000-000000000001', 'Health Trend Alert', 'Fasting glucose increased by 13 mg/dL compared with your previous test on Aug 12.', 'clinical_alert', FALSE, '{"metric": "Fasting Glucose", "delta": "+13 mg/dL"}'::jsonb),
    ('b0000000-0000-0000-0000-000000000001', 'New Authorized Patient', 'Johnathan Doe granted you access to their medical records and longitudinal timeline.', 'consent', TRUE, '{"patient_id": "a0000000-0000-0000-0000-000000000001"}'::jsonb)
ON CONFLICT DO NOTHING;
