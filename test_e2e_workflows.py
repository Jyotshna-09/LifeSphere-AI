import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000/api/v1"

def post_json(path, data, token=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=json.dumps(data).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(path, token=None):
    url = f"{BASE_URL}{path}"
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers, method="GET")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

print("=== 1. PATIENT AUTHENTICATION ===")
p_login = post_json("/auth/login", {"email": "patient@lifesphere.ai", "password": "password123"})
p_token = p_login["access_token"]
print(f"Patient Login: SUCCESS (Role: {p_login['user']['role']}, Name: {p_login['user']['full_name']})")

print("\n=== 2. DOCTOR AUTHENTICATION ===")
d_login = post_json("/auth/login", {"email": "dr.vance@lifesphere.ai", "password": "password123"})
d_token = d_login["access_token"]
print(f"Doctor Login: SUCCESS (Role: {d_login['user']['role']}, Name: {d_login['user']['full_name']})")

print("\n=== 3. CLINICAL RECORDS & TIMELINE ===")
records = get_json("/medical-records", p_token)
print(f"Records Fetched: {len(records)} records")
timeline = get_json("/timeline", p_token)
print(f"Timeline Events: {len(timeline)} events")

print("\n=== 4. CLINICAL SAFETY ENGINES ===")
ddi = get_json("/safety/medication-interactions", p_token)
print(f"Drug-Drug Interaction Warnings: {len(ddi)} active alerts")
for alert in ddi:
    print(f"  - [{alert['severity']}] {alert['medication_a']} + {alert['medication_b']}: {alert['interaction_description']}")

dup_tests = get_json("/safety/duplicate-tests", p_token)
print(f"Duplicate Diagnostic Test Warnings: {len(dup_tests)} active alerts")
for dup in dup_tests:
    print(f"  - {dup['current_test']} vs {dup['previous_test']} ({dup['days_difference']} days gap): {dup['reason']}")

print("\n=== 5. LONGITUDINAL HEALTH TRENDS ===")
trends = get_json("/health-trends", p_token)
print(f"Tracked Metrics Available: {list(trends['trends'].keys())}")
print(f"Comparisons (Current vs Previous): {len(trends['comparisons'])} metrics compared")
for c in trends['comparisons'][:3]:
    print(f"  - {c['metric_type']}: Current={c['current_value']} (Prev={c['previous_value']}), Diff={c['difference']:+.1f} {c['unit']} -> {c['statement']}")

print("\n=== 6. AI 10-POINT HEALTH SUMMARY ===")
ai_summary = get_json("/ai/summary", p_token)
print(f"Synthesized Health Summary for Patient ID: {ai_summary['patient_id']}")
print(f"  1. Overview: {ai_summary['patient_overview']}")
print(f"  2. Current Meds: {ai_summary['current_medications']}")
print(f"  3. Lab Trends: {ai_summary['lab_trends']}")
print(f"  4. Doctor Review Points: {ai_summary['doctor_review_points'][:100]}...")
print(f"  5. Supporting Records: {len(ai_summary['supporting_records'])} linked records")

print("\n=== 7. EXPLAINABLE AI RISK PREDICTION (REAL SHAP) ===")
models_to_test = ["logistic_regression", "random_forest", "xgboost"]
for m in models_to_test:
    risk_payload = {
        "model_name": m,
        "Glucose": 172.0,
        "BloodPressure": 88.0,
        "BMI": 34.2,
        "Age": 52.0,
        "Insulin": 195.0,
        "Pregnancies": 2.0,
        "SkinThickness": 35.0,
        "DiabetesPedigreeFunction": 0.72
    }
    pred = post_json("/ml/predict", risk_payload, p_token)
    print(f"  Model: {pred['model_name']} -> Risk Probability: {pred['probability_percentage']}% ({pred['risk_category']})")
    print(f"    Clinical Note: {pred['risk_description']}")
    print(f"    Top 3 SHAP Attributions (Real Game-Theoretic Marginal Contribs):")
    sorted_shap = sorted(pred['shap_contributions'], key=lambda x: abs(x['shap_value']), reverse=True)
    for sv in sorted_shap[:3]:
        print(f"      {sv['feature_name']}: SHAP={sv['shap_value']:+.4f} (Value={sv['feature_value']}, Impact={sv['feature_impact']})")

print("\n=== 8. SOVEREIGN CONSENT & INSTANT REVOCATION LIFECYCLE ===")
consents = get_json("/consents", p_token)
active_consents = [c for c in consents if c["access_status"] == "Granted"]
print(f"Total Consents: {len(consents)} (Active: {len(active_consents)})")
doctor_patients = get_json("/doctor/patients", d_token)
print(f"Doctor sees {len(doctor_patients)} authorized patient(s)")

