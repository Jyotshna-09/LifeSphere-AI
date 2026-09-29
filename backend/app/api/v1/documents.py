"""
LifeSphere AI - Medical Document Upload & PyMuPDF AI Analysis Endpoints
"""
import os
import uuid
import shutil
from datetime import date, datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.config import UPLOADS_DIR
from app.db.database import get_db
from app.db import models
from app.security.auth import get_current_user
from app.services.document_extractor import ClinicalDocumentExtractor
from app.services.ai_analyzer import MedicalDocumentAnalyzer
from app.services.audit_service import AuditService

router = APIRouter(prefix="/documents", tags=["Medical Documents"])

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    record_type: str = Form("Laboratory Report"),
    hospital_name: Optional[str] = Form("Clinical Diagnostic Laboratory"),
    doctor_name: Optional[str] = Form("Reporting Pathologist"),
    record_date: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file extension
    filename = file.filename or "medical_document.pdf"
    ext = os.path.splitext(filename)[1].lower()
    allowed_exts = [".pdf", ".jpg", ".jpeg", ".png", ".txt"]
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Supported formats: {', '.join(allowed_exts)}"
        )

    # Save file to private uploads directory
    doc_id = str(uuid.uuid4())
    saved_filename = f"{doc_id}_{filename}"
    file_path = os.path.join(UPLOADS_DIR, saved_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(file_path)

    # PyMuPDF text extraction
    extracted_text = ClinicalDocumentExtractor.extract_text_from_file(file_path)

    # Check whether document is medically relevant
    if not ClinicalDocumentExtractor.is_medical_document(extracted_text):
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        return {
            "success": False,
            "is_medical_document": False,
            "message": "This is not a related document.",
            "document_id": "",
            "record_id": "",
            "file_name": filename,
            "extracted_text_preview": extracted_text[:300] + ("..." if len(extracted_text) > 300 else ""),
            "analysis": {
                "is_medical_document": False,
                "summary": "This is not a related document.",
                "important_findings": [],
                "extracted_values": [],
                "reference_checks": [],
                "possible_concerns": [],
                "medical_terms": [],
                "disclaimer": "",
                "confidence_score": 0.0
            }
        }

    # Extract biomarkers
    biomarkers = ClinicalDocumentExtractor.extract_biomarkers(extracted_text)

    # Run AI Analysis
    analysis_result = MedicalDocumentAnalyzer.analyze_document(extracted_text, biomarkers)

    # Parse record date
    rec_date = date.today()
    if record_date:
        try:
            rec_date = datetime.strptime(record_date, "%Y-%m-%d").date()
        except ValueError:
            rec_date = date.today()

    # Create parent Medical Record
    title = f"{record_type}: {os.path.splitext(filename)[0]}"
    medical_rec = models.MedicalRecord(
        id=str(uuid.uuid4()),
        patient_id=current_user.id,
        record_type=record_type,
        title=title,
        description=description or analysis_result.get("summary", "Uploaded medical report."),
        record_date=rec_date,
        hospital_name=hospital_name,
        doctor_name=doctor_name,
        document_url=f"/api/v1/documents/{doc_id}/file",
        is_verified=True
    )
    db.add(medical_rec)

    # Create MedicalDocument entry
    med_doc = models.MedicalDocument(
        id=doc_id,
        patient_id=current_user.id,
        record_id=medical_rec.id,
        file_name=filename,
        file_type=ext.replace(".", "").upper(),
        file_size=file_size,
        storage_path=file_path,
        mime_type=file.content_type,
        extracted_text=extracted_text,
        is_processed=True
    )
    db.add(med_doc)

    # Create DocumentAnalysis record
    doc_analysis = models.DocumentAnalysis(
        document_id=doc_id,
        patient_id=current_user.id,
        summary=analysis_result["summary"],
        important_findings=analysis_result["important_findings"],
        extracted_values=analysis_result["extracted_values"],
        reference_checks=analysis_result["reference_checks"],
        possible_concerns=analysis_result["possible_concerns"],
        medical_terms=analysis_result["medical_terms"],
        confidence_score=analysis_result["confidence_score"]
    )
    db.add(doc_analysis)

    # Auto-log extracted biomarkers to HealthMetrics if applicable
    for bm in biomarkers:
        if bm.get("numeric_primary") is not None:
            metric = models.HealthMetric(
                patient_id=current_user.id,
                metric_type=bm["parameter"],
                value_primary=bm["numeric_primary"],
                value_secondary=bm.get("numeric_secondary"),
                unit=bm["unit"],
                notes=f"Auto-extracted from uploaded report '{filename}'",
                recorded_at=datetime.utcnow()
            )
            db.add(metric)

    # Notification
    notif = models.Notification(
        user_id=current_user.id,
        title="Document Analysis Completed",
        message=f"Report '{filename}' uploaded and analyzed. {len(biomarkers)} clinical parameters extracted.",
        notification_type="document",
        metadata_json={"document_id": doc_id, "record_id": medical_rec.id}
    )
    db.add(notif)

    # Audit log
    AuditService.log_event(
        db=db,
        action="DOCUMENT_UPLOAD_AND_ANALYSIS",
        resource_type="MEDICAL_DOCUMENT",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=doc_id,
        details={"file_name": filename, "file_size": file_size, "biomarkers_found": len(biomarkers)}
    )

    db.commit()

    return {
        "success": True,
        "is_medical_document": True,
        "message": "Report uploaded and analyzed successfully.",
        "document_id": doc_id,
        "record_id": medical_rec.id,
        "file_name": filename,
        "extracted_text_preview": extracted_text[:300] + ("..." if len(extracted_text) > 300 else ""),
        "analysis": analysis_result
    }

@router.get("/{document_id}/analysis")
def get_document_analysis(
    document_id: str,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(models.DocumentAnalysis).filter(models.DocumentAnalysis.document_id == document_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Document analysis not found")

    # Authorization check
    if current_user.role == "patient" and analysis.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to document analysis")

    return analysis

@router.get("/{document_id}/file")
def get_document_file(
    document_id: str,
    current_user: models.Profile = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc = db.query(models.MedicalDocument).filter(models.MedicalDocument.id == document_id).first()
    if not doc or not os.path.exists(doc.storage_path):
        raise HTTPException(status_code=404, detail="Document file not found")

    # Patient ownership or Doctor consent check
    if current_user.role == "patient" and doc.patient_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to document")
    elif current_user.role == "doctor":
        consent = db.query(models.Consent).filter(
            models.Consent.patient_id == doc.patient_id,
            models.Consent.doctor_id == current_user.id,
            models.Consent.access_status == "Granted"
        ).first()
        if not consent:
            raise HTTPException(status_code=403, detail="Doctor access revoked or not granted for this document")

    AuditService.log_event(
        db=db,
        action="DOCUMENT_DOWNLOAD",
        resource_type="MEDICAL_DOCUMENT",
        user_id=current_user.id,
        user_role=current_user.role,
        resource_id=document_id
    )

    return FileResponse(
        path=doc.storage_path,
        filename=doc.file_name,
        media_type=doc.mime_type or "application/octet-stream"
    )
