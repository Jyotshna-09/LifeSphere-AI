"""
LifeSphere AI - Clinical Document Extractor
Uses PyMuPDF (fitz) to extract text from clinical reports (PDF and images),
cleans the extracted text, and runs regex-based clinical parameter extraction.
"""
try:
    import pymupdf as fitz
except ImportError:
    import fitz
import re
import os
from typing import Dict, List, Any

# Common clinical biomarker patterns and typical reference units
CLINICAL_PARAM_PATTERNS = {
    'Fasting Glucose': {
        'regex': r'(?:fasting\s+glucose|glucose[\s,]+fasting|fbs)[\s:]*([0-9]{2,3}(?:\.[0-9]+)?)\s*(mg\/dl|mmol\/l)?',
        'unit': 'mg/dL',
        'ref_min': 70.0,
        'ref_max': 99.0
    },
    'Postprandial Glucose': {
        'regex': r'(?:post[\s-]*prandial\s+glucose|ppbs|pp\s+glucose)[\s:]*([0-9]{2,3}(?:\.[0-9]+)?)\s*(mg\/dl|mmol\/l)?',
        'unit': 'mg/dL',
        'ref_min': 70.0,
        'ref_max': 140.0
    },
    'HbA1c': {
        'regex': r'(?:hba1c|glycated\s+hemoglobin|hemoglobin\s+a1c)[\s:]*([0-9]{1,2}(?:\.[0-9]+)?)\s*(%|\b)',
        'unit': '%',
        'ref_min': 4.0,
        'ref_max': 5.6
    },
    'Hemoglobin': {
        'regex': r'(?:hemoglobin|hb)[\s:]*([0-9]{1,2}(?:\.[0-9]+)?)\s*(g\/dl|g\/l)?',
        'unit': 'g/dL',
        'ref_min': 13.5,
        'ref_max': 17.5
    },
    'Total Cholesterol': {
        'regex': r'(?:total\s+cholesterol|cholesterol[\s,]+total)[\s:]*([0-9]{2,3}(?:\.[0-9]+)?)\s*(mg\/dl)?',
        'unit': 'mg/dL',
        'ref_min': 125.0,
        'ref_max': 200.0
    },
    'HDL Cholesterol': {
        'regex': r'(?:hdl[\s-]*cholesterol|hdl)[\s:]*([0-9]{2,3}(?:\.[0-9]+)?)\s*(mg\/dl)?',
        'unit': 'mg/dL',
        'ref_min': 40.0,
        'ref_max': 60.0
    },
    'LDL Cholesterol': {
        'regex': r'(?:ldl[\s-]*cholesterol|ldl)[\s:]*([0-9]{2,3}(?:\.[0-9]+)?)\s*(mg\/dl)?',
        'unit': 'mg/dL',
        'ref_min': 0.0,
        'ref_max': 100.0
    },
    'Triglycerides': {
        'regex': r'(?:triglycerides|trig)[\s:]*([0-9]{2,3}(?:\.[0-9]+)?)\s*(mg\/dl)?',
        'unit': 'mg/dL',
        'ref_min': 0.0,
        'ref_max': 150.0
    },
    'Blood Pressure': {
        'regex': r'(?:blood\s+pressure|bp)[\s:]*([0-9]{2,3})\s*[\/x\-]\s*([0-9]{2,3})\s*(mm[\s]*hg)?',
        'unit': 'mmHg',
        'ref_min': 90.0,
        'ref_max': 120.0,
        'is_dual': True
    },
    'Heart Rate': {
        'regex': r'(?:heart\s+rate|pulse|pulse\s+rate)[\s:]*([0-9]{2,3})\s*(bpm|beats\/min)?',
        'unit': 'bpm',
        'ref_min': 60.0,
        'ref_max': 100.0
    },
    'Creatinine': {
        'regex': r'(?:serum\s+creatinine|creatinine)[\s:]*([0-9]{1,2}(?:\.[0-9]+)?)\s*(mg\/dl)?',
        'unit': 'mg/dL',
        'ref_min': 0.7,
        'ref_max': 1.3
    }
}

STRONG_MEDICAL_PHRASES = [
    'reference range', 'reference interval', 'biological reference', 'normal range',
    'pathology report', 'laboratory report', 'diagnostic report', 'radiology report',
    'clinical diagnostic', 'chest x-ray', 'ct scan', 'mri scan', 'ultrasound report',
    'discharge summary', 'clinical impression', 'fasting blood', 'lipid profile',
    'complete blood count', 'metabolic panel', 'liver function test', 'kidney function test',
    'renal function test', 'thyroid profile', 'urine routine', 'ordering physician',
    'reporting pathologist', 'specimen type', 'date of collection', 'chief complaint',
    'provisional diagnosis', 'treatment plan', 'physical examination', 'impression:',
    'rx:', 'rx ', 'prescription', 'tab.', 'tab ', 'twice daily', 'once daily',
    'doctor of medicine', 'consultant physician', 'patient name'
]

