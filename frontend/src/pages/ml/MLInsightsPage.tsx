import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { MLInsightsData } from '../../types';
import { 
  Lightbulb, Database, Award, BarChart3, Binary, 
  Layers, CheckCircle, Info, ShieldCheck, Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, 
  YAxis, Tooltip, Legend, CartesianGrid 
} from 'recharts';

export const MLInsightsPage: React.FC = () => {
  const [data, setData] = useState<MLInsightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const insights = await api.getMLInsights();
        setData(insights);
      } catch (err) {
        console.error("ML Insights load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800">
          <Award className="w-3.5 h-3.5" />
          B.Tech Major Project Review Showcase
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          AI & Machine Learning Insights
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive empirical evaluation of trained models (Logistic Regression, Random Forest, XGBoost) and SHAP explainability.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading empirical ML evaluation data...</div>
      ) : !data ? (
        <div className="p-12 text-center text-xs text-slate-400">ML insights unavailable.</div>
      ) : (
        <>
          {/* Section 1: Dataset & Preprocessing Pipeline */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                1. Dataset & Preprocessing Architecture
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">Reference Dataset</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">NIDDK / CDC Clinical</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">Total Cohort Size</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{data.dataset_info.total_samples} Patient Records</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">Features Count</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{data.dataset_info.features_count} Biomarkers</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-xs text-slate-400">Target Outcome Balance</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{(data.dataset_info.positive_prevalence * 100).toFixed(1)}% Elevated Risk</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-1.5">
              <p><strong>Preprocessing & Imputation Protocol:</strong> Zero values in physiological biomarkers where 0 is non-viable (Glucose, Blood Pressure, Skin Thickness, Insulin, and BMI) are imputed with stratified cohort medians, followed by zero-mean unit-variance transformation (StandardScaler).</p>
              <p><strong>Train / Test Split:</strong> 80% Stratified Training Cohort (800 records) and 20% Stratified Validation Cohort (200 records) ensuring identical class prevalence.</p>
            </div>
          </div>

          {/* Section 2: Model Performance Comparison Table */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                2. Empirical Model Evaluation (Real 200-Sample Test Set)
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Model Architecture</th>
                    <th className="py-3 px-3">Classification Type</th>
                    <th className="py-3 px-3">Accuracy</th>
                    <th className="py-3 px-3">Precision</th>
                    <th className="py-3 px-3">Recall</th>
                    <th className="py-3 px-3">F1-Score</th>
                    <th className="py-3 px-3">ROC-AUC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {Object.values(data.models).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">{m.name}</td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{m.type}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">{(m.accuracy * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-mono font-medium">{(m.precision * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-mono font-medium">{(m.recall * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{m.f1_score.toFixed(4)}</td>
                      <td className="py-3 px-3 font-mono font-bold text-purple-600 dark:text-purple-400">{m.roc_auc.toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Confusion Matrices Visualizer */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Binary className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                3. Confusion Matrices (N = 200 Test Cohort)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(data.models).map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{m.name}</p>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">Acc: {(m.accuracy*100).toFixed(1)}%</span>
                  </div>

                  {/* 2x2 Matrix Grid */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">True Negative (TN)</p>
                      <p className="text-xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{m.true_negatives}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">False Positive (FP)</p>
                      <p className="text-xl font-black text-amber-900 dark:text-amber-100 mt-1">{m.false_positives}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800">
                      <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase">False Negative (FN)</p>
                      <p className="text-xl font-black text-amber-900 dark:text-amber-100 mt-1">{m.false_negatives}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800">
                      <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">True Positive (TP)</p>
                      <p className="text-xl font-black text-emerald-900 dark:text-emerald-100 mt-1">{m.true_positives}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Feature Importance Comparison Chart */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                4. Feature Importance Comparison Across Models
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gini Impurity (Random Forest) vs Gain (XGBoost) vs Standardized Absolute Coefficients (Logistic Regression).
            </p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.feature_importance} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="feature" tick={{ fontSize: 10 }} stroke="#64748b" interval={0} angle={-20} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc', fontSize: '11px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="random_forest" name="Random Forest" fill="#10b981" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="xgboost" name="XGBoost" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="logistic_regression" name="Logistic Regression" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section 5: SHAP Global Attribution Ranking */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                5. Global SHAP Attribution Ranking (Mean |SHAP Value|)
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Mean absolute Shapley values computed across test instances quantify average marginal feature contributions.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.shap_global_ranking.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{item.feature}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{item.description}</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {item.mean_abs_shap.toFixed(4)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Discussion & Methodological Rigor Footnote */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 space-y-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <p className="font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-500" />
              Methodological Rigor & B.Tech Review Significance
            </p>
            <p>
              In clinical decision-support ecosystems, black-box machine learning poses diagnostic opacity concerns. 
              LifeSphere resolves this through game-theoretic SHAP explainability, allowing medical reviewers and patients 
              to inspect individual feature contributions without relying on unverified approximations.
            </p>
          </div>
        </>
      )}

    </div>
  );
};
