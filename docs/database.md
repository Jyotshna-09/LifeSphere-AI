# LifeSphere AI — Database Architecture & Schema Specification

---

## 1. Database Overview
LifeSphere utilizes **Supabase PostgreSQL** as its primary cloud relational database engine, complemented by a zero-configuration SQLite-compatible fallback layer for immediate local academic demonstration.

## 2. Relational Schema (24 Core Tables)

| # | Table Name | Purpose | Primary Key | Key Foreign Keys |
|---|------------|---------|-------------|------------------|
| 1 | `profiles` | User accounts, roles (patient, doctor, admin), Health ID | `id (UUID)` | Auth user |
| 2 | `patients` | Clinical demographic details, emergency contacts, allergy summaries | `id (UUID)` | `profiles(id)` |
| 3 | `hospitals` | Registered medical facilities and institutions | `id (UUID)` | None |
| 4 | `doctors` | Specialized physicians, affiliations, license numbers | `id (UUID)` | `profiles(id)`, `hospitals(id)` |
| 5 | `medical_records` | Unified medical records (consultations, labs, surgeries, scans) | `id (UUID)` | `profiles(patient_id)`, `hospitals(id)` |
| 6 | `consultations` | Detailed clinical encounter notes, complaints, follow-up dates | `id (UUID)` | `medical_records(id)` |
| 7 | `diagnoses` | Chronic and acute diagnoses with ICD-10 codes and statuses | `id (UUID)` | `medical_records(id)` |
| 8 | `lab_reports` | Laboratory panel records | `id (UUID)` | `medical_records(id)` |
| 9 | `prescriptions` | Pharmaceutical orders and instructions | `id (UUID)` | `medical_records(id)` |
| 10 | `medications` | Medication reference catalog | `id (UUID)` | None |
| 11 | `patient_medications` | Active and historical prescriptions taken by patient | `id (UUID)` | `prescriptions(id)` |
| 12 | `allergies` | Drug and environmental allergies with severity and reactions | `id (UUID)` | `profiles(patient_id)` |
| 13 | `vaccinations` | Immunization records, lot numbers, and dose sequences | `id (UUID)` | `profiles(patient_id)` |
| 14 | `surgeries` | Procedural records, surgical notes, outcomes | `id (UUID)` | `profiles(patient_id)` |
| 15 | `health_metrics` | Timestamped biomarkers (BP, Glucose, Cholesterol, BMI, HR) | `id (UUID)` | `profiles(patient_id)` |
| 16 | `medical_documents` | Uploaded reports, PyMuPDF extracted text, storage paths | `id (UUID)` | `medical_records(id)` |
| 17 | `document_analyses` | AI structured findings, reference checks, medical glossary | `id (UUID)` | `medical_documents(id)` |
| 18 | `ai_summaries` | Comprehensive 10-point longitudinal clinical summaries | `id (UUID)` | `profiles(patient_id)` |
| 19 | `risk_predictions` | Machine learning inference logs, probabilities, categories | `id (UUID)` | `profiles(patient_id)` |
| 20 | `risk_prediction_features` | Individual mathematical SHAP feature contribution values | `id (UUID)` | `risk_predictions(id)` |
| 21 | `consents` | Patient-granted doctor permissions, expirations, revocations | `id (UUID)` | `profiles(patient_id)`, `profiles(doctor_id)` |
| 22 | `doctor_patient_access` | Active access mapping enforcing immediate revocation | `id (UUID)` | `consents(id)` |
| 23 | `notifications` | Clinical alerts, consent notifications, document notices | `id (UUID)` | `profiles(user_id)` |
| 24 | `audit_logs` | Tamper-evident immutable security and compliance logs | `id (UUID)` | `profiles(user_id)` |
| 25 | `medication_interactions` | Knowledge base of drug-drug interactions and severities | `id (UUID)` | None |
| 26 | `duplicate_test_alerts` | Alerts flagging repeated diagnostic panels within 60 days | `id (UUID)` | `medical_records(id)` |

---

## 3. Row Level Security (RLS) Policies
- **Patients:** Can view and manipulate only their own records (`auth.uid() = patient_id`).
- **Doctors:** Can view patient data ONLY if an active consent entry exists where `access_status = 'Granted'`.
- **Admins:** Read system aggregate tables and audit streams without exposing unnecessary confidential patient payloads.
- **Documents:** Served via private URLs with ownership or active doctor consent verification.
