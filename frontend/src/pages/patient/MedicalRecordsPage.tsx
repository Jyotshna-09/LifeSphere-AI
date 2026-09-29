import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { MedicalRecord } from '../../types';
import { 
  FileText, Plus, Search, Filter, Trash2, 
  ExternalLink, Calendar, Hospital, User, CheckCircle2, 
  X, AlertCircle 
} from 'lucide-react';

const RECORD_TYPES = [
  'All', 'Consultation', 'Diagnosis', 'Prescription', 
  'Laboratory Report', 'X-Ray', 'Scan Report', 
  'Vaccination', 'Surgery', 'Medical Document', 'Other'
];

export const MedicalRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Record Form State
  const [formData, setFormData] = useState({
    title: '',
    record_type: 'Laboratory Report',
    hospital_name: '',
    doctor_name: '',
    record_date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await api.getMedicalRecords(selectedType, searchQuery);
      setRecords(data);
    } catch (err) {
      console.error("Error loading records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [selectedType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadRecords();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      setSubmitting(true);
      await api.createMedicalRecord(formData);
      setShowModal(false);
      setFormData({
        title: '',
        record_type: 'Laboratory Report',
        hospital_name: '',
        doctor_name: '',
        record_date: new Date().toISOString().split('T')[0],
        description: '',
      });
      loadRecords();
    } catch (err) {
      console.error("Failed to create record:", err);
      alert("Failed to create record");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medical record?")) return;
    try {
      await api.deleteMedicalRecord(id);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-500" />
            Lifelong Medical Records
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View, search, filter, and organize your comprehensive health encounters.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Medical Record
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1 w-full relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search records by title, doctor, or medical facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {RECORD_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Record List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading records...</div>
      ) : records.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No medical records found</p>
          <p className="text-xs text-slate-400 mt-1">Try changing filters or add a new record.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map(rec => (
            <div
              key={rec.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {rec.record_type}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rec.record_date}</span>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">
                  {rec.title}
                </h3>

                {rec.description && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {rec.description}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  {rec.hospital_name && (
                    <div className="flex items-center gap-2">
                      <Hospital className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{rec.hospital_name}</span>
                    </div>
                  )}
                  {rec.doctor_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{rec.doctor_name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified
                </span>

                <div className="flex items-center gap-2">
                  {rec.document_url && (
                    <a
                      href={rec.document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                      title="View document"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Record Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Create New Medical Record
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add a verified consultation, diagnostic test, or clinical report to your longitudinal record.
            </p>

            <form onSubmit={handleCreate} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Record Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Cardiovascular Assessment"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Record Type
                  </label>
                  <select
                    value={formData.record_type}
                    onChange={(e) => setFormData({ ...formData, record_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {RECORD_TYPES.filter(t => t !== 'All').map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Encounter
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.record_date}
                    onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hospital / Laboratory
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MetroHealth Center"
                    value={formData.hospital_name}
                    onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Attending Physician
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Marcus Vance"
                    value={formData.doctor_name}
                    onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clinical Description / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Summary of findings, clinical instructions, or impressions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