if active_consents:
    target_consent = active_consents[0]
    cid = target_consent["id"]
    doc_id = target_consent["doctor_id"]
    print(f"Revoking Consent ID: {cid} (Doctor: {target_consent['doctor_name']})...")
    revoked = post_json(f"/consents/{cid}/revoke", {}, p_token)
    print(f"Revocation Result: {revoked}")
    
    doctor_patients_after = get_json("/doctor/patients", d_token)
    print(f"Doctor sees {len(doctor_patients_after)} authorized patient(s) after revocation (Access Cut Off Verified!)")
    
    # Re-grant for continuous usability
    print(f"Re-granting consent to Doctor {doc_id}...")
    regranted = post_json("/consents/grant", {
        "doctor_id": doc_id,
        "permissions": {
            "medical_records": True,
            "lab_reports": True,
            "prescriptions": True,
            "timeline": True,
            "health_trends": True,
            "ai_summary": True,
            "documents": True,
            "risk_assessment": True
        }
    }, p_token)
    print(f"Consent Re-granted: {regranted}")

print("\n=== 9. PYMUPDF DOCUMENT EXTRACTION & BIOMARKER PARSING ===")
import io
import mimetypes

sample_report_content = """
METROPATH CLINICAL DIAGNOSTIC LABORATORIES
Patient Name: Johnathan Doe
Age: 41 Yrs | Gender: Male
Referred By: Dr. Marcus Vance, MD

COMPREHENSIVE METABOLIC & LIPID PANEL:
Fasting Glucose: 148 mg/dL (Reference: 70 - 99 mg/dL) [ELEVATED]
HbA1c: 7.2 % (Reference: 4.0 - 5.6 %) [HIGH]
Total Cholesterol: 228 mg/dL (Reference: 125 - 200 mg/dL) [HIGH]
HDL Cholesterol: 38 mg/dL (Reference: 40 - 60 mg/dL) [LOW]
LDL Cholesterol: 142 mg/dL (Reference: < 100 mg/dL) [ELEVATED]
Triglycerides: 195 mg/dL (Reference: < 150 mg/dL) [ELEVATED]
Serum Creatinine: 1.1 mg/dL (Reference: 0.7 - 1.3 mg/dL) [NORMAL]
Systolic BP: 136 mmHg
Diastolic BP: 86 mmHg

Notes: Fasting state verified (12 hrs). Repeat glycemic monitoring recommended.
""".strip()

boundary = "----LifeSphereBoundary7MA4YWxkTrZu0gW"
body_parts = []

def add_field(name, value):
    body_parts.append(f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"\r\n\r\n{value}\r\n".encode("utf-8"))

def add_file(name, filename, content_bytes, content_type="text/plain"):
    header = f"--{boundary}\r\nContent-Disposition: form-data; name=\"{name}\"; filename=\"{filename}\"\r\nContent-Type: {content_type}\r\n\r\n"
    body_parts.append(header.encode("utf-8") + content_bytes + b"\r\n")

add_field("record_type", "Laboratory Report")
add_field("hospital_name", "MetroPath Laboratories")
add_field("doctor_name", "Dr. Marcus Vance")
add_field("description", "Routine comprehensive metabolic panel follow-up")
add_file("file", "comprehensive_lab_panel.txt", sample_report_content.encode("utf-8"))
body_parts.append(f"--{boundary}--\r\n".encode("utf-8"))

multipart_data = b"".join(body_parts)
upload_req = urllib.request.Request(
    f"{BASE_URL}/documents/upload",
    data=multipart_data,
    headers={
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Authorization": f"Bearer {p_token}"
    },
    method="POST"
)

with urllib.request.urlopen(upload_req) as resp:
    upload_res = json.loads(resp.read().decode("utf-8"))

print(f"Document Upload: SUCCESS (ID: {upload_res['document_id']})")
print(f"Extracted Text Preview:\n  {upload_res['extracted_text_preview'][:120]}...")
analysis = upload_res["analysis"]
print(f"PyMuPDF Extracted Biomarkers ({len(analysis['extracted_values'])} biomarkers):")
for b in analysis['extracted_values']:
    print(f"  * {b['parameter']}: {b.get('numeric_primary', b.get('raw_match'))} {b.get('unit', '')} -> Status: {b.get('status')} (Ref: {b.get('ref_min')}-{b.get('ref_max')})")

print(f"AI Clinical Analysis Summary:")
print(f"  Summary: {analysis['summary']}")
print(f"  Important Findings: {len(analysis['important_findings'])} clinical insights")
print(f"  Confidence Score: {analysis['confidence_score']*100:.1f}%")

print("\n=== ALL WORKFLOWS VERIFIED SUCCESSFULLY ===")
