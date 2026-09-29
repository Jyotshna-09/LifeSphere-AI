export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  username?: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  health_id?: string;
  avatar_url?: string;
  patient_details?: {
    dob?: string;
    gender?: string;
    blood_group?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    address?: string;
    allergies_summary?: string;
    conditions_summary?: string;
  };
  doctor_details?: {
    specialization?: string;
    license_number?: string;
    hospital_affiliation?: string;
    consultation_fee?: number;
    available_days?: string;
  };
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  record_type: string;
  title: string;
  description?: string;
  record_date: string;
  hospital_name?: string;
  doctor_name?: string;
  document_url?: string;
  is_verified: boolean;
  created_at: string;
}

export interface HealthMetricPoint {
  date: string;
  timestamp: string;
  value: number;
  value_secondary?: number;
  unit: string;
}

export interface MetricComparison {
  metric_type: string;
  current_value: number;
  current_secondary?: number;
  current_date: string;
  previous_value?: number;
  previous_secondary?: number;
  previous_date?: string;
  difference: number;
  unit: string;
  direction: 'increased' | 'decreased' | 'stable' | 'initial';
  statement: string;
}

export interface HealthTrendData {
  time_range: string;
  trends: Record<string, {
    metric_type: string;
    unit: string;
    has_sufficient_data: boolean;
    message?: string;
    data: HealthMetricPoint[];
    latest_value?: number;
    latest_secondary?: number;
  }>;
  comparisons: MetricComparison[];
}

export interface BiomarkerItem {
  parameter: string;
  value: string;
  numeric_primary?: number;
  numeric_secondary?: number;
  unit: string;
  reference_range: string;
  status: string;
  is_abnormal: boolean;
}

export interface DocumentAnalysis {
  is_medical_document?: boolean;
  summary: string;
  important_findings: string[];
  extracted_values: BiomarkerItem[];
  reference_checks: Array<{
    parameter: string;
    measured_value: string;
    reference_range: string;
    status: string;
  }>;
  possible_concerns: Array<{
    item: string;
    observation: string;
    guidance: string;
  }>;
  medical_terms: Array<{
    term: string;
    explanation: string;
  }>;
  disclaimer: string;
  confidence_score: number;
}

export interface AISummary {
  patient_id: string;
  patient_overview: string;
  medical_history: string;
  recent_events: string;
  current_medications: string;
  known_allergies: string;
  lab_trends: string;
  recorded_diagnoses: string;
  recent_changes: string;
  doctor_review_points: string;
  supporting_records: Array<{
    id: string;
    title: string;
    type: string;
    date: string;
  }>;
  generated_at: string;
}

export interface ShapContribution {
  feature_name: string;
  feature_value: number;
  shap_value: number;
  abs_shap: number;
  feature_impact: 'Increases Risk' | 'Decreases Risk' | 'Neutral';
  clinical_meaning: string;
}

export interface PredictionResult {
  prediction_id_display: string;
  model_name: string;
  probability: number;
  probability_percentage: number;
  risk_category: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk';
  risk_description: string;
  features_used: Record<string, number>;
  shap_contributions: ShapContribution[];
  disclaimer: string;
  timestamp: string;
}

export interface MLInsightsData {
  dataset_info: {
    name: string;
    total_samples: number;
    features_count: number;
    positive_prevalence: number;
    features: string[];
  };
  models: Record<string, {
    id: string;
    name: string;
    type: string;
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    confusion_matrix: number[][];
    test_samples: number;
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  }>;
  feature_importance: Array<{
    feature: string;
    random_forest: number;
    xgboost: number;
    logistic_regression: number;
  }>;
  shap_global_ranking: Array<{
    feature: string;
    mean_abs_shap: number;
    description: string;
  }>;
}

export interface ConsentItem {
  id: string;
  patient_id: string;
  patient_name?: string;
  patient_health_id?: string;
  doctor_id: string;
  doctor_name?: string;
  doctor_specialization?: string;
  access_status: 'Granted' | 'Pending' | 'Rejected' | 'Revoked';
  permissions: Record<string, boolean>;
  granted_at?: string;
  expires_at?: string;
  revoked_at?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  status: string;
  ip_address?: string;
  user_role: string;
  details: Record<string, any>;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
}

export interface MedicationInteractionItem {
  id: string;
  medication_a: string;
  medication_b: string;
  severity: 'Major' | 'Moderate' | 'Minor';
  interaction_description: string;
  clinical_advice: string;
  source: string;
  alert_title: string;
  disclaimer: string;
}

export interface DuplicateTestAlertItem {
  alert_title: string;
  current_test: string;
  current_date: string;
  current_record_id?: string;
  previous_test: string;
  previous_date: string;
  previous_record_id?: string;
  test_type: string;
  days_difference: number;
  reason: string;
  guidance: string;
}
