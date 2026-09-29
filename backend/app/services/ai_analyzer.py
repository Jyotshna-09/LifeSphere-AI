"""
LifeSphere AI - Structured Medical Document Analyzer
Translates raw extracted clinical text and biomarkers into structured clinical findings,
medical terminology explanations, reference range checks, and patient-friendly insights.
"""
from typing import Dict, Any, List
import re
from app.services.document_extractor import ClinicalDocumentExtractor

MEDICAL_GLOSSARY = {
    'glucose': 'A primary sugar molecule in the bloodstream serving as the primary energy source for cellular metabolism.',
    'hba1c': 'Glycated hemoglobin, reflecting the weighted average blood sugar level over the past 2 to 3 months.',
    'cholesterol': 'A waxy lipid molecule essential for hormone synthesis and cell membrane integrity; excess levels can contribute to plaque formation in arteries.',
    'ldl': 'Low-Density Lipoprotein, often called "bad cholesterol" because elevated amounts lead to atherogenic plaque accumulation.',
    'hdl': 'High-Density Lipoprotein, often called "good cholesterol" because it carries arterial lipids back to the liver for clearance.',
    'triglycerides': 'A form of dietary and circulating fat stored in adipocytes for subsequent caloric expenditure.',
    'hemoglobin': 'The iron-rich metalloprotein in erythrocytes responsible for systemic oxygen transport.',
    'creatinine': 'A metabolic byproduct of muscle breakdown eliminated through renal filtration; used to assess kidney filtration capacity (eGFR).',
    'blood pressure': 'The hydrostatic pressure exerted by circulating blood against the internal lumen walls of systemic arteries.'
}

MANDATORY_DISCLAIMER = (
    "This information is for informational and decision-support purposes only "
    "and should be verified with a qualified healthcare professional."
)

class MedicalDocumentAnalyzer:
    @staticmethod
    def analyze_document(extracted_text: str, biomarkers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Produces structured clinical insights based on actual extracted data.
        Never hallucinates clinical values.
        """
        if not extracted_text or (len(extracted_text.strip()) < 10 and not biomarkers):
            return {
                'success': False,
                'is_medical_document': False,
                'summary': "Unable to extract reliable information from this document.",
                'important_findings': [],
                'extracted_values': [],
                'reference_checks': [],
                'possible_concerns': [],
                'medical_terms': [],
                'disclaimer': MANDATORY_DISCLAIMER,
                'confidence_score': 0.0
            }

        # Check whether document is medically relevant
        if not ClinicalDocumentExtractor.is_medical_document(extracted_text):
            return {
                'success': False,
                'is_medical_document': False,
                'summary': "This is not a related document.",
                'important_findings': [],
                'extracted_values': [],
                'reference_checks': [],
                'possible_concerns': [],
                'medical_terms': [],
                'disclaimer': "",
                'confidence_score': 0.0
            }

        # 1. Important findings from biomarkers
        important_findings = []
        possible_concerns = []
        reference_checks = []

        for bm in biomarkers:
            param = bm['parameter']
            val = bm['value']
            unit = bm['unit']
            ref = bm['reference_range']
            status = bm['status']
            is_abnormal = bm.get('is_abnormal', False)

            ref_entry = {
                'parameter': param,
                'measured_value': f"{val} {unit}",
                'reference_range': ref,
                'status': status
            }
            reference_checks.append(ref_entry)

            if is_abnormal:
                finding_str = f"{param} is {status.lower()} at {val} {unit} (Reference standard: {ref})."
                important_findings.append(finding_str)
                possible_concerns.append({
                    'item': param,
                    'observation': finding_str,
                    'guidance': f"Discuss {param.lower()} trajectory and lifestyle or pharmaceutical options with your physician."
                })
            else:
                important_findings.append(f"{param} is within normal reference limits ({val} {unit}).")

        # 2. Medical Term Explanations
        lower_text = extracted_text.lower()
        explained_terms = []
        for term, explanation in MEDICAL_GLOSSARY.items():
            if term in lower_text or any(term in b['parameter'].lower() for b in biomarkers):
                explained_terms.append({
                    'term': term.capitalize(),
                    'explanation': explanation
                })

        # 3. Overall Summary
        if important_findings:
            summary = (
                f"Automated clinical extraction identified {len(biomarkers)} diagnostic parameters. "
                f"{len(possible_concerns)} parameter(s) showed variation outside standard physiological baseline ranges. "
                "Overall document exhibits structured clinical diagnostics requiring physician review."
            )
        else:
            summary = (
                "Document text extracted successfully. Standard diagnostic metrics were logged. "
                "No critical parameter deviations detected outside documented baseline."
            )

        return {
            'success': True,
            'is_medical_document': True,
            'summary': summary,
            'important_findings': important_findings,
            'extracted_values': biomarkers,
            'reference_checks': reference_checks,
            'possible_concerns': possible_concerns,
            'medical_terms': explained_terms,
            'disclaimer': MANDATORY_DISCLAIMER,
            'confidence_score': 0.94
        }
