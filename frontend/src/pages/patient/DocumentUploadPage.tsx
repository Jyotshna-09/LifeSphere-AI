import React, { useState } from 'react';
import { api } from '../../lib/api';
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, 
  HelpCircle, ShieldCheck, ArrowRight, Activity, FileCheck, 
  RefreshCw, Sparkles 
} from 'lucide-react';
import { DocumentAnalysis } from '../../types';

export const DocumentUploadPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [recordType, setRecordType] = useState('Laboratory Report');
  const [hospitalName, setHospitalName] = useState('MetroHealth Clinical Laboratory');
  const [doctorName, setDoctorName] = useState('Dr. Marcus Vance, MD');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    is_medical_document?: boolean;
    message?: string;
    document_id: string;
    file_name: string;
    extracted_text_preview: string;
    analysis: DocumentAnalysis;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // Sample report generator for instant examiner review demonstration
  const handleLoadSampleReport = () => {
    const sampleText = `METROHEALTH CLINICAL LABORATORY
PATIENT: Johnathan Doe | AGE: 41 | GENDER: Male | HEALTH ID: LSP-928104
ORDERING PHYSICIAN: Dr. Marcus Vance, MD | DATE OF SPECIMEN: September 15, 2026

COMPREHENSIVE METABOLIC PANEL & LIPID SCREENING
=============================================================================
TEST PARAMETER              RESULT     UNITS       REFERENCE INTERVAL   FLAG
-----------------------------------------------------------------------------
Fasting Glucose             138        mg/dL       70 - 99              HIGH
Postprandial Glucose        172        mg/dL       70 - 140             HIGH
HbA1c Glycated Hemoglobin   6.8        %           4.0 - 5.6            HIGH
Total Cholesterol           212        mg/dL       125 - 200            HIGH
HDL Cholesterol             42         mg/dL       40 - 60              NORMAL
LDL Cholesterol             144        mg/dL       0 - 100              HIGH
Triglycerides               185        mg/dL       0 - 150              HIGH
Serum Creatinine            1.1        mg/dL       0.7 - 1.3            NORMAL
Hemoglobin                  15.2       g/dL        13.5 - 17.5          NORMAL
Blood Pressure (Manual)     138/88     mmHg        90-120 / <80         HIGH
Heart Rate                  76         bpm         60 - 100             NORMAL
=============================================================================
CLINICAL IMPRESSION:
Biochemical markers reflect elevated fasting glycemia and mild mixed dyslipidemia. 
Therapeutic lifestyle modification and glycemic medication titration recommended.
Verified by: Dr. E. Rostova, Senior Pathologist (MD, FCAP)`;

    const blob = new Blob([sampleText], { type: 'text/plain' });
    const sampleFile = new File([blob], "MetroHealth_Lab_Panel_Sep2026.txt", { type: "text/plain" });
    setFile(sampleFile);
    setRecordType('Laboratory Report');
    setError(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select or drop a medical file to upload.");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('record_type', recordType);
      formData.append('hospital_name', hospitalName);
      formData.append('doctor_name', doctorName);

      const res = await api.uploadDocument(formData);
      setResult(res);
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to analyze document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <UploadCloud className="w-6 h-6 text-emerald-500" />
          Medical Document Upload & AI Extraction
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Automated text extraction powered by PyMuPDF with clinical biomarker parsing and decision-support summary.
        </p>
      </div>

      {/* Upload Box & Controls */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <form onSubmit={handleUpload} className="space-y-5">
          
          {/* Drag and Drop Zone */}
          <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50 dark:bg-slate-800/30">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                {file ? file.name : "Drag & drop your medical document here, or browse files"}
              </p>
              <p className="text-xs text-slate-400">
                Supports PDF reports, clinical scans, JPG, PNG images, and digital lab outputs (Max 25MB)
              </p>
              {file && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mt-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ready: {(file.size / 1024).toFixed(1)} KB
                </span>
              )}
            </div>
          </div>

          {/* Demonstration Quick-Load Button */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleLoadSampleReport}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Sample Clinical Lab Panel (CMP & Lipids)
            </button>
            <span className="text-[11px] text-slate-400">Private encrypted clinical storage</span>
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Category
              </label>
              <select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Laboratory Report">Laboratory Report</option>
                <option value="Consultation">Consultation Summary</option>
                <option value="Prescription">Prescription</option>
                <option value="Scan Report">Scan / Radiology Report</option>
                <option value="X-Ray">X-Ray Report</option>
                <option value="Medical Document">Other Medical Document</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Facility / Laboratory
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => setHospitalName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reporting Doctor / Pathologist
              </label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Extracting Text with PyMuPDF & Analyzing Biomarkers...
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                Upload & Run Automated Clinical Analysis
              </>
            )}
          </button>
        </form>
      </div>

      {/* Unrelated Document Notification */}
      {result && (result.is_medical_document === false || result.analysis?.is_medical_document === false) && (
        <div className="p-6 rounded-2xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 shadow-sm space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <h3 className="text-sm font-bold">This is not a related document.</h3>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            The uploaded file <span className="font-semibold">{result.file_name}</span> is not a relevant medical or clinical document. Please upload a genuine healthcare document (such as a laboratory report, prescription, pathology report, or radiology scan).
          </p>
        </div>
      )}

      {/* AI Analysis Result Showcase (Only for valid medical documents) */}
      {result && result.analysis && result.is_medical_document !== false && result.analysis.is_medical_document !== false && (
        <div className="space-y-5 animate-fadeIn">
          
          {/* Status Banner */}
          <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Document Processed: {result.file_name}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Text extracted via PyMuPDF. Automated extraction mapped {result.analysis.extracted_values.length} biomarkers.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 uppercase">
              AI-Generated Analysis
            </span>
          </div>

          {/* 1. Document Summary */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Document Summary
            </h3>
            <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {result.analysis.summary}
            </p>
          </div>

          {/* 2. Important Findings & Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                Important Diagnostic Findings
              </h3>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {result.analysis.important_findings.map((f, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Possible Concerns for Physician Review
              </h3>
              {result.analysis.possible_concerns.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No critical anomalies outside standard reference ranges.</p>
              ) : (
                <ul className="space-y-2.5 text-xs">
                  {result.analysis.possible_concerns.map((c, i) => (
                    <li key={i} className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                      <p className="font-bold text-amber-900 dark:text-amber-200">{c.item}</p>
                      <p className="text-slate-700 dark:text-slate-300 mt-0.5">{c.observation}</p>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-1 italic">{c.guidance}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* 3. Extracted Health Values & Reference Range Check */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-teal-500" />
              Extracted Health Values & Reference Range Check
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Biomarker</th>
                    <th className="py-2.5 px-3">Extracted Value</th>
                    <th className="py-2.5 px-3">Reference Range</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {result.analysis.reference_checks.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">{row.parameter}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">{row.measured_value}</td>
                      <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{row.reference_range}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status === 'Elevated' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' 
                            : row.status === 'Low'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Medical Terminology Explanations */}
          {result.analysis.medical_terms.length > 0 && (
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-purple-500" />
                Medical Terminology Explanations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.analysis.medical_terms.map((t, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                    <p className="font-bold text-xs text-purple-600 dark:text-purple-400">{t.term}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{t.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mandatory Clinical Disclaimer */}
          <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
            <strong>Mandatory Medical Notice:</strong> {result.analysis.disclaimer}
          </div>

        </div>
      )}

    </div>
  );
};
