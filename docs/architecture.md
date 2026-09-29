# LifeSphere AI — System Architecture Document
**Academic Title:** LifeSphere AI: A Unified Lifelong Digital Health Ecosystem with Explainable AI  
**Tagline:** Your Lifelong Health Companion  

---

## 1. Executive Architecture Summary

LifeSphere is engineered as an integrated clinical intelligence ecosystem uniting:
- **Client Layer:** React 19 + TypeScript + Tailwind CSS + Lucide Icons + Recharts
- **API & Application Gateway:** Python FastAPI with Pydantic validation, CORS, and RESTful routing
- **Data Science & ML Core:** Scikit-learn (Logistic Regression, Random Forest) and XGBoost with Joblib persistence
- **Explainable AI (XAI):** Mathematical Shapley Additive exPlanations (SHAP) computed per prediction
- **Document Intelligence:** PyMuPDF (`fitz`) text extraction with clinical regex biomarker detection
- **Database Layer:** Supabase PostgreSQL (with zero-config SQLite-compatible demonstration fallback)
- **Security & RBAC:** Patient-driven sovereign consent, role-based authorization (Patient, Doctor, Admin), tamper-evident audit logs

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              LIFESPHERE CLIENT TIER                               |
|                  React.js + TypeScript + Vite + Tailwind CSS + Recharts           |
|                                                                                   |
|  +--------------------+  +--------------------+  +-----------------------------+  |
|  | Patient Workspace  |  |  Doctor Workspace  |  |     Admin Workspace         |  |
|  | - Dashboard & Vitals|  | - Consented Roster |  | - User/Hospital Metrics     |  |
|  | - Medical Records  |  | - Clinical History |  | - Tamper-Evident Audit Stream| |
|  | - PyMuPDF Upload   |  | - SHAP Assessments |  | - Role & Security Guard      |  |
|  | - Recharts Trends  |  | - Access Status    |  |                             |  |
|  | - ML Risk & SHAP   |  +--------------------+  +-----------------------------+  |
|  +--------------------+                                                           |
+------------------------------------------+----------------------------------------+
                                           | HTTPS / JSON REST APIs
                                           v
+-----------------------------------------------------------------------------------+
|                             BACKEND API GATEWAY (FASTAPI)                         |
|                             FastAPI + Pydantic + Uvicorn                          |
|                                                                                   |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  | /auth & /profiles |  | /medical-records  |  | /documents/upload (PyMuPDF)    | |
|  | - JWT Tokens      |  | - Records CRUD    |  | - Text Extraction & Regex      | |
|  | - RBAC Guard      |  | - Timeline Filter |  | - Structured Clinical Findings | |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  +-------------------+  +-------------------+  +--------------------------------+ |
|  | /ml/predict       |  | /consents         |  | /safety & /trends              | |
|  | - Model Inference |  | - Sovereign Access|  | - Drug Interaction Engine      | |
|  | - Real SHAP Math  |  | - Real-Time Revoke|  | - Duplicate Test Detector      | |
|  +-------------------+  +-------------------+  +--------------------------------+ |
+--------------------+---------------------+----------------------------------------+
                     |                     |
        Inference & SHAP Math              | SQLAlchemy / RLS Policies
                     v                     v
+-----------------------------+  +--------------------------------------------------+
|      MACHINE LEARNING       |  |                PERSISTENCE LAYER                 |
| - Logistic Regression       |  | Supabase PostgreSQL (24 Relational Tables)       |
| - Random Forest Classifier  |  | - profiles, patients, doctors, medical_records   |
| - XGBoost Classifier        |  | - health_metrics, documents, document_analyses   |
| - SHAP Tree & Linear Solvers|  | - risk_predictions, risk_prediction_features    |
| - Standard Scaler & Medians |  | - consents, doctor_patient_access, audit_logs    |
+-----------------------------+  +--------------------------------------------------+
```

---

## 3. Core Operational Flows

### 3.1 Patient Upload & AI Document Analysis Flow
1. Patient uploads PDF/Image via drag-and-drop.
2. File is persisted in secure, private storage.
3. PyMuPDF (`fitz`) extracts raw textual content without cloud external dependency.
4. Clinical regex parser identifies biomarkers (e.g. Fasting Glucose, HbA1c, Cholesterol, BP).
5. AI Document Analyzer checks reference ranges, flags concerns, provides medical term definitions, and appends mandatory decision-support disclaimers.
6. Biomarkers are auto-logged into `health_metrics` and an immutable entry is added to `audit_logs`.

### 3.2 Machine Learning & SHAP Explainability Flow
1. Patient or physician inputs clinical features (Glucose, BMI, Age, BP, Insulin, Pregnancies, DPF, SkinThickness).
2. Input is passed to the selected model (Random Forest, XGBoost, or Logistic Regression).
3. Scaler normalizes vector using training cohort distribution.
4. Model generates estimated probability and risk tier (Low, Moderate, Elevated).
5. `shap.TreeExplainer` or `shap.LinearExplainer` computes exact mathematical Shapley contributions for that instance.
6. Prediction and feature impacts are saved in `risk_predictions` and visualized on a Recharts bar chart.

### 3.3 Sovereign Doctor Access & Instant Revocation Flow
1. Patient grants access to a specific doctor with granular checkboxes.
2. Doctor logs in and accesses authorized patient roster.
3. Patient revokes consent at any time.
4. Backend deactivates `DoctorPatientAccess` mapping and flags consent as `Revoked`.
5. Further doctor requests immediately receive `403 Forbidden: Access revoked by patient`.
