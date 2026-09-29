"""
LifeSphere AI - Clinical Safety & Decision-Support Engines
1. Medication Interaction Cross-Checker
2. Duplicate / Recent Test Detector
Strictly rule-based and knowledge-driven. Never fabricates interactions or clinical advice.
"""
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from datetime import date, timedelta
from app.db import models

SAFETY_DISCLAIMER = "Please consult a qualified healthcare professional before making any medication changes."

class SafetyEngine:
    @staticmethod
    def check_medication_interactions(db: Session, patient_id: str) -> List[Dict[str, Any]]:
        """
        Cross-checks all active medications for the patient against the verified interaction knowledge base.
        """
        meds = db.query(models.PatientMedication).filter(
            models.PatientMedication.patient_id == patient_id,
            models.PatientMedication.is_active == True
        ).all()

        if len(meds) < 2:
            return []

        active_med_names = [m.medication_name.strip().lower() for m in meds]
        interactions_found = []

        all_interactions = db.query(models.MedicationInteraction).all()
        for inter in all_interactions:
            med_a = inter.medication_a.strip().lower()
            med_b = inter.medication_b.strip().lower()

            match_a = any(med_a in name or name in med_a for name in active_med_names)
            match_b = any(med_b in name or name in med_b for name in active_med_names)

            if match_a and match_b:
                interactions_found.append({
                    'id': inter.id,
                    'medication_a': inter.medication_a,
                    'medication_b': inter.medication_b,
                    'severity': inter.severity,
                    'interaction_description': inter.interaction_description,
                    'clinical_advice': inter.clinical_advice,
                    'source': inter.source,
                    'alert_title': "Potential medication interaction detected.",
                    'disclaimer': SAFETY_DISCLAIMER
                })

        return interactions_found

    @staticmethod
    def detect_duplicate_tests(db: Session, patient_id: str, threshold_days: int = 60) -> List[Dict[str, Any]]:
        """
        Detects if identical or clinically overlapping laboratory/diagnostic procedures
        were ordered or recorded within a recent interval (e.g. 60 days).
        Does NOT declare the test unnecessary.
        """
        records = db.query(models.MedicalRecord).filter(
            models.MedicalRecord.patient_id == patient_id,
            models.MedicalRecord.record_type.in_(['Laboratory Report', 'Scan Report', 'X-Ray'])
        ).order_by(models.MedicalRecord.record_date.desc()).all()

        duplicate_alerts = []
        seen = []

        for r in records:
            # Clean title
            norm_title = r.title.strip().lower()
            # Check against previously processed records (which are newer)
            for prev in seen:
                # Diagnostic panel groupings
                related_groups = [
                    ['glucose', 'glycemic', 'hba1c', 'diabetes', 'metabolic', 'cmp', 'bmp'],
                    ['lipid', 'cholesterol', 'triglyceride', 'hdl', 'ldl', 'lipid panel'],
                    ['cbc', 'hemogram', 'blood count', 'platelet', 'hemoglobin'],
                    ['liver', 'lft', 'hepatic', 'alt', 'ast', 'bilirubin'],
                    ['renal', 'kft', 'kidney', 'creatinine', 'bun', 'urea'],
                    ['thyroid', 'tsh', 't3', 't4']
                ]

                is_exact = norm_title == prev['title'].lower()
                is_shared_group = any(
                    any(term in norm_title for term in group) and any(term in prev['title'].lower() for term in group)
                    for group in related_groups
                )

                if is_exact or is_shared_group:
                    days_diff = abs((prev['date'] - r.record_date).days)
                    if days_diff <= threshold_days and days_diff > 0:
                        duplicate_alerts.append({
                            'alert_title': "Potential duplicate/recently repeated test detected.",
                            'current_test': prev['title'],
                            'current_date': str(prev['date']),
                            'current_record_id': prev['id'],
                            'previous_test': r.title,
                            'previous_date': str(r.record_date),
                            'previous_record_id': r.id,
                            'test_type': r.record_type,
                            'days_difference': days_diff,
                            'reason': (
                                f"Similar diagnostic panel '{r.title}' was recorded {days_diff} days ago "
                                f"on {r.record_date} under {r.doctor_name or 'Provider'} at {r.hospital_name or 'Facility'}."
                            ),
                            'guidance': "Review the clinical indication with your physician to ensure repeat testing aligns with diagnostic continuity."
                        })
            seen.append({
                'id': r.id,
                'title': r.title,
                'date': r.record_date
            })

        return duplicate_alerts
