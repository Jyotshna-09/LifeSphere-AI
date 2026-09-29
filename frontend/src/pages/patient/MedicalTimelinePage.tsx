import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { 
  Clock, Calendar, Filter, Hospital, User, 
  ExternalLink, FileText, Activity, Stethoscope, 
  Pill, AlertCircle, Syringe, Scissors 
} from 'lucide-react';

const EVENT_ICONS: Record<string, React.ElementType> = {
  'Consultation': Stethoscope,
  'Diagnosis': AlertCircle,
  'Prescription': Pill,
  'Laboratory Report': Activity,
  'X-Ray': FileText,
  'Scan Report': FileText,
  'Vaccination': Syringe,
  'Surgery': Scissors,
  'Medical Document': FileText,
  'Other': FileText
};

export const MedicalTimelinePage: React.FC = () => {
  const [timelineData, setTimelineData] = useState<{
    years_available: number[];
    selected_year?: number;
    total_events: number;
    events: any[];
  } | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  const loadTimeline = async () => {
    try {
      setLoading(true);
      const data = await api.getTimeline(selectedYear, selectedType);
      setTimelineData(data);
    } catch (err) {
      console.error("Timeline load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [selectedYear, selectedType]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <Clock className="w-6 h-6 text-emerald-500" />
          Lifelong Medical Timeline
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          A continuous, chronological visual record of all your clinical encounters, diagnoses, labs, and therapies.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Year Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Year:
          </span>
          <button
            onClick={() => setSelectedYear(undefined)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedYear === undefined
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Years
          </button>
          {timelineData?.years_available.map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedYear === y
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {y}
            </button>
          ))}
        </div>

        {/* Record Type Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Types</option>
            <option value="Consultation">Consultation</option>
            <option value="Laboratory Report">Laboratory Report</option>
            <option value="Prescription">Prescription</option>
            <option value="Diagnosis">Diagnosis</option>
            <option value="Surgery">Surgery</option>
            <option value="Vaccination">Vaccination</option>
          </select>
        </div>
      </div>

      {/* Timeline Visual Stream */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading timeline...</div>
      ) : !timelineData || timelineData.events.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <Clock className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No timeline events found</p>
          <p className="text-xs text-slate-400 mt-1">Try adjusting the year or category filter.</p>
        </div>
      ) : (
        <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-200 dark:border-emerald-900/50 space-y-8 my-6">
          {timelineData.events.map((evt) => {
            const Icon = EVENT_ICONS[evt.record_type] || FileText;
            return (
              <div key={evt.id} className="relative group">
                
                {/* Timeline Icon Node */}
                <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full bg-emerald-100 dark:bg-slate-800 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                  <Icon className="w-4 h-4" />
                </div>

                {/* Timeline Card */}
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-800/80 transition-all shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {evt.record_type}
                      </span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {evt.record_date}
                      </span>
                    </div>

                    {evt.document_url && (
                      <a
                        href={evt.document_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Report
                      </a>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mt-2">
                    {evt.title}
                  </h3>

                  {evt.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      {evt.description}
                    </p>
                  )}

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    {evt.doctor_name && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.doctor_name}</span>
                      </div>
                    )}
                    {evt.hospital_name && (
                      <div className="flex items-center gap-1.5">
                        <Hospital className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.hospital_name}</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
