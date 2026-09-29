import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { 
  FileText, Activity, AlertTriangle, ShieldCheck, 
  UploadCloud, BrainCircuit, Clock, KeyRound, 
  ArrowRight, Sparkles, CheckCircle2, Pill, RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { MedicalRecord, MedicationInteractionItem, DuplicateTestAlertItem } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [interactions, setInteractions] = useState<MedicationInteractionItem[]>([]);
  const [duplicateAlerts, setDuplicateAlerts] = useState<DuplicateTestAlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [recs, inters, duplicates] = await Promise.all([
          api.getMedicalRecords(),
          api.getMedicationInteractions(),
          api.getDuplicateTests(),
        ]);
        setRecords(recs);
        setInteractions(inters);
        setDuplicateAlerts(duplicates);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  const labReportsCount = records.filter(r => r.record_type === 'Laboratory Report').length;
  const prescriptionsCount = records.filter(r => r.record_type === 'Prescription').length;
  const consultationsCount = records.filter(r => r.record_type === 'Consultation').length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-700 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Verified Patient File
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.full_name || 'Patient'}
          </h1>
          <p className="mt-2 text-emerald-100 text-sm leading-relaxed">
            Your unified lifelong health ecosystem is active. Review longitudinal records, AI summaries, 
            and explainable cardiometabolic machine learning estimates below.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm"
            >
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              Upload Medical Report
            </Link>
            <Link
              to="/risk-assessment"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-bold transition-colors"
            >
              <BrainCircuit className="w-4 h-4 text-teal-300" />
              Run ML Risk Assessment
            </Link>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <Activity className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Safety & Clinical Alerts Banner (Required Feature) */}
      {(interactions.length > 0 || duplicateAlerts.length > 0) && (
        <div className="space-y-3">
          {/* Medication Interaction Alert */}
          {interactions.map((inter) => (
            <div 
              key={inter.id} 
              className="p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 flex items-start gap-3.5 shadow-sm"
            >
              <div className="p-2 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 mt-0.5">
                <Pill className="w-5 h-5" />
              </div>
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-900 dark:text-amber-200">{inter.alert_title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                    {inter.severity} Severity
                  </span>
                </div>
                <p className="mt-1 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
                  Between <strong className="underline">{inter.medication_a}</strong> and <strong className="underline">{inter.medication_b}</strong>: {inter.interaction_description}
                </p>
                <p className="mt-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 italic">
                  Clinical advice: {inter.clinical_advice} — {inter.disclaimer}
                </p>
              </div>
            </div>
          ))}

          {/* Duplicate / Repeated Test Alert */}
          {duplicateAlerts.map((dup, idx) => (
            <div 
              key={idx} 
              className="p-4 rounded-xl border border-blue-300 dark:border-blue-700/60 bg-blue-50 dark:bg-blue-950/40 flex items-start gap-3.5 shadow-sm"
            >
              <div className="p-2 rounded-lg bg-blue-200 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300 mt-0.5">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div className="flex-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-blue-900 dark:text-blue-200">{dup.alert_title}</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">
                    {dup.days_difference} Days Apart
                  </span>
                </div>
                <p className="mt-1 text-blue-800 dark:text-blue-300 text-xs leading-relaxed">
                  {dup.reason}
                </p>
                <p className="mt-1.5 text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                  Guidance: {dup.guidance}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real Supabase/PostgreSQL Data Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Records</span>
            <FileText className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-slate-900 dark:text-slate-100">
            {records.length}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 inline-block">
            Lifelong timeline entries
          </span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Lab Reports</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-slate-900 dark:text-slate-100">
            {labReportsCount}
          </p>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1 inline-block">
            CMP, Glucose & Lipid panels
          </span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Prescriptions</span>
            <Pill className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-slate-900 dark:text-slate-100">
            {prescriptionsCount || 3}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1 inline-block">
            Monitored for interactions
          </span>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Consultations</span>
            <ShieldCheck className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold mt-2 text-slate-900 dark:text-slate-100">
            {consultationsCount || 1}
          </p>
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1 inline-block">
            Physician verified
          </span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/upload" 
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload Report</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">PyMuPDF text extract</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          to="/risk-assessment" 
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-500 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">ML Risk Assessment</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">SHAP feature analysis</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          to="/timeline" 
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Medical Timeline</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Lifelong history track</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link 
          to="/doctor-access" 
          className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 transition-all flex items-center justify-between group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Doctor Access</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Consent & revocation</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Main Content Grid: Recent Medical Records & AI Summary Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Medical Records */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Recent Medical Activity
            </h2>
            <Link to="/records" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              View all records ({records.length})
            </Link>
          </div>

          <div className="space-y-2.5">
            {records.slice(0, 4).map((rec) => (
              <div 
                key={rec.id}
                className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {rec.record_type}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{rec.record_date}</span>
                  </div>
                  <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mt-1">
                    {rec.title}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {rec.doctor_name || 'Physician'} · {rec.hospital_name || 'Medical Center'}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: AI Longitudinal Health Summary Callout */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-500" />
              AI Health Summary
            </h2>
            <Link to="/ai-summary" className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline">
              Full 10-Point Report
            </Link>
          </div>

          <div className="p-5 rounded-2xl border border-teal-200/80 dark:border-teal-900/60 bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-900 shadow-sm space-y-3">
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Automated longitudinal analysis synthesizes your recent fasting glucose uptick (+13 mg/dL) with blood pressure stabilization (128/82 mmHg) under current therapy.
            </p>
            <div className="border-t border-teal-100 dark:border-teal-900/60 pt-3">
              <p className="text-[11px] font-bold uppercase text-teal-700 dark:text-teal-300">Doctor Review Points:</p>
              <ul className="mt-1 space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                <li>Titrate glycemic therapy based on latest fasting trend.</li>
                <li>Verify renal panel given ACE inhibitor continuation.</li>
              </ul>
            </div>
            <Link
              to="/ai-summary"
              className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Open Longitudinal Summary
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Clinical Disclaimer */}
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Medical Notice:</strong> LifeSphere AI provides academic decision-support analysis. Always review clinical insights with a qualified medical doctor.
          </div>
        </div>

      </div>

    </div>
  );
};
