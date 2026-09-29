import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { HealthTrendData, MetricComparison } from '../../types';
import { 
  TrendingUp, TrendingDown, Minus, Calendar, Plus, 
  Activity, Heart, Scale, Droplet, ArrowUpRight, ArrowDownRight, 
  X, AlertCircle 
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, 
  YAxis, Tooltip, CartesianGrid 
} from 'recharts';

const TIME_RANGES = [
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '6 Months', value: '6m' },
  { label: '1 Year', value: '1y' },
  { label: 'All Time', value: 'all' },
];

export const HealthTrendsPage: React.FC = () => {
  const [data, setData] = useState<HealthTrendData | null>(null);
  const [timeRange, setTimeRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newMetric, setNewMetric] = useState({
    metric_type: 'Fasting Glucose',
    value_primary: 130,
    value_secondary: '',
    unit: 'mg/dL',
    notes: 'Home monitor reading'
  });

  const loadTrends = async () => {
    try {
      setLoading(true);
      const res = await api.getHealthTrends(timeRange);
      setData(res);
    } catch (err) {
      console.error("Health trends load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrends();
  }, [timeRange]);

  const handleAddMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addHealthMetric({
        metric_type: newMetric.metric_type,
        value_primary: Number(newMetric.value_primary),
        value_secondary: newMetric.value_secondary ? Number(newMetric.value_secondary) : undefined,
        unit: newMetric.unit,
        notes: newMetric.notes
      });
      setShowModal(false);
      loadTrends();
    } catch (err) {
      alert("Failed to record metric");
    }
  };

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'Blood Pressure': return '#3b82f6'; // Blue
      case 'Fasting Glucose': return '#ef4444'; // Red
      case 'Total Cholesterol': return '#f59e0b'; // Amber
      case 'Weight': return '#10b981'; // Emerald
      case 'BMI': return '#8b5cf6'; // Purple
      case 'Heart Rate': return '#ec4899'; // Pink
      default: return '#10b981';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            Biomarker Trends & Longitudinal Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real historical vitals plotted with interactive Recharts analytics and automated delta comparisons.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Record New Measurement
        </button>
      </div>

      {/* Time Range Filter Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TIME_RANGES.map(tr => (
          <button
            key={tr.value}
            onClick={() => setTimeRange(tr.value)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              timeRange === tr.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
            }`}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {/* Current vs Previous Comparison Cards (Required Feature) */}
      {data?.comparisons && data.comparisons.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-xs">
            Current vs Previous Clinical Comparison
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.comparisons.map((c, i) => {
              const isUp = c.direction === 'increased';
              const isDown = c.direction === 'decreased';
              return (
                <div 
                  key={i} 
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.metric_type}</span>
                      <div className={`flex items-center gap-1 text-xs font-bold ${
                        isUp ? 'text-amber-600 dark:text-amber-400' : isDown ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}>
                        {isUp && <ArrowUpRight className="w-4 h-4" />}
                        {isDown && <ArrowDownRight className="w-4 h-4" />}
                        {c.previous_value !== undefined && c.previous_value !== null ? (
                          <span>{c.difference > 0 ? `+${c.difference}` : c.difference} {c.unit}</span>
                        ) : (
                          <span>Baseline</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {c.current_value}{c.current_secondary ? `/${c.current_secondary}` : ''}
                      </span>
                      <span className="text-xs text-slate-400">{c.unit}</span>
                      {c.previous_value !== undefined && c.previous_value !== null && (
                        <span className="text-xs text-slate-400 line-through ml-2">
                          was {c.previous_value}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 font-medium">
                      {c.statement}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>Current: {c.current_date}</span>
                    {c.previous_date && <span>Prev: {c.previous_date}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recharts Graphical Visualizations */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading graphical trends...</div>
      ) : !data || Object.keys(data.trends).length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400">No trend measurements available.</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(data.trends).map(([name, item]) => {
            const color = getMetricColor(name);
            return (
              <div 
                key={name}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{name}</h3>
                    <p className="text-[11px] text-slate-400">Recorded unit: {item.unit}</p>
                  </div>
                  {item.latest_value !== undefined && item.latest_value !== null && (
                    <div className="text-right">
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {item.latest_value}{item.latest_secondary ? `/${item.latest_secondary}` : ''}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                    </div>
                  )}
                </div>

                {!item.has_sufficient_data ? (
                  <div className="h-56 flex flex-col items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800 text-center p-4">
                    <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {item.message || "Not enough historical data to display this trend."}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">Requires at least 2 distinct timestamped readings.</p>
                  </div>
                ) : (
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={item.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }} 
                          stroke="#64748b" 
                        />
                        <YAxis 
                          tick={{ fontSize: 10 }} 
                          stroke="#64748b" 
                          domain={['auto', 'auto']}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            fontSize: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name={name}
                          stroke={color} 
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: color }}
                          activeDot={{ r: 6 }}
                        />
                        {name === 'Blood Pressure' && (
                          <Line 
                            type="monotone" 
                            dataKey="value_secondary" 
                            name="Diastolic"
                            stroke="#60a5fa" 
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={{ r: 3, fill: '#60a5fa' }}
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Record Metric Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 relative">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Log Health Measurement
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add a new biomarker measurement to your lifelong trends.
            </p>

            <form onSubmit={handleAddMetric} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Metric Type
                </label>
                <select
                  value={newMetric.metric_type}
                  onChange={(e) => {
                    const t = e.target.value;
                    const u = t === 'Blood Pressure' ? 'mmHg' : t.includes('Glucose') || t.includes('Cholesterol') ? 'mg/dL' : t === 'Weight' ? 'kg' : t === 'BMI' ? 'kg/m²' : 'bpm';
                    setNewMetric({ ...newMetric, metric_type: t, unit: u });
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Blood Pressure">Blood Pressure (mmHg)</option>
                  <option value="Fasting Glucose">Fasting Glucose (mg/dL)</option>
                  <option value="Total Cholesterol">Total Cholesterol (mg/dL)</option>
                  <option value="Weight">Weight (kg)</option>
                  <option value="BMI">BMI (kg/m²)</option>
                  <option value="Heart Rate">Heart Rate (bpm)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Value ({newMetric.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newMetric.value_primary}
                    onChange={(e) => setNewMetric({ ...newMetric, value_primary: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {newMetric.metric_type === 'Blood Pressure' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 80"
                      value={newMetric.value_secondary}
                      onChange={(e) => setNewMetric({ ...newMetric, value_secondary: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Context / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning fasting reading"
                  value={newMetric.notes}
                  onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                >
                  Record Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
