"""
LifeSphere AI - Machine Learning Training Pipeline
Trains, evaluates, and persists:
1. Logistic Regression (Baseline)
2. Random Forest Classifier (Tree Ensemble)
3. XGBoost Classifier (Gradient Boosted Trees)
Computes real test-set evaluation metrics and SHAP explainers.
"""
import os
import sys
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, roc_curve
)
import shap

# Add parent directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from preprocessing.preprocessor import ClinicalDataPreprocessor, FEATURE_COLUMNS

def train_and_evaluate():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    dataset_path = os.path.join(base_dir, 'datasets', 'diabetes_risk.csv')
    models_dir = os.path.join(base_dir, 'models')
    os.makedirs(models_dir, exist_ok=True)

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)
    print(f"Dataset shape: {df.shape}")

    # Stratified Train/Test split (80/20)
    train_df, test_df = train_test_split(
        df, test_size=0.20, random_state=42, stratify=df['Outcome']
    )

    preprocessor = ClinicalDataPreprocessor()
    X_train_scaled = preprocessor.fit_transform(train_df)
    X_test_scaled = preprocessor.transform(test_df)
    
    y_train = train_df['Outcome'].values
    y_test = test_df['Outcome'].values

    # Save fitted preprocessor
    scaler_path = os.path.join(models_dir, 'scaler.joblib')
    preprocessor.save(scaler_path)
    print(f"Saved preprocessor to: {scaler_path}")

    # 1. Logistic Regression
    print("\n--- Training Logistic Regression ---")
    log_reg = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
    log_reg.fit(X_train_scaled, y_train)

    # 2. Random Forest
    print("\n--- Training Random Forest Classifier ---")
    rf = RandomForestClassifier(
        n_estimators=150, max_depth=6, min_samples_split=5,
        min_samples_leaf=3, random_state=42
    )
    rf.fit(X_train_scaled, y_train)

    # 3. XGBoost
    print("\n--- Training XGBoost Classifier ---")
    xgb = XGBClassifier(
        n_estimators=150, max_depth=4, learning_rate=0.08,
        subsample=0.85, colsample_bytree=0.85, eval_metric='logloss',
        random_state=42
    )
    xgb.fit(X_train_scaled, y_train)

    models = {
        'logistic_regression': {
            'model': log_reg,
            'name': 'Logistic Regression',
            'type': 'Linear Baseline'
        },
        'random_forest': {
            'model': rf,
            'name': 'Random Forest Classifier',
            'type': 'Ensemble Tree'
        },
        'xgboost': {
            'model': xgb,
            'name': 'XGBoost Classifier',
            'type': 'Gradient Boosted Decision Trees'
        }
    }

    metrics_summary = {}

    for key, item in models.items():
        model = item['model']
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        # Save model
        model_file = os.path.join(models_dir, f"{key}.joblib")
        joblib.dump(model, model_file)
        print(f"Saved {item['name']} -> {model_file}")

        metrics_summary[key] = {
            'id': key,
            'name': item['name'],
            'type': item['type'],
            'accuracy': round(acc, 4),
            'precision': round(prec, 4),
            'recall': round(rec, 4),
            'f1_score': round(f1, 4),
            'roc_auc': round(auc, 4),
            'confusion_matrix': cm, # [[TN, FP], [FN, TP]]
            'test_samples': len(y_test),
            'true_negatives': cm[0][0],
            'false_positives': cm[0][1],
            'false_negatives': cm[1][0],
            'true_positives': cm[1][1]
        }
        print(f"  {item['name']} Results: Accuracy={acc:.4f}, AUC={auc:.4f}, F1={f1:.4f}")

    # Compute Feature Importances
    # Random Forest importances
    rf_importances = rf.feature_importances_.tolist()
    # XGBoost importances
    xgb_importances = xgb.feature_importances_.tolist()
    # Logistic Regression normalized absolute coefficients
    log_coefs = np.abs(log_reg.coef_[0])
    log_importances = (log_coefs / log_coefs.sum()).tolist()

    feature_importance_dict = {}
    for idx, feature in enumerate(FEATURE_COLUMNS):
        feature_importance_dict[feature] = {
            'feature': feature,
            'random_forest': round(rf_importances[idx], 4),
            'xgboost': round(xgb_importances[idx], 4),
            'logistic_regression': round(log_importances[idx], 4)
        }

    # Pre-calculate SHAP Background & Global Summary
    print("\n--- Initializing SHAP Explainers ---")
    background_sample = X_train_scaled[:100]
    rf_explainer = shap.TreeExplainer(rf)
    xgb_explainer = shap.TreeExplainer(xgb)
    log_explainer = shap.LinearExplainer(log_reg, background_sample)

    # Save explainers and background
    joblib.dump(background_sample, os.path.join(models_dir, 'background_sample.joblib'))
    print("Saved background sample for linear explainers.")

    # Calculate mean absolute SHAP values across test set for global feature ranking
    rf_shap_values = rf_explainer.shap_values(X_test_scaled)
    # Handle multi-class / binary shap output shape in TreeExplainer
    if isinstance(rf_shap_values, list) and len(rf_shap_values) > 1:
        rf_shap_global = np.mean(np.abs(rf_shap_values[1]), axis=0)
    elif len(rf_shap_values.shape) == 3:
        rf_shap_global = np.mean(np.abs(rf_shap_values[:, :, 1]), axis=0)
    else:
        rf_shap_global = np.mean(np.abs(rf_shap_values), axis=0)

    shap_global_ranking = []
    for idx, feat in enumerate(FEATURE_COLUMNS):
        shap_global_ranking.append({
            'feature': feat,
            'mean_abs_shap': round(float(rf_shap_global[idx]), 4),
            'description': get_feature_description(feat)
        })
    shap_global_ranking.sort(key=lambda x: x['mean_abs_shap'], reverse=True)

    # Save comprehensive metrics JSON
    evaluation_payload = {
        'dataset_info': {
            'name': 'Clinical Cardiometabolic & Diabetes Risk Dataset (NIDDK / CDC Reference)',
            'total_samples': len(df),
            'features_count': len(FEATURE_COLUMNS),
            'positive_prevalence': round(float(df['Outcome'].mean()), 4),
            'features': FEATURE_COLUMNS
        },
        'models': metrics_summary,
        'feature_importance': list(feature_importance_dict.values()),
        'shap_global_ranking': shap_global_ranking
    }

    metrics_json_path = os.path.join(models_dir, 'evaluation_metrics.json')
    with open(metrics_json_path, 'w') as f:
        json.dump(evaluation_payload, f, indent=2)
    print(f"\nSaved evaluation metrics and SHAP summary to: {metrics_json_path}")
    print("ML Pipeline Training Completed Successfully!")

def get_feature_description(feat):
    descriptions = {
        'Pregnancies': 'Number of gestations / pregnancies',
        'Glucose': 'Plasma glucose concentration (mg/dL)',
        'BloodPressure': 'Diastolic blood pressure (mm Hg)',
        'SkinThickness': 'Triceps skin fold thickness (mm)',
        'Insulin': '2-Hour serum insulin concentration (mu U/ml)',
        'BMI': 'Body mass index (weight in kg/(height in m)^2)',
        'DiabetesPedigreeFunction': 'Genetic risk score based on ancestral medical history',
        'Age': 'Patient age in chronological years'
    }
    return descriptions.get(feat, feat)

if __name__ == '__main__':
    train_and_evaluate()
