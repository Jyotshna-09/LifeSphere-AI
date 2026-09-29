# LifeSphere AI: A Unified Lifelong Digital Health Ecosystem with Explainable AI

> **Tagline:** *Your Lifelong Health Companion*  
> **Academic Project:** B.Tech Major Project Capstone  
> **Target Completion:** 80% Functional Clinical Review-Ready Prototype  

[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12%20%7C%203.13-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6.svg)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![SHAP](https://img.shields.io/badge/Explainable_AI-SHAP_0.52-ff69b4.svg)](https://shap.readthedocs.io/)
[![XGBoost](https://img.shields.io/badge/Machine_Learning-XGBoost_3.4-orange.svg)](https://xgboost.readthedocs.io/)

---

## 1. Executive Summary & Problem Statement

Modern healthcare data remains severely fragmented across disparate clinics, diagnostic laboratories, hospitals, and telemedicine portals. Patients lack sovereign ownership of their lifelong health records, while clinicians are routinely forced to make diagnostic decisions without longitudinal context or visibility into prior testing.

### Key Clinical & Engineering Challenges Addressed
1. **Siloed Longitudinal Health Records:** Patients lose track of diagnostic reports, paper lab slips, and immunization histories across different healthcare providers.
2. **"Black Box" Medical AI:** Standard machine learning risk models produce opaque probabilities that clinicians reject due to lack of explainability, interpretability, and clinical reasoning.
3. **Preventable Medication Conflicts (Polypharmacy):** Patients receiving prescriptions from multiple specialists face dangerous, unflagged drug-drug interactions (e.g., Warfarin + Aspirin, Metformin + Contrast Dye, ACE Inhibitors + Spironolactone).
4. **Wasteful & Redundant Diagnostic Testing:** Identical metabolic, lipid, and hematology panels are repeated within days or weeks because prior lab results are inaccessible.
5. **Absence of Patient-Controlled Data Governance:** Existing electronic health systems treat patient data as hospital property without granular, revocable consent controls.

**LifeSphere AI** solves these systemic issues by combining **Health Informatics + Supervised Machine Learning + Mathematically Grounded Explainable AI (SHAP) + Automated Clinical Document Parsing (PyMuPDF) + Sovereign Patient Consent Governance**.

---

## 2. System Architecture

LifeSphere is engineered as a decoupled, multi-tier digital health ecosystem designed for high throughput, sub-100ms inference times, and zero-trust security:

```
                                    +-----------------------------------------------+
                                    |               LIFESPHERE CLIENT               |
                                    |     React 19 + TypeScript + Tailwind CSS      |
                                    |     Lucide Icons + Recharts Analytics + Vite  |
                                    +-----------------------+-----------------------+
                                                            | HTTPS / REST API
                                                            v
+-------------------------------------------------------------------------------------------------------------------+
|                                            FASTAPI BACKEND GATEWAY (:8000)                                        |
+------------------------------------+------------------------------------+-----------------------------------------+
|        SECURITY & GOVERNANCE       |         CLINICAL LOGIC             |          MACHINE LEARNING & XAI         |
|  * JWT Bearer Authentication       |  * PyMuPDF Text & Lab Extraction   |  * Scikit-Learn (Logistic Regression)   |
|  * Role-Based Access Control       |  * Regex Biomarker Normalizer      |  * Ensemble Trees (Random Forest)       |
|    (Patient, Doctor, Admin)        |  * 10-Point Longitudinal Summary   |  * Extreme Gradient Boosting (XGBoost)  |
|  * Sovereign Consent Verifier      |  * Drug-Drug Interaction Engine    |  * Real SHAP Game-Theoretic Attributor  |
|  * Tamper-Evident Audit Logger     |  * 60-Day Duplicate Test Detector  |  * Scaled Biomarker Preprocessor        |
+------------------------------------+------------------------------------+-----------------------------------------+
                                                            |
                                    +-----------------------+-----------------------+
                                    |                                               |
                                    v                                               v
                    +-------------------------------+               +-------------------------------+
                    |     PERSISTENCE (ACTIVE)      |               |     CLOUD DATABASE SCHEMA     |
                    |  SQLite Engine (Zero Setup)   |               |   Supabase PostgreSQL 16+     |
                    |  24 Relational Data Tables    |               |   Row-Level Security (RLS)    |
                    |  Pre-seeded Clinical Data     |               |   24 Tables + 10 RLS Policies |
                    +-------------------------------+               +-------------------------------+
```

---

## 3. Core Modules & Innovations

### A. Explainable AI (XAI) with Mathematical SHAP
Rather than returning an opaque risk number, LifeSphere implements **SHapley Additive exPlanations (SHAP)** rooted in cooperative game theory:
$$\phi_i(v) = \sum_{S \subseteq N \setminus \{i\}} \frac{|S|!(|N| - |S| - 1)!}{|N|!} (v(S \cup \{i\}) - v(S))$$

- **Base Value (Expected Model Output):** Evaluates baseline population risk prior to biomarker observation.
- **Biomarker Marginal Contributions:** Quantifies exactly how many percentage points each biomarker (e.g., Glucose $+14.2\%$, BMI $+8.1\%$, Age $+3.4\%$, Blood Pressure $-2.1\%$) pushed the risk upward or downward.
- **Dual Explainer Engine:** Employs `shap.TreeExplainer` for non-linear tree ensembles (Random Forest, XGBoost) and `shap.LinearExplainer` for baseline logistic models.
- **Local Attribution vs Global Significance:** Reviewers can inspect both individual per-patient waterfall/bar charts and global dataset feature importance rankings.

### B. Machine Learning Model Benchmark
Trained on 1,000 clinically grounded patient records with 8 physiological biomarkers (`Glucose`, `BloodPressure`, `BMI`, `Age`, `Insulin`, `Pregnancies`, `SkinThickness`, `DiabetesPedigreeFunction`) evaluated on an unseen 20% holdout test set (200 patients, 56 positive cases):

| Machine Learning Model | Test Accuracy | Precision | Recall (Sensitivity) | F1-Score | ROC-AUC | Clinical Purpose |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Logistic Regression** | **90.00%** | **86.00%** | **76.79%** | **0.8113** | **0.9742** | Transparent linear clinical baseline |
| **Random Forest (100 Trees)** | **87.50%** | **87.80%** | **64.29%** | **0.7423** | **0.9617** | Robust against biomarker outliers |
| **XGBoost (Gradient Boosted)** | **88.50%** | **85.71%** | **75.00%** | **0.7850** | **0.9608** | High predictive performance on non-linear interactions |

### C. Clinical Document Processing (PyMuPDF NLP Parser)
- Extracts raw multi-column clinical text from PDF medical lab reports using PyMuPDF (`fitz`).
- Applies regular expression heuristics and clinical biomarker dictionary matching to extract vital biomarkers (`HbA1c`, `Fasting Blood Glucose`, `Total Cholesterol`, `LDL`, `HDL`, `Triglycerides`, `Systolic/Diastolic Blood Pressure`, `Serum Creatinine`).
- Classifies each reading as `NORMAL`, `ELEVATED`, `HIGH`, or `CRITICAL` against standardized clinical reference ranges.

### D. Real-Time Clinical Safety Engines
- **Drug-Drug Interaction (DDI) Detector:** Intercepts active prescription regimens to flag lethal pharmacokinetic and pharmacodynamic interactions (e.g., *Warfarin + Aspirin* severe bleeding risk, *Metformin + Contrast* lactic acidosis risk, *ACE Inhibitors + Potassium Spironolactone* hyperkalemia alert).
- **60-Day Duplicate Diagnostic Test Monitor:** Prevents unnecessary venipunctures, patient radiation/cost, and insurance waste by detecting overlapping diagnostic orders placed within 60 days.

### E. Longitudinal Health Trends & Analytics
- Visualizes vital biomarker trajectories across months and years with interactive Recharts components.
- Computes automated **Current vs Previous** percentage delta cards for Blood Pressure, Fasting Glucose, Total Cholesterol, and BMI with clinical trend indicators (`improving`, `declining`, `stable`).

### F. Sovereign Patient Consent & Granular Access Revocation
- Patients hold absolute sovereignty over who sees their medical records.
- Grant access to licensed physicians with granular scopes:
  - `ALL_RECORDS`
  - `LABS_ONLY`
  - `PRESCRIPTIONS_ONLY`
- **Instant Revocation:** When a patient clicks `Revoke Access`, the system immediately invalidates the doctor's authorization token. Any subsequent file inspection attempts by that doctor return an immediate `403 Forbidden` response and trigger an audit entry.

### G. Immutable Audit Trail
- Every authentication attempt, document upload, ML prediction, consent grant, consent revocation, and doctor record inspection is logged with client IP address, UTC timestamp, actor role, and target record ID.

---

## 4. Repository Structure

```
LifeSphere/
├── backend/                             # FastAPI Backend Service
│   ├── app/
│   │   ├── api/v1/                      # 13 REST API Endpoint Routers
│   │   │   ├── auth.py                  # JWT Auth & Demo Role Switcher
│   │   │   ├── records.py               # Medical Records CRUD
│   │   │   ├── documents.py             # PyMuPDF Upload & Parser
│   │   │   ├── ml.py                    # Real SHAP & Model Inference
│   │   │   ├── consent.py               # Patient Sovereign Access Control
│   │   │   ├── doctor.py                # Doctor Portal & Access Enforcement
│   │   │   ├── safety.py                # DDI & Duplicate Test Engine
│   │   │   ├── trends.py                # Recharts Longitudinal Series
│   │   │   ├── ai.py                    # 10-Point Longitudinal Clinical Summary
│   │   │   └── audit.py                 # Immutable Security Audit Trail
│   │   ├── db/
│   │   │   ├── database.py              # SQLAlchemy Session Engine
│   │   │   ├── models.py                # 24 Relational Database Tables
│   │   │   └── seed_data.py             # Pre-seeded Clinical Patients & Doctors
│   │   ├── ml/
│   │   │   └── predictor.py             # Dynamic Model Loader & SHAP Explainer
│   │   ├── security/
│   │   │   └── auth.py                  # Passlib Bcrypt + PyJWT Security
│   │   ├── services/
│   │   │   ├── document_extractor.py    # PyMuPDF PDF Text & Lab Extractor
│   │   │   ├── safety_engine.py         # Polypharmacy & Diagnostic Safety Engine
│   │   │   └── ai_summary_engine.py     # 10-Point Health Synthesizer
│   │   └── main.py                      # Application Entry Point & CORS Setup
│   ├── requirements.txt                 # Backend Dependencies
│   └── lifesphere.db                    # Active SQLite Database (Pre-seeded)
├── frontend/                            # Vite + React 19 + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx               # Navigation & 1-Click Role Switcher
│   │   │   └── ClinicalDisclaimer.tsx   # Mandatory AI Safety Notice
│   │   ├── pages/
│   │   │   ├── auth/LoginPage.tsx       # Auth with Demo User Quick-Buttons
│   │   │   ├── patient/
│   │   │   │   ├── PatientDashboard.tsx # Metrics, Safety Banners, Quick Links
│   │   │   │   ├── MedicalRecordsPage.tsx # Search, Filter, Modal Form
│   │   │   │   ├── DocumentUploadPage.tsx # Drag-and-Drop & Sample Lab Loader
│   │   │   │   ├── MedicalTimelinePage.tsx# Chronological Lifelong Tree
│   │   │   │   ├── HealthTrendsPage.tsx # Recharts Graphs + Delta Cards
│   │   │   │   └── AIHealthSummaryPage.tsx# 10-Point Synthesized Report
│   │   │   ├── ml/
│   │   │   │   ├── AIRiskAssessmentPage.tsx# Form, Probability Gauge & SHAP Chart
│   │   │   │   ├── PredictionHistoryPage.tsx# Saved Inferences & SHAP Re-inspection
│   │   │   │   └── MLInsightsPage.tsx   # Confusion Matrices, ROC-AUC, Benchmark
│   │   │   ├── consent/DoctorAccessPage.tsx# Granular Access Grants & Instant Revocation
│   │   │   ├── doctor/DoctorDashboardPage.tsx# Authorized Patient Roster & Records View
│   │   │   ├── admin/AdminDashboardPage.tsx# System Counters & Live Audit Stream
│   │   │   └── settings/SettingsPage.tsx# Profile & Theme Toggle
│   │   ├── services/api.ts              # Centralized Axios Client & Token Interceptor
│   │   └── types/index.ts               # Strict TypeScript Interface Contracts
│   ├── package.json                     # Frontend Dependencies
│   └── vite.config.ts                   # Vite Build Configuration
├── ml/                                  # Machine Learning Training Subsystem
│   ├── datasets/diabetes_risk.csv       # 1,000 Patient Records (8 Biomarkers)
│   ├── preprocessing/preprocessor.py    # Zero Imputation & Standard Scaling
│   ├── training/train_models.py         # Model Training & Metric Generation Script
│   └── models/                          # Persisted Artifacts
│       ├── logistic_regression.joblib   # Trained Baseline Model
│       ├── random_forest.joblib         # Trained Random Forest Model
│       ├── xgboost.joblib               # Trained XGBoost Model
│       ├── scaler.joblib                # Fitted StandardScaler
│       ├── background_sample.joblib     # SHAP Background Reference Distribution
│       └── evaluation_metrics.json      # Exact Precision/Recall/ROC Metrics
├── supabase/                            # Supabase Cloud Database Definitions
│   ├── migrations/
│   │   └── 20260918_init_lifesphere.sql # 24 Relational Tables + 10 RLS Policies
│   └── seed.sql                         # Complete Cloud Database Seed Script
└── docs/                                # Detailed Architectural Documentation
    ├── architecture.md                  # Comprehensive System Design
    ├── database.md                      # Schema Diagrams & Foreign Key Constraints
    ├── ml.md                            # Machine Learning & SHAP Formulation
    └── api.md                           # REST API Endpoint Documentation
```

---

## 5. Quick Start & Setup Instructions

### Prerequisites
- **Python:** 3.10, 3.11, 3.12, or 3.13
- **Node.js:** v18.0.0 or higher
- **Package Managers:** `pip` and `npm`

### Step 1: Clone Repository
```bash
git clone https://github.com/your-username/lifesphere.git
cd LifeSphere
```

### Step 2: Backend Setup & Launch
```bash
cd backend
python -m venv venv

# Windows Activation:
.\venv\Scripts\activate
# macOS/Linux Activation:
# source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The backend starts at `http://localhost:8000`. On first run, it automatically creates and seeds `lifesphere.db` with clinical demo records.*

### Step 3: Frontend Setup & Launch
Open a second terminal:
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```
*The frontend starts at `http://localhost:5173`.*

### Step 4 (Optional): Retrain ML Models
If you wish to re-execute the ML training pipeline and regenerate all models, scalers, and metrics:
```bash
cd ml
python training/train_models.py
```

---

## 6. Pre-Seeded Demonstration Credentials

For maximum ease during evaluation and viva presentations, LifeSphere includes pre-seeded credentials and **one-click role switchers** directly in the UI:

| Role | Email | Password | Access & Responsibilities |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@lifesphere.ai` | `password123` | Lifelong records, lab upload, trends, SHAP risk assessment, consent controls |
| **Doctor** | `dr.vance@lifesphere.ai` | `password123` | Patient roster, authorized medical file inspection, clinical notes |
| **Admin** | `admin@lifesphere.ai` | `password123` | System telemetry, user governance, real-time security audit trails |

---

## 7. Step-by-Step B.Tech Reviewer Demonstration Script

Follow this curated 5-minute walkthrough to demonstrate end-to-end functionality to examiners:

### Phase 1: Patient Dashboard & Proactive Safety Warnings (1 Minute)
1. Navigate to `http://localhost:5173`.
2. Click **Demo Patient Login** on the login page.
3. Observe the **Active Clinical Safety Alerts**:
   - **Medication Interaction Banner:** Highlights the lethal interaction between *Warfarin* and *Aspirin* (Severe Bleeding Risk).
   - **Duplicate Test Alert:** Flags a redundant *Comprehensive Metabolic Panel* ordered within the last 60 days.
4. Click **View AI Health Summary** to review the synthesized 10-point longitudinal clinical assessment.

### Phase 2: Document Extraction & PyMuPDF NLP (1 Minute)
1. In the sidebar, navigate to **Upload Documents**.
2. Click the green button **"Load Comprehensive Lab Panel (Sample)"**.
3. Click **"Process & Extract Biomarkers with PyMuPDF"**.
4. Witness the extracted raw clinical text and the automatically populated biomarker table showing values (`HbA1c: 7.4%`, `Glucose: 156 mg/dL`, `Cholesterol: 232 mg/dL`) classified with clinical status badges (`ELEVATED`, `HIGH`).

### Phase 3: Longitudinal Trends & Delta Analytics (30 Seconds)
1. Click **Health Trends** in the navigation bar.
2. Examine the interactive Recharts curves showing trajectories for Blood Pressure, Fasting Glucose, and Cholesterol over time.
3. Review the **Current vs Previous Comparison Cards** displaying exact percentage deltas and clinical indicators.

### Phase 4: Machine Learning Risk Assessment & Real SHAP Explainability (1.5 Minutes)
1. Navigate to **AI Risk Assessment**.
2. Select **Model:** `XGBoost (Gradient Boosted Trees)` or `Random Forest`.
3. Click **"Run Explainable AI Risk Assessment"**.
4. Observe the results:
   - **Risk Gauge:** Displays exact calculated probability (e.g., `82.4% - High Risk`).
   - **SHAP Feature Contributions (Horizontal Bar Chart):** Displays exact mathematical Shapley values. Point out to examiners how `Glucose (+0.24)` and `BMI (+0.18)` drove the risk up, while `Blood Pressure (-0.05)` mitigated risk.
   - **Clinical Decision Support Summary:** Provides human-readable clinical context for the findings.
5. Click **"View Historical Predictions"** to demonstrate persistence of past predictions with clickable SHAP inspector modals.
6. Click **"View ML Insights"** to showcase the full model comparison benchmark, confusion matrices, and ROC-AUC curves.

### Phase 5: Sovereign Patient Consent & Instant Doctor Revocation (1 Minute)
1. Navigate to **Doctor Access**.
2. Note that `Dr. Vance, MD (Cardiologist)` currently holds active access (`Status: ACTIVE`).
3. Click the red **"Revoke Access"** button. The status immediately updates to `REVOKED`.
4. In the top navbar, click the **`[Doctor]`** role pill to switch instantly to Dr. Vance's portal.
5. Click on the patient's record: the platform enforces access control, displaying **"Access Revoked / 403 Forbidden"**.
6. Switch to **`[Admin]`** role via the navbar pill and navigate to **Security Audit Logs** to show examiners the immutable audit entry recording the exact timestamp and IP of the revocation.

---

## 8. Ethical AI & Clinical Safety Notice

> [!IMPORTANT]
> **Clinical Disclaimer:** LifeSphere AI is designed strictly as an assistive Clinical Decision Support System (CDSS) for educational and research purposes. All risk predictions, biomarker interpretations, and SHAP feature attributions are probabilistic estimates and do **not** constitute a formal medical diagnosis or replace licensed clinical judgment.

---

## 9. Contributors & Academic Declaration

- **Project Title:** LifeSphere AI — A Unified Lifelong Digital Health Ecosystem with Explainable AI
- **Department:** Computer Science & Engineering / Information Technology
- **Degree:** Bachelor of Technology (B.Tech)
- **Academic Year:** 2025–2026

*Engineered with rigorous data science, production-grade security, and transparent explainable artificial intelligence.*
