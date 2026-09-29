"""
LifeSphere AI - Clinical Data Preprocessor
Handles data cleaning, physiological zero imputation, and feature scaling.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import joblib
import os

FEATURE_COLUMNS = [
    'Pregnancies',
    'Glucose',
    'BloodPressure',
    'SkinThickness',
    'Insulin',
    'BMI',
    'DiabetesPedigreeFunction',
    'Age'
]

# Physiologically, these values cannot realistically be zero in living patients:
NON_ZERO_FEATURES = ['Glucose', 'BloodPressure', 'SkinThickness', 'Insulin', 'BMI']

class ClinicalDataPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_medians = {}
        self.is_fitted = False

    def fit(self, df: pd.DataFrame):
        df_clean = df.copy()
        for col in NON_ZERO_FEATURES:
            if col in df_clean.columns:
                valid_values = df_clean[col][df_clean[col] > 0]
                median_val = valid_values.median() if len(valid_values) > 0 else 0
                self.feature_medians[col] = float(median_val)
                df_clean[col] = df_clean[col].replace(0, median_val)
        
        X = df_clean[FEATURE_COLUMNS]
        self.scaler.fit(X)
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("ClinicalDataPreprocessor must be fitted before transforming data.")
        
        df_clean = df.copy()
        for col in NON_ZERO_FEATURES:
            if col in df_clean.columns and col in self.feature_medians:
                df_clean[col] = df_clean[col].replace(0, self.feature_medians[col])
        
        X = df_clean[FEATURE_COLUMNS]
        return self.scaler.transform(X)

    def fit_transform(self, df: pd.DataFrame) -> np.ndarray:
        return self.fit(df).transform(df)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            'scaler': self.scaler,
            'feature_medians': self.feature_medians,
            'feature_columns': FEATURE_COLUMNS
        }, filepath)

    @classmethod
    def load(cls, filepath: str):
        data = joblib.load(filepath)
        instance = cls()
        instance.scaler = data['scaler']
        instance.feature_medians = data['feature_medians']
        instance.is_fitted = True
        return instance
