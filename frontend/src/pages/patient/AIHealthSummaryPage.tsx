import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AISummary } from '../../types';
import { 
  Sparkles, FileText, User, Clock, Pill, 
  AlertTriangle, TrendingUp, CheckSquare, Stethoscope, 
  Printer, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AIHealthSummaryPage: React.FC = () => {
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getAISummary();
        setSummary(data);
      } catch (err) {
        console.error("AI Summary error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold mb-2 border border-teal-200 dark:border-teal-800">
            <Sparkles className="w-3.5 h-3.5" />
            Longitudinal Clinical Intelligence
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            10-Point AI Health Summary
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Synthesized dynamically from verified database records. No hallucinated or invented information.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          Print / Export Report
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Synthesizing longitudinal health summary...</div>
      ) : !summary ? (
        <div className="p-12 text-center text-xs text-slate-400">Unable to generate summary. Please check clinical records.</div>
      ) : (
        <div className="space-y-4">
          
          {/* Section 1: Patient Overview */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <User className="w-4 h-4 text-emerald-500" />
              1. Patient Overview
            </div>
            <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {summary.patient_overview}
            </p>
          </div>

          {/* Section 2 & 3: Medical History & Recent Events */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileText className="w-4 h-4 text-blue-500" />
                2. Medical History
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.medical_history}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Clock className="w-4 h-4 text-purple-500" />
                3. Recent Events
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.recent_events}
              </p>
            </div>
          </div>

          {/* Section 4 & 5: Current Medications & Known Allergies */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Pill className="w-4 h-4 text-teal-500" />
                4. Current Medications
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.current_medications}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                5. Known Allergies
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.known_allergies}
              </p>
            </div>
          </div>

          {/* Section 6: Important Lab Trends */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              6. Important Lab Trends
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
              {summary.lab_trends}
            </p>
          </div>

          {/* Section 7 & 8: Recorded Diagnoses & Recent Changes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                7. Recorded Diagnoses
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.recorded_diagnoses}
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                8. Recent Changes
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {summary.recent_changes}
              </p>
            </div>
          </div>

          {/* Section 9: Points for Doctor Review */}
          <div className="p-5 rounded-2xl border border-teal-300 dark:border-teal-800/80 bg-teal-50/50 dark:bg-teal-950/30 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              <Stethoscope className="w-4 h-4 text-teal-600" />
              9. Points for Doctor Review
            </div>
            <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
              {summary.doctor_review_points}
            </div>
          </div>

          {/* Section 10: Supporting Records */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <FileText className="w-4 h-4 text-slate-500" />
                10. Supporting Clinical Records
              </div>
              <Link to="/records" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                View All Records
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {summary.supporting_records.map((r) => (
                <div key={r.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">{r.type}</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{r.title}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Recorded: {r.date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clinical Disclaimer */}
          <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
            <strong>Mandatory Medical Notice:</strong> This summary is generated from verified longitudinal database records for academic decision-support purposes only. Please verify all clinical points with a qualified medical practitioner.
          </div>

        </div>
      )}

    </div>
  );
};