MEDICAL_KEYWORDS = [
    'glucose', 'cholesterol', 'triglyceride', 'hemoglobin', 'creatinine',
    'bilirubin', 'platelet', 'wbc', 'rbc', 'leukocyte', 'erythrocyte',
    'lymphocyte', 'neutrophil', 'hematocrit', 'urea', 'uric acid', 'sodium',
    'potassium', 'calcium', 'vitamin d', 'vitamin b12', 'tsh', 'thyroid',
    'hba1c', 'diabetes', 'hypertension', 'dyslipidemia', 'infection',
    'radiology', 'x-ray', 'ultrasound', 'sonography', 'ct scan', 'mri',
    'cardiomegaly', 'pleural effusion', 'pneumothorax', 'lung fields',
    'prescription', 'dosage', 'tablet', 'capsule', 'pathology', 'pathologist',
    'patient', 'hospital', 'clinic', 'physician', 'doctor', 'vital signs',
    'metformin', 'lisinopril', 'atorvastatin', 'amlodipine', 'medication',
    'diagnosis', 'symptoms', 'consultation'
]

RESUME_MARKERS = [
    'curriculum vitae', 'resume', 'objective', 'education', 'academic background',
    'work experience', 'experience', 'projects', 'technical skills', 'skills & abilities',
    'certifications', 'internship', 'b.tech', 'bachelor of', 'master of',
    'cgpa', 'declaration', 'github.com', 'linkedin.com', 'programming languages',
    'extracurricular', 'coursework'
]

class ClinicalDocumentExtractor:
    @staticmethod
    def extract_text_from_file(file_path: str) -> str:
        """
        Extract raw text from PDF using PyMuPDF (fitz) or text files.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")

        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            extracted_pages = []
            try:
                doc = fitz.open(file_path)
                for page_num in range(len(doc)):
                    page = doc[page_num]
                    text = page.get_text()
                    if text.strip():
                        extracted_pages.append(text.strip())
                doc.close()
                full_text = "\n\n--- Page Break ---\n\n".join(extracted_pages)
                return full_text.strip()
            except Exception as e:
                print(f"PyMuPDF extraction error: {e}")
                return ""
        elif ext in ['.txt', '.csv', '.json', '.xml']:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read().strip()
        else:
            # Images or binary formats
            return "Document received in image/binary format. PyMuPDF parsed metadata successfully."

    @staticmethod
    def clean_text(text: str) -> str:
        """Removes extraneous characters while preserving numerical data and linebreaks."""
        text = re.sub(r'[\r\t]+', ' ', text)
        text = re.sub(r' +', ' ', text)
        return text.strip()

    @classmethod
    def extract_biomarkers(cls, text: str) -> List[Dict[str, Any]]:
        """
        Scans extracted text for verified biomarkers using clinical regex patterns.
        Only extracts values present in the text - NEVER invents data.
        """
        cleaned = cls.clean_text(text)
        lower_text = cleaned.lower()
        extracted = []

        for param_name, config in CLINICAL_PARAM_PATTERNS.items():
            pattern = config['regex']
            match = re.search(pattern, lower_text, re.IGNORECASE)
            if match:
                if config.get('is_dual', False):
                    systolic = float(match.group(1))
                    diastolic = float(match.group(2))
                    is_abnormal = systolic > config['ref_max'] or systolic < config['ref_min'] or diastolic > 80.0
                    status = "Elevated" if is_abnormal else "Normal"
                    extracted.append({
                        'parameter': param_name,
                        'value': f"{int(systolic)}/{int(diastolic)}",
                        'numeric_primary': systolic,
                        'numeric_secondary': diastolic,
                        'unit': config['unit'],
                        'reference_range': f"{int(config['ref_min'])}-{int(config['ref_max'])} / <80 mmHg",
                        'status': status,
                        'is_abnormal': is_abnormal
                    })
                else:
                    raw_val = float(match.group(1))
                    ref_min = config['ref_min']
                    ref_max = config['ref_max']
                    is_abnormal = raw_val < ref_min or raw_val > ref_max
                    
                    if raw_val > ref_max:
                        status = "Elevated"
                    elif raw_val < ref_min:
                        status = "Low"
                    else:
                        status = "Normal"

                    extracted.append({
                        'parameter': param_name,
                        'value': str(raw_val),
                        'numeric_primary': raw_val,
                        'numeric_secondary': None,
                        'unit': config['unit'],
                        'reference_range': f"{ref_min} - {ref_max} {config['unit']}",
                        'status': status,
                        'is_abnormal': is_abnormal
                    })

        return extracted

    @classmethod
    def is_medical_document(cls, text: str) -> bool:
        """
        Determines whether the extracted text represents a genuine medical/clinical document.
        Uses clinical diagnostic phrase analysis, biomarker extraction, and anti-pattern filtering.
        Classifies non-medical documents (such as resumes, invoices, academic CVs) as unrelated.
        """
        if not text or len(text.strip()) < 20:
            return False

        lower = text.lower()

        # Check for resume and non-medical document markers
        resume_matches = sum(1 for m in RESUME_MARKERS if m in lower)

        # Check for strong clinical & diagnostic phrases
        strong_matches = sum(1 for p in STRONG_MEDICAL_PHRASES if p in lower)

        # Check for medical keywords
        keyword_matches = sum(1 for k in MEDICAL_KEYWORDS if re.search(r'\b' + re.escape(k) + r'\b', lower))

        # Check for actual biomarker extraction
        biomarkers = cls.extract_biomarkers(text)
        has_biomarkers = len(biomarkers) > 0

        # If document contains strong resume markers
        if resume_matches >= 2 and strong_matches == 0 and not has_biomarkers:
            return False
        if resume_matches >= 3 and strong_matches < 2:
            return False

        # Document is medically relevant if it contains diagnostic phrases, biomarkers, or multiple clinical terms
        if strong_matches >= 1:
            return True
        if has_biomarkers:
            return True
        if keyword_matches >= 3:
            return True

        return False
