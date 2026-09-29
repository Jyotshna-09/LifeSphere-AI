import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { 
  Users, Stethoscope, Search, ShieldCheck, ShieldAlert, 
  FileText, Activity, Clock, ArrowRight, UserCheck, 
  AlertTriangle, BrainCircuit, Sparkles 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, CartesianGrid } from 'recharts';

export const DoctorDashboardPage: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientFile, setPatientFile] = useState<any | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getDoctorPatients(search);
      setPatients(data);
    } catch (err) {
      console.error("Doctor patients load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, [search]);

  const handleSelectPatient = async (patientId: string) => {
    try {
      setSelectedPatientId(patientId);
      setFileLoading(true);
      setAccessError(null);
      const data = await api.getDoctorPatientDetail(patientId);
      setPatientFile(data);
    } catch (err: any) {
      console.error("Patient file access error:", err);
      setAccessError(err.message || "Access denied: Patient consent is inactive or revoked.");
      setPatientFile(null);
    } finally {
      setFileLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-800">
          <Stethoscope className="w-3.5 h-3.5" />
          Physician Clinical Workspace
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Authorized Patient Roster & Longitudinal Records
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Access permitted clinical records, AI summaries, and ML predictions for patients who have granted active consent.
        </p>
      </div>

      {/* Patient Search & Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Authorized Patient List */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Patient Name or Health ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2.5">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading authorized patients...</div>
            ) : patients.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs text-slate-400">
                No authorized patients found. Patient consent must be active.
              </div>
            ) : (
              patients.map(p => {
                const isSelected = selectedPatientId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{p.full_name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        Consented
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{p.health_id}</span>
                      <span>·</span>
                      <span>{p.record_count} Records</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Latest Risk:</span>
                      <span className={`font-bold ${
                        p.latest_risk_category === 'Elevated Risk' ? 'text-red-600 dark:text-red-400' :
                        p.latest_risk_category === 'Moderate Risk' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {p.latest_risk_category}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Columns: Patient Clinical Record View */}
        <div className="lg:col-span-2 space-y-4">
          {fileLoading ? (
            <div className="p-16 text-center text-xs text-slate-400">Loading authorized patient chart...</div>
          ) : accessError ? (
            <div className="p-8 rounded-2xl border border-red-300 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 text-center space-y-3">
              <ShieldAlert className="w-10 h-10 mx-auto text-red-500" />
              <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                Clinical Access Denied
              </h3>
              <p className="text-xs text-red-800 dark:text-red-300 max-w-md mx-auto leading-relaxed">
                {accessError}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                In compliance with patient sovereignty and HIPAA/GDPR clinical consent protocols, doctor access ceases immediately when a patient revokes permission.
              </p>
            </div>
          ) : !patientFile ? (
            <div className="p-16 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-xs text-slate-400">
              Select an authorized patient from the left roster to review their clinical record and ML assessments.
            </div>
          ) : (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Patient Header Card */}
              <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {patientFile.patient.full_name}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400">
                        {patientFile.patient.health_id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      DOB: {patientFile.patient.dob} · Gender: {patientFile.patient.gender} · Blood: {patientFile.patient.blood_group}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      <strong>Documented Conditions:</strong> {patientFile.patient.conditions_summary || 'None'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Consent Verified
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Granted: {patientFile.consent.granted_at}
                    </p>
                  </div>
                </div>
              </div>

              {/* Latest Machine Learning Risk Assessment with Real SHAP */}
              {patientFile.latest_prediction && (
                <div className="p-5 rounded-2xl border border-blue-200 dark:border-blue-900/60 bg-white dark:bg-slate-900 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4 text-blue-500" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Physician ML Risk Assessment & SHAP Explanation
                      </h3>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      patientFile.latest_prediction.risk_category === 'Elevated Risk' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                      patientFile.latest_prediction.risk_category === 'Moderate Risk' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {patientFile.latest_prediction.risk_category} ({(patientFile.latest_prediction.probability * 100).toFixed(1)}%)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Model: {patientFile.latest_prediction.model_name.replace('_', ' ').toUpperCase()} · Assessed on {patientFile.latest_prediction.created_at}
                  </p>

                  {/* SHAP Mini Bar Chart */}
                  {patientFile.latest_prediction.shap_summary && (
                    <div className="h-44 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={patientFile.latest_prediction.shap_summary}
                          layout="vertical"
                          margin={{ top: 0, right: 20, left: 65, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                          <XAxis type="number" tick={{ fontSize: 9 }} stroke="#64748b" />
                          <YAxis type="category" dataKey="feature_name" tick={{ fontSize: 10 }} stroke="#64748b" />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', fontSize: '10px' }} />
                          <ReferenceLine x={0} stroke="#64748b" />
                          <Bar dataKey="shap_value" radius={[3, 3, 3, 3]}>
                            {patientFile.latest_prediction.shap_summary.map((entry: any, i: number) => (
                              <Cell key={`c-${i}`} fill={entry.shap_value > 0 ? '#ef4444' : '#10b981'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )}

              {/* Permitted Medical Records List */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  Permitted Medical Records ({patientFile.records.length})
                </h3>

                <div className="space-y-2.5">
                  {patientFile.records.map((r: any) => (
                    <div key={r.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{r.title}</span>
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600">
                            {r.record_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {r.record_date} · {r.hospital_name || 'Clinical Facility'}
                        </p>
                      </div>

                      {r.document_url && (
                        <a
                          href={r.document_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-emerald-600 hover:underline text-[11px] font-semibold"
                        >
                          View Attachment
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
