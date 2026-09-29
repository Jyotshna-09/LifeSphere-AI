import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { AuditLogItem } from '../../types';
import { ShieldAlert, Search, Filter, RefreshCw, Calendar, Terminal } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs(100);
      setLogs(data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const q = search.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.resource_type.toLowerCase().includes(q) ||
      log.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-semibold mb-2 border border-purple-200 dark:border-purple-800">
            <Terminal className="w-3.5 h-3.5" />
            Cryptographic Accountability
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Security & Clinical Audit Trail
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable log of all system authentication, document analysis, machine learning inferences, and consent changes.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stream
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm relative">
        <Search className="w-4 h-4 absolute left-7 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Filter audit logs by action (e.g. AUTH_LOGIN, ML_RISK_PREDICTION, CONSENT_REVOKED)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading audit trail...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-400">
          No audit log entries match your filter.
        </div>
      ) : (
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Event Action</th>
                  <th className="py-3 px-3">Actor Role</th>
                  <th className="py-3 px-3">Target Resource</th>
                  <th className="py-3 px-3">Outcome</th>
                  <th className="py-3 px-3">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{log.created_at}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100 font-sans">{log.action}</td>
                    <td className="py-3 px-3 capitalize text-slate-500">{log.user_role}</td>
                    <td className="py-3 px-3 text-slate-500">{log.resource_type}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        log.status === 'Success' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
