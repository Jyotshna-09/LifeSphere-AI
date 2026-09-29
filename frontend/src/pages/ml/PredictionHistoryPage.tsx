import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { History, BrainCircuit, Sparkles, X, Calendar, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, CartesianGrid } from 'recharts';

export const PredictionHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<any | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await api.getPredictionHistory();
        setHistory(data);
      } catch (err) {
        console.error("Failed to load prediction history:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <History className="w-6 h-6 text-emerald-500" />
          Risk Prediction History & SHAP Archives
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Historical log of all machine learning risk estimates. Click any past prediction to re-examine its exact SHAP contribution breakdown.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading prediction history...</div>
      ) : history.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
          <BrainCircuit className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No predictions recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">Run an AI Risk Assessment to generate your first prediction log.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((pred) => (
            <div
              key={pred.id}
              onClick={() => setSelectedPrediction(pred)}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/60 dark:hover:border-emerald-500/60 transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {pred.prediction_id_display}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {pred.created_at}
                  </span>
                </div>

                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {pred.model_name.replace('_', ' ')}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    pred.risk_category === 'Elevated Risk'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : pred.risk_category === 'Moderate Risk'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {pred.risk_category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {pred.probability_percentage}%
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Risk Probability</p>
                </div>

                <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  View SHAP
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHAP Explanation Modal */}
      {selectedPrediction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedPrediction(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                SHAP Archive
              </span>
              <span className="text-xs font-mono text-slate-400">
                {selectedPrediction.prediction_id_display}
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-2">
              Historical SHAP Explanation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Prediction made on {selectedPrediction.created_at} using {selectedPrediction.model_name.replace('_', ' ').toUpperCase()}.
            </p>

            {/* Model Estimated probability */}
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Model-Estimated Probability</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {selectedPrediction.probability_percentage}%
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedPrediction.risk_category === 'Elevated Risk'
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                  : selectedPrediction.risk_category === 'Moderate Risk'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}>
                {selectedPrediction.risk_category}
              </span>
            </div>

            {/* SHAP Chart */}
            {selectedPrediction.shap_summary && (
              <div className="mt-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Feature Contributions (SHAP Values)
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={selectedPrediction.shap_summary}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                      <XAxis type="number" tick={{ fontSize: 10 }} stroke="#64748b" />
                      <YAxis type="category" dataKey="feature_name" tick={{ fontSize: 10 }} stroke="#64748b" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '11px'
                        }}
                      />
                      <ReferenceLine x={0} stroke="#64748b" />
                      <Bar dataKey="shap_value" radius={[4, 4, 4, 4]}>
                        {selectedPrediction.shap_summary.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.shap_value > 0 ? '#ef4444' : '#10b981'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedPrediction(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
              >
                Close Archive View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
