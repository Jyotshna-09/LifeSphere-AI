# LifeSphere AI — REST API Reference Specification
**Base URL:** `/api/v1`  
**Protocol:** HTTP/1.1 REST + JSON  
**Interactive Swagger Docs:** `http://localhost:8000/docs`  

---

## 1. Authentication & Session
- `POST /auth/register` — Registers new account, generates internal Health ID (`LSP-XXXXXX`), returns JWT.
- `POST /auth/login` — Verifies password credentials, yields JWT token.
- `GET /auth/me` — Fetches current user profile and linked role details.
- `POST /auth/switch-demo` — Instantaneous role switcher (`patient`, `doctor`, `admin`) for zero-friction review demonstrations.

## 2. Medical Records
- `GET /medical-records` — Lists medical records with search and type filters.
- `POST /medical-records` — Adds new consultation, diagnosis, prescription, or lab report.
- `DELETE /medical-records/{id}` — Deletes an authorized medical record.

## 3. Document Processing & AI Analysis
- `POST /documents/upload` — Accepts PDF/image file via `multipart/form-data`, extracts text via PyMuPDF, extracts clinical biomarkers, generates structured AI findings, and logs audit event.
- `GET /documents/{id}/file` — Secure private download/viewing of uploaded medical document.
- `GET /documents/{id}/analysis` — Retrieves structured AI findings for an uploaded document.

## 4. Medical Timeline & Health Trends
- `GET /timeline` — Returns lifelong chronological clinical events with year and type filters.
- `GET /health-trends` — Returns Recharts time series (BP, Glucose, Cholesterol, Weight, BMI, HR) across timeframes (`7d`, `30d`, `6m`, `1y`, `all`), alongside automated Current vs Previous delta comparisons.
- `POST /health-metrics` — Records an individual biomarker measurement.

## 5. AI Health Summary
- `GET /ai/summary` — Compiles a 10-point longitudinal health report directly from the patient's database records.

## 6. Machine Learning & SHAP Explainability
- `POST /ml/predict` — Ingests 8 clinical biomarkers, selects model (`random_forest`, `xgboost`, `logistic_regression`), and calculates exact mathematical SHAP values.
- `GET /ml/predictions` — Returns past risk prediction history.
- `GET /ml/predictions/{id}` — Fetches single prediction with its SHAP archive.
- `GET /ml/insights` — Returns authentic empirical evaluation metrics (Accuracy, Precision, Recall, F1, ROC-AUC), confusion matrices, and feature importances.

## 7. Patient Consent & Doctor Access
- `GET /consents` — Lists active, pending, and revoked consents.
- `POST /consents/grant` — Grants access to a doctor with granular permissions.
- `POST /consents/{id}/revoke` — Instantaneously revokes doctor access and blocks further data retrieval.

## 8. Doctor Portal
- `GET /doctor/patients` — Lists patients who have granted active consent to this doctor.
- `GET /doctor/patients/{id}` — Fetches authorized patient clinical file. Strictly returns `403 Forbidden` if consent was revoked or missing.

## 9. Clinical Safety & Decision Support
- `GET /safety/medication-interactions` — Evaluates active prescriptions against the interaction matrix.
- `GET /safety/duplicate-tests` — Identifies duplicate or recently repeated diagnostic panels within 60 days.

## 10. Audit Logs & System Administration
- `GET /audit-logs` — Returns tamper-evident audit logs with actor role, IP, and timestamp.
- `GET /admin/overview` — Administrative metrics overview (users, records, predictions, active consents).
- `GET /notifications` — Fetches user notifications.
