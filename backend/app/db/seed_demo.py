"""
LifeSphere AI - Demonstration Data Seeder
Populates initial rich clinical demonstration data into the database.
"""
from datetime import datetime, date, timedelta
from app.db.database import SessionLocal, Base, engine
from app.db import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(models.Profile).first():
        print("Database already contains data. Skipping initial seeding.")
        db.close()
        return

    print("Seeding rich clinical demonstration data...")

    # 1. Hospitals
    hosp1 = models.Hospital(
        id="11111111-1111-1111-1111-111111111111",
        name="MetroHealth Academic Medical Center",
        address="742 Healthcare Ave, Silicon Valley, CA",
        contact_phone="+1-800-555-0199",
        contact_email="info@metrohealth.org",
        license_no="HOSP-CA-98421"
    )
    hosp2 = models.Hospital(
        id="22222222-2222-2222-2222-222222222222",
        name="St. Jude Specialty Care & Research Institute",
        address="120 Innovation Blvd, Cambridge, MA",
        contact_phone="+1-800-555-0244",
        contact_email="contact@stjude-spec.org",
        license_no="HOSP-MA-11029"
    )
    db.add_all([hosp1, hosp2])

    # 2. Profiles (Password for all demo accounts is 'password123')
    patient1_prof = models.Profile(
        id="a0000000-0000-0000-0000-000000000001",
        username="patient",
        email="patient@lifesphere.ai",
        password_hash="password123", # Plaintext or simple hash for prototype review
        full_name="Johnathan Doe",
        phone="+1-555-123-4567",
        role="patient",
        health_id="LSP-928104",
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
    )
    patient2_prof = models.Profile(
        id="a0000000-0000-0000-0000-000000000002",
        username="sarah",
        email="sarah@lifesphere.ai",
        password_hash="password123",
        full_name="Sarah M. Connor",
        phone="+1-555-234-5678",
        role="patient",
        health_id="LSP-441829",
        avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
    )
    doc1_prof = models.Profile(
        id="b0000000-0000-0000-0000-000000000001",
        username="doctor",
        email="dr.vance@lifesphere.ai",
        password_hash="password123",
        full_name="Dr. Marcus Vance, MD, FACC",
        phone="+1-555-888-0001",
        role="doctor",
        health_id="LSP-DOC-001",
        avatar_url="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"
    )
    doc2_prof = models.Profile(
        id="b0000000-0000-0000-0000-000000000002",
        username="rostova",
        email="dr.rostova@lifesphere.ai",
        password_hash="password123",
        full_name="Dr. Elena Rostova, MD, PhD",
        phone="+1-555-888-0002",
        role="doctor",
        health_id="LSP-DOC-002",
        avatar_url="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150"
    )
    admin_prof = models.Profile(
        id="c0000000-0000-0000-0000-000000000001",
        username="admin",
        email="admin@lifesphere.ai",
        password_hash="password123",
        full_name="System Administrator",
        phone="+1-555-999-0000",
        role="admin",
        health_id="LSP-ADM-001",
        avatar_url="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
    )
    db.add_all([patient1_prof, patient2_prof, doc1_prof, doc2_prof, admin_prof])

    # 3. Patient Details
    pat1_details = models.Patient(
        id="a0000000-0000-0000-0000-000000000001",
        dob=date(1985, 6, 15),
        gender="Male",
        blood_group="O+",
        emergency_contact_name="Jane Doe (Spouse)",
        emergency_contact_phone="+1-555-123-9999",
        address="142 Market Street, San Francisco, CA",
        allergies_summary="Penicillin (Severe Hives)",
        conditions_summary="Essential Hypertension, Impaired Fasting Glucose"
    )
    pat2_details = models.Patient(
        id="a0000000-0000-0000-0000-000000000002",
        dob=date(1992, 11, 20),
        gender="Female",
        blood_group="A-",
        emergency_contact_name="Kyle Reese (Brother)",
        emergency_contact_phone="+1-555-234-8888",
        address="890 Sunset Blvd, Los Angeles, CA",
        allergies_summary="Sulfa Drugs",
        conditions_summary="Mild Asthma"
    )
    db.add_all([pat1_details, pat2_details])

    # 4. Doctor Details
    doc1_details = models.Doctor(
        id="b0000000-0000-0000-0000-000000000001",
        specialization="Cardiology & Internal Medicine",
        license_number="MED-CA-992140",
        hospital_id="11111111-1111-1111-1111-111111111111",
        hospital_affiliation="MetroHealth Academic Medical Center",
        consultation_fee=150.00,
        available_days="Mon,Tue,Wed,Thu,Fri"
    )
    doc2_details = models.Doctor(
        id="b0000000-0000-0000-0000-000000000002",
        specialization="Endocrinology & Diabetology",
        license_number="MED-MA-448102",
        hospital_id="22222222-2222-2222-2222-222222222222",
        hospital_affiliation="St. Jude Specialty Care & Research Institute",
        consultation_fee=180.00,
        available_days="Tue,Wed,Thu,Sat"
    )
    db.add_all([doc1_details, doc2_details])

    # 5. Medical Records
    rec1 = models.MedicalRecord(
        id="d0000000-0000-0000-0000-000000000001",
        patient_id="a0000000-0000-0000-0000-000000000001",
        doctor_id="b0000000-0000-0000-0000-000000000001",
        hospital_id="11111111-1111-1111-1111-111111111111",
        record_type="Consultation",
        title="Annual Comprehensive Cardiovascular & Metabolic Evaluation",
        description="Comprehensive checkup for BP monitoring and fasting glucose management. Mildly elevated systolic blood pressure noted.",
        record_date=date(2026, 8, 10),
        hospital_name="MetroHealth Academic Medical Center",
        doctor_name="Dr. Marcus Vance, MD",
        is_verified=True
    )
    rec2 = models.MedicalRecord(
        id="d0000000-0000-0000-0000-000000000002",
        patient_id="a0000000-0000-0000-0000-000000000001",
        doctor_id="b0000000-0000-0000-0000-000000000001",
        hospital_id="11111111-1111-1111-1111-111111111111",
        record_type="Laboratory Report",
        title="Comprehensive Metabolic Panel (CMP) & HbA1c",
        description="Fasting blood glucose, lipid profile, and HbA1c panel performed after 10-hour fast.",
        record_date=date(2026, 8, 12),
        hospital_name="MetroHealth Clinical Laboratory",
        doctor_name="Dr. Marcus Vance, MD",
        is_verified=True
    )
    rec3 = models.MedicalRecord(
        id="d0000000-0000-0000-0000-000000000003",
        patient_id="a0000000-0000-0000-0000-000000000001",
        doctor_id="b0000000-0000-0000-0000-000000000001",
        hospital_id="11111111-1111-1111-1111-111111111111",
        record_type="Prescription",
        title="Antihypertensive & Cardiometabolic Therapy Plan",
        description="Prescription for blood pressure regulation and dietary lifestyle modification.",
        record_date=date(2026, 8, 14),
        hospital_name="MetroHealth Pharmacy Services",
        doctor_name="Dr. Marcus Vance, MD",
        is_verified=True
    )
    rec4 = models.MedicalRecord(
        id="d0000000-0000-0000-0000-000000000004",
        patient_id="a0000000-0000-0000-0000-000000000001",
        doctor_id="b0000000-0000-0000-0000-000000000002",
        hospital_id="22222222-2222-2222-2222-222222222222",
        record_type="Laboratory Report",
        title="Follow-up Fasting Blood Glucose & Lipid Panel",
        description="Follow-up laboratory assessment to evaluate dietary intervention and medication response.",
        record_date=date(2026, 9, 2),
        hospital_name="St. Jude Diagnostic Labs",
        doctor_name="Dr. Elena Rostova, MD",
        is_verified=True
    )
    db.add_all([rec1, rec2, rec3, rec4])

    # 6. Health Metrics (Longitudinal History)
    metrics = [
        # Blood Pressure
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Blood Pressure", value_primary=142.0, value_secondary=92.0, unit="mmHg", recorded_at=datetime(2026, 6, 1, 9, 0), notes="Baseline examination"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Blood Pressure", value_primary=138.0, value_secondary=88.0, unit="mmHg", recorded_at=datetime(2026, 7, 5, 8, 30), notes="Home automated cuff monitoring"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Blood Pressure", value_primary=134.0, value_secondary=86.0, unit="mmHg", recorded_at=datetime(2026, 8, 10, 10, 15), notes="Clinical follow-up reading"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Blood Pressure", value_primary=128.0, value_secondary=82.0, unit="mmHg", recorded_at=datetime(2026, 9, 10, 9, 0), notes="Therapy responding well"),

        # Fasting Glucose (Current 135 vs Previous 122)
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Fasting Glucose", value_primary=114.0, unit="mg/dL", recorded_at=datetime(2026, 6, 1, 8, 0), notes="Baseline fasting lab"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Fasting Glucose", value_primary=122.0, unit="mg/dL", recorded_at=datetime(2026, 8, 12, 8, 0), notes="CMP lab test - previous"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Fasting Glucose", value_primary=135.0, unit="mg/dL", recorded_at=datetime(2026, 9, 2, 8, 0), notes="Follow-up panel - current elevated"),

        # Total Cholesterol
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Total Cholesterol", value_primary=218.0, unit="mg/dL", recorded_at=datetime(2026, 6, 1, 8, 0), notes="Baseline screening"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Total Cholesterol", value_primary=205.0, unit="mg/dL", recorded_at=datetime(2026, 8, 12, 8, 0), notes="CMP lipid test"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Total Cholesterol", value_primary=198.0, unit="mg/dL", recorded_at=datetime(2026, 9, 2, 8, 0), notes="Dietary improvement"),

        # Weight & BMI
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Weight", value_primary=84.5, unit="kg", recorded_at=datetime(2026, 6, 1, 9, 0), notes="Baseline"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Weight", value_primary=83.2, unit="kg", recorded_at=datetime(2026, 8, 10, 9, 0), notes="Loss of 1.3 kg"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="BMI", value_primary=27.6, unit="kg/m²", recorded_at=datetime(2026, 6, 1, 9, 0)),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="BMI", value_primary=27.1, unit="kg/m²", recorded_at=datetime(2026, 8, 10, 9, 0)),

        # Heart Rate
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Heart Rate", value_primary=78.0, unit="bpm", recorded_at=datetime(2026, 8, 10, 9, 0), notes="Resting pulse"),
        models.HealthMetric(patient_id="a0000000-0000-0000-0000-000000000001", metric_type="Heart Rate", value_primary=74.0, unit="bpm", recorded_at=datetime(2026, 9, 10, 9, 0), notes="Normal sinus rhythm")
    ]
    db.add_all(metrics)

    # 7. Active Medications
    med1 = models.PatientMedication(
        patient_id="a0000000-0000-0000-0000-000000000001",
        medication_name="Lisinopril",
        generic_name="Lisinopril",
        dosage="10 mg",
        frequency="Once daily in the morning",
        start_date=date(2026, 8, 14),
        is_active=True,
        notes="For blood pressure regulation"
    )
    med2 = models.PatientMedication(
        patient_id="a0000000-0000-0000-0000-000000000001",
        medication_name="Metformin",
        generic_name="Metformin Hydrochloride",
        dosage="500 mg",
        frequency="Twice daily with meals",
        start_date=date(2026, 8, 15),
        is_active=True,
        notes="For glycemic regulation"
    )
    med3 = models.PatientMedication(
        patient_id="a0000000-0000-0000-0000-000000000001",
        medication_name="Atorvastatin",
        generic_name="Atorvastatin Calcium",
        dosage="20 mg",
        frequency="Once daily at bedtime",
        start_date=date(2026, 8, 14),
        is_active=True,
        notes="For lipid management"
    )
    db.add_all([med1, med2, med3])

    # 8. Medication Interactions Knowledge Base
    interactions = [
        models.MedicationInteraction(
            medication_a="Lisinopril",
            medication_b="Spironolactone",
            interaction_description="Concurrent use may result in severe hyperkalemia due to additive potassium-sparing effects.",
            severity="Major",
            clinical_advice="Monitor serum potassium and renal function closely.",
            source="Lexicomp Drug Interactions"
        ),
        models.MedicationInteraction(
            medication_a="Lisinopril",
            medication_b="Ibuprofen",
            interaction_description="NSAIDs may decrease the antihypertensive effect of ACE inhibitors and increase the risk of acute renal impairment.",
            severity="Moderate",
            clinical_advice="Consider alternative analgesics like acetaminophen. Monitor blood pressure and renal parameters.",
            source="DrugBank Clinical Knowledgebase"
        ),
        models.MedicationInteraction(
            medication_a="Metformin",
            medication_b="Contrast Media (Iodinated)",
            interaction_description="Presents increased risk of lactic acidosis and contrast-induced nephropathy.",
            severity="Major",
            clinical_advice="Temporarily withhold Metformin 48 hours before and after contrast-enhanced imaging.",
            source="FDA Drug Safety Communication"
        ),
        models.MedicationInteraction(
            medication_a="Atorvastatin",
            medication_b="Clarithromycin",
            interaction_description="Macrolide antibiotic significantly increases serum concentration of atorvastatin, increasing risk of myopathy or rhabdomyolysis.",
            severity="Major",
            clinical_advice="Avoid co-administration or temporarily suspend atorvastatin during macrolide therapy.",
            source="AHA Scientific Statement"
        )
    ]
    db.add_all(interactions)

    # 9. Consents & Doctor-Patient Access
    consent1 = models.Consent(
        id="e0000000-0000-0000-0000-000000000001",
        patient_id="a0000000-0000-0000-0000-000000000001",
        doctor_id="b0000000-0000-0000-0000-000000000001",
        access_status="Granted",
        permissions={"medical_records": True, "lab_reports": True, "prescriptions": True, "timeline": True, "health_trends": True, "ai_summary": True, "documents": True, "risk_assessment": True},
        granted_at=datetime(2026, 8, 10, 10, 0),
        expires_at=datetime(2027, 8, 10, 10, 0)
    )
    consent2 = models.Consent(
        id="e0000000-0000-0000-0000-000000000002",
        patient_id="a0000000-0000-0000-0000-000000000001",
        doctor_id="b0000000-0000-0000-0000-000000000002",
        access_status="Pending",
        permissions={"medical_records": True, "lab_reports": True, "prescriptions": True, "timeline": True, "health_trends": True, "ai_summary": True, "documents": False, "risk_assessment": True}
    )
    access1 = models.DoctorPatientAccess(
        doctor_id="b0000000-0000-0000-0000-000000000001",
        patient_id="a0000000-0000-0000-0000-000000000001",
        consent_id="e0000000-0000-0000-0000-000000000001",
        is_active=True,
        last_accessed_at=datetime(2026, 9, 12, 14, 20)
    )
    db.add_all([consent1, consent2, access1])

    # 10. Audit Logs
    audit1 = models.AuditLog(
        user_id="a0000000-0000-0000-0000-000000000001",
        user_role="patient",
        action="AUTH_LOGIN",
        resource_type="SESSION",
        resource_id="a0000000-0000-0000-0000-000000000001",
        status="Success",
        ip_address="192.168.1.45",
        details={"method": "password", "client": "Chrome 128 / Windows"}
    )
    audit2 = models.AuditLog(
        user_id="a0000000-0000-0000-0000-000000000001",
        user_role="patient",
        action="CONSENT_GRANTED",
        resource_type="CONSENT",
        resource_id="e0000000-0000-0000-0000-000000000001",
        status="Success",
        ip_address="192.168.1.45",
        details={"doctor_name": "Dr. Marcus Vance", "permissions_count": 8}
    )
    audit3 = models.AuditLog(
        user_id="b0000000-0000-0000-0000-000000000001",
        user_role="doctor",
        action="VIEW_PATIENT_RECORDS",
        resource_type="MEDICAL_RECORDS",
        resource_id="a0000000-0000-0000-0000-000000000001",
        status="Success",
        ip_address="10.0.4.12",
        details={"authorized_by_consent": "e0000000-0000-0000-0000-000000000001"}
    )
    db.add_all([audit1, audit2, audit3])

    # 11. Initial Notifications
    notif1 = models.Notification(
        user_id="a0000000-0000-0000-0000-000000000001",
        title="Doctor Access Granted",
        message="Dr. Marcus Vance was granted access to your medical history and health trends.",
        notification_type="consent",
        is_read=False,
        metadata_json={"doctor_id": "b0000000-0000-0000-0000-000000000001"}
    )
    notif2 = models.Notification(
        user_id="a0000000-0000-0000-0000-000000000001",
        title="Health Trend Alert",
        message="Fasting glucose increased by 13 mg/dL compared with your previous test on Aug 12.",
        notification_type="clinical_alert",
        is_read=False,
        metadata_json={"metric": "Fasting Glucose", "delta": "+13 mg/dL"}
    )
    db.add_all([notif1, notif2])

    db.commit()
    db.close()
    print("Database successfully seeded with realistic clinical demonstration data!")

if __name__ == "__main__":
    seed_database()
