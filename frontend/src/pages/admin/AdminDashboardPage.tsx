import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { 
  LayoutDashboard, Users, FileText, UploadCloud, 
  BrainCircuit, KeyRound, ShieldAlert, Activity, RefreshCw 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<any | null>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ov, logs] = await Promise.all([
        api.getAdminOverview(),
        api.getAuditLogs(30)
      ]);
      setOverview(ov);
      setAuditLogs(logs);
    } catch (err) {
      console.error("Admin dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2 border border-purple-200 dark:border-purple-800">
            <ShieldAlert className="w-3.5 h-3.5" />
            Ecosystem Administration
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            System Dashboard & Security Audit Stream
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global view of registered entities, compliance metrics, and cryptographic/tamper-evident audit logs.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          title="Refresh statistics"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading administrative overview...</div>
      ) : !overview ? (
        <div className="p-12 text-center text-xs text-slate-400">Admin overview unavailable.</div>
      ) : (
        <>
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="metric-card">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Total Users</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {overview.stats.total_users}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {overview.stats.patients} Patients · {overview.stats.doctors} Doctors
              </span>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Medical Records</span>
                <FileText className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {overview.stats.medical_records}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Stored in PostgreSQL
              </span>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">ML Risk Predictions</span>
                <BrainCircuit className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {overview.stats.risk_assessments}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                With real SHAP archives
              </span>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold uppercase">Active Consents</span>
                <KeyRound className="w-4 h-4 text-teal-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                {overview.stats.active_consents}
              </p>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Enforced by RLS & RBAC
              </span>
            </div>
          </div>

          {/* Tamper-Evident Audit Logs Table */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Real-Time Tamper-Evident Security Audit Logs
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                Showing recent {auditLogs.length} events
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Action</th>
                    <th className="py-2.5 px-3">Actor Role</th>
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.created_at}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-slate-100 font-sans">{log.action}</td>
                      <td className="py-2.5 px-3 capitalize text-slate-500">{log.user_role}</td>
                      <td className="py-2.5 px-3 text-slate-500">{log.resource_type}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          log.status === 'Success' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
