import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ConsentItem } from '../../types';
import { 
  KeyRound, ShieldCheck, ShieldX, UserCheck, 
  Clock, Plus, CheckCircle2, AlertCircle, X, Check 
} from 'lucide-react';

export const DoctorAccessPage: React.FC = () => {
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('b0000000-0000-0000-0000-000000000002'); // Dr. Elena Rostova
  const [permissions, setPermissions] = useState({
    medical_records: true,
    lab_reports: true,
    prescriptions: true,
    timeline: true,
    health_trends: true,
    ai_summary: true,
    documents: true,
    risk_assessment: true
  });
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadConsents = async () => {
    try {
      setLoading(true);
      const data = await api.getConsents();
      setConsents(data);
    } catch (err) {
      console.error("Failed to load consents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.grantDoctorAccess(selectedDoctorId, permissions);
      setMessage({ text: res.message, type: 'success' });
      setShowGrantModal(false);
      loadConsents();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to grant access", type: 'error' });
    }
  };

  const handleRevoke = async (consentId: string, docName?: string) => {
    if (!confirm(`Are you sure you want to permanently revoke access for ${docName || 'this doctor'}? They will immediately lose authorization to view your records.`)) {
      return;
    }

    try {
      const res = await api.revokeDoctorAccess(consentId);
      setMessage({ text: res.message, type: 'success' });
      loadConsents();
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to revoke access", type: 'error' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            Patient Sovereign Consent
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Doctor Access & Consent Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You maintain full sovereignty over your medical records. Grant, modify, or instantaneously revoke doctor permissions.
          </p>
        </div>

        <button
          onClick={() => setShowGrantModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Grant Doctor Access
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 text-emerald-800 dark:text-emerald-200'
            : 'bg-red-50 dark:bg-red-950/60 border-red-300 text-red-800 dark:text-red-200'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Consent Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading authorized access policies...</div>
      ) : consents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <KeyRound className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No doctor access policies configured</p>
          <p className="text-xs text-slate-400 mt-1">Grant access to an attending physician or specialist.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {consents.map((c) => {
            const isGranted = c.access_status === 'Granted';
            const isRevoked = c.access_status === 'Revoked';
            return (
              <div 
                key={c.id}
                className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all ${
                  isGranted 
                    ? 'border-emerald-200 dark:border-emerald-900/60' 
                    : isRevoked 
                    ? 'border-red-200 dark:border-red-950/60 opacity-80' 
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isGranted 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' 
                        : isRevoked 
                        ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                    }`}>
                      {isGranted ? <ShieldCheck className="w-5 h-5" /> : isRevoked ? <ShieldX className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                          {c.doctor_name || 'Dr. Physician'}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          isGranted 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : isRevoked 
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' 
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {c.access_status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {c.doctor_specialization || 'Clinical Specialist'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isGranted && c.granted_at && `Granted on ${c.granted_at} · Valid until ${c.expires_at || '1 Year'}`}
                        {isRevoked && c.revoked_at && `Access revoked on ${c.revoked_at}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {isGranted && (
                      <button
                        onClick={() => handleRevoke(c.id, c.doctor_name)}
                        className="px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/80 text-red-700 dark:text-red-300 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <ShieldX className="w-4 h-4" />
                        Revoke Access Immediately
                      </button>
                    )}
                    {isRevoked && (
                      <span className="text-xs font-semibold text-red-500 italic">
                        Access blocked in real time
                      </span>
                    )}
                  </div>
                </div>

                {/* Granular Permissions Chips */}
                {isGranted && c.permissions && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Active Access Permissions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(c.permissions).map(([key, enabled]) => (
                        <span
                          key={key}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1.5 ${
                            enabled
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 line-through'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          {key.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Grant Access Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 relative">
            <button
              onClick={() => setShowGrantModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Grant Clinical Access to Doctor
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Select physician and define granular permission boundaries.
            </p>

            <form onSubmit={handleGrant} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Doctor
                </label>
                <select
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="b0000000-0000-0000-0000-000000000001">Dr. Marcus Vance, MD (Cardiology)</option>
                  <option value="b0000000-0000-0000-0000-000000000002">Dr. Elena Rostova, MD, PhD (Endocrinology)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Granular Permissions
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(permissions).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={val}
                        onChange={(e) => setPermissions({ ...permissions, [key]: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Grant Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
