import React, { useState } from 'react';
import { api } from '../../lib/api';
import { PredictionResult, ShapContribution } from '../../types';
import { 
  BrainCircuit, Activity, AlertTriangle, CheckCircle2, 
  HelpCircle, ArrowRight, RefreshCw, BarChart2, ShieldAlert, Sparkles 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine, CartesianGrid } from 'recharts';

export const AIRiskAssessmentPage: React.FC = () => {
  const [modelName, setModelName] = useState('random_forest');
  
  // Model features matching trained clinical models exactly
  const [features, setFeatures] = useState({
    Glucose: 145,
    BMI: 31.2,
    Age: 48,
    BloodPressure: 84,
    Insulin: 110,
    Pregnancies: 2,
    DiabetesPedigreeFunction: 0.58,
    SkinThickness: 26,
  });

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictRisk({
        model_name: modelName,
        Glucose: Number(features.Glucose),
        BMI: Number(features.BMI),
        Age: Number(features.Age),
        BloodPressure: Number(features.BloodPressure),
        Insulin: Number(features.Insulin),
        Pregnancies: Number(features.Pregnancies),
        DiabetesPedigreeFunction: Number(features.DiabetesPedigreeFunction),
        SkinThickness: Number(features.SkinThickness),
      });
      setPrediction(res);
    } catch (err: any) {
      console.error("Prediction error:", err);
      setError(err.message || "Failed to execute machine learning inference.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPreset = (type: 'healthy' | 'moderate' | 'elevated') => {
    if (type === 'healthy') {
      setFeatures({
        Glucose: 92,
        BMI: 22.4,
        Age: 32,
        BloodPressure: 70,
        Insulin: 45,
        Pregnancies: 1,
        DiabetesPedigreeFunction: 0.22,
        SkinThickness: 16,
      });
    } else if (type === 'moderate') {
      setFeatures({
        Glucose: 125,
        BMI: 28.6,
        Age: 46,
        BloodPressure: 78,
        Insulin: 85,
        Pregnancies: 2,
        DiabetesPedigreeFunction: 0.44,
        SkinThickness: 22,
      });
    } else {
      setFeatures({
        Glucose: 168,
        BMI: 35.8,
        Age: 56,
        BloodPressure: 92,
        Insulin: 180,
        Pregnancies: 4,
        DiabetesPedigreeFunction: 0.85,
        SkinThickness: 32,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-2 border border-emerald-200 dark:border-emerald-800">
          <BrainCircuit className="w-3.5 h-3.5" />
          Genuine Scikit-learn, XGBoost & SHAP Pipeline
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          AI Cardiometabolic Risk Assessment
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Real mathematical inference with SHAP (SHapley Additive exPlanations) answering precisely 
          <em> why did the model produce this prediction?</em>
        </p>
      </div>

      {/* Model Selection & Presets */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Inference Model:
          </span>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="random_forest">Random Forest Classifier (Ensemble Tree)</option>
            <option value="xgboost">XGBoost Classifier (Gradient Boosted Trees)</option>
            <option value="logistic_regression">Logistic Regression (Calibrated Baseline)</option>
          </select>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Sample Profiles:</span>
          <button
            type="button"
            onClick={() => handleSetPreset('healthy')}
            className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium hover:bg-emerald-100"
          >
            Low Risk
          </button>
          <button
            type="button"
            onClick={() => handleSetPreset('moderate')}
            className="px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium hover:bg-amber-100"
          >
            Moderate
          </button>
          <button
            type="button"
            onClick={() => handleSetPreset('elevated')}
            className="px-2.5 py-1 rounded-md bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 font-medium hover:bg-red-100"
          >
            Elevated
          </button>
        </div>
      </div>

      {/* Feature Input Form */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <form onSubmit={handlePredict} className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fasting Glucose (mg/dL)
              </label>
              <input
                type="number"
                step="1"
                required
                min="60"
                max="250"
                value={features.Glucose}
                onChange={(e) => setFeatures({ ...features, Glucose: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Baseline 70-99</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                BMI (kg/m²)
              </label>
              <input
                type="number"
                step="0.1"
                required
                min="15"
                max="60"
                value={features.BMI}
                onChange={(e) => setFeatures({ ...features, BMI: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Baseline 18.5-24.9</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Age (Years)
              </label>
              <input
                type="number"
                step="1"
                required
                min="18"
                max="100"
                value={features.Age}
                onChange={(e) => setFeatures({ ...features, Age: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Chronological age</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Diastolic BP (mm Hg)
              </label>
              <input
                type="number"
                step="1"
                required
                min="50"
                max="140"
                value={features.BloodPressure}
                onChange={(e) => setFeatures({ ...features, BloodPressure: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Baseline 60-80</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                2-Hr Serum Insulin (mu U/ml)
              </label>
              <input
                type="number"
                step="1"
                required
                min="10"
                max="400"
                value={features.Insulin}
                onChange={(e) => setFeatures({ ...features, Insulin: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Circulating insulin</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pregnancies / Parity
              </label>
              <input
                type="number"
                step="1"
                required
                min="0"
                max="15"
                value={features.Pregnancies}
                onChange={(e) => setFeatures({ ...features, Pregnancies: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">0 for male</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Diabetes Pedigree Score
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0.05"
                max="2.5"
                value={features.DiabetesPedigreeFunction}
                onChange={(e) => setFeatures({ ...features, DiabetesPedigreeFunction: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Genetic ancestral score</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Skin Fold Thickness (mm)
              </label>
              <input
                type="number"
                step="1"
                required
                min="5"
                max="70"
                value={features.SkinThickness}
                onChange={(e) => setFeatures({ ...features, SkinThickness: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400">Triceps skinfold</span>
            </div>

          </div>

          {error && (
            <div className="p-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Executing Model Inference & Computing Exact SHAP Values...
              </>
            ) : (
              <>
                <BrainCircuit className="w-4 h-4" />
                Compute Model-Estimated Risk & SHAP Explanation
              </>
            )}
          </button>
        </form>
      </div>

      {/* Prediction Output & Real SHAP Explanation */}
      {prediction && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Risk Probability Tier Card */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Model Used: {prediction.model_name.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {prediction.prediction_id_display}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {prediction.probability_percentage}%
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    prediction.risk_category === 'Elevated Risk'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800'
                      : prediction.risk_category === 'Moderate Risk'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {prediction.risk_category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {prediction.risk_description}
                </p>
              </div>

              {/* Progress Gauge Bar */}
              <div className="w-full sm:w-64 space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>Estimated Probability</span>
                  <span>{prediction.probability}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      prediction.risk_category === 'Elevated Risk' ? 'bg-red-500' :
                      prediction.risk_category === 'Moderate Risk' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(prediction.probability_percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 uppercase font-mono">
                  <span>0% (Low)</span>
                  <span>50%</span>
                  <span>100% (High)</span>
                </div>
              </div>
            </div>
          </div>

          {/* REAL SHAP EXPLAINABILITY BREAKDOWN (Core Academic Requirement) */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Explainable AI (XAI)
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Why did the model produce this prediction?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Calculated using exact Shapley Additive exPlanations (SHAP) from game theory.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Increases Risk</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Decreases Risk</span>
                </span>
              </div>
            </div>

            {/* SHAP Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={prediction.shap_contributions}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 70, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#64748b" />
                  <YAxis type="category" dataKey="feature_name" tick={{ fontSize: 11 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }}
                    formatter={(val: any) => [val, 'SHAP Value (Impact)']}
                  />
                  <ReferenceLine x={0} stroke="#64748b" strokeWidth={1.5} />
                  <Bar dataKey="shap_value" radius={[4, 4, 4, 4]}>
                    {prediction.shap_contributions.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.shap_value > 0 ? '#ef4444' : '#10b981'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Feature Impact Table with Plain-English Clinical Reasoning */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Feature</th>
                    <th className="py-2.5 px-3">Recorded Value</th>
                    <th className="py-2.5 px-3">SHAP Value</th>
                    <th className="py-2.5 px-3">Impact Direction</th>
                    <th className="py-2.5 px-3">Plain-English Clinical Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {prediction.shap_contributions.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                        {item.feature_name}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.feature_value}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={item.shap_value > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {item.shap_value > 0 ? `+${item.shap_value}` : item.shap_value}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.feature_impact === 'Increases Risk'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : item.feature_impact === 'Decreases Risk'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.feature_impact}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.clinical_meaning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Critical Explainability Disclaimer */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <strong>Explainability Note:</strong> SHAP values indicate how each feature shifted the model's output relative to the background clinical baseline. A positive SHAP value increases estimated risk, while a negative value decreases risk. Mathematical feature contribution reflects model attribution and does not prove clinical causality.
            </div>
          </div>

          {/* Mandatory Research / Medical Notice */}
          <div className="p-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 text-xs text-slate-600 dark:text-slate-400 text-center leading-relaxed">
            <strong>Mandatory Medical Notice:</strong> {prediction.disclaimer}
          </div>

        </div>
      )}

    </div>
  );
};
