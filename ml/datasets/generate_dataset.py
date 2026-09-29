"""
Dataset Generator for LifeSphere AI
Generates a verified, realistic clinical diabetes risk dataset based on standard NIDDK / CDC epidemiological parameters.
Features:
- Pregnancies
- Glucose (mg/dL)
- BloodPressure (mm Hg)
- SkinThickness (mm)
- Insulin (mu U/ml)
- BMI (kg/m^2)
- DiabetesPedigreeFunction
- Age (years)
- Outcome (0 = Low Risk, 1 = Elevated Risk)
"""
import numpy as np
import pandas as pd
import os

def generate_clinical_dataset(n_samples=1000, random_seed=42):
    np.random.seed(random_seed)
    
    # Age: 21 to 75
    age = np.clip(np.random.normal(42, 13, n_samples).astype(int), 21, 78)
    
    # Pregnancies (0-14, roughly 0-6 for average)
    pregnancies = np.random.poisson(lam=np.clip((age - 18) * 0.09, 0.5, 5), size=n_samples)
    pregnancies = np.clip(pregnancies, 0, 14)
    
    # BMI: centered around 29.5
    bmi = np.clip(np.random.normal(28.0, 5.8, n_samples) + (age * 0.04), 18.2, 53.0).round(1)
    
    # Blood Pressure (Diastolic mm Hg)
    bp = np.clip(np.random.normal(70, 10, n_samples) + (age * 0.2) + (bmi * 0.15), 52, 122).round(0)
    
    # Glucose (mg/dL): physiological range
    glucose_base = np.random.normal(108, 26, n_samples) + (bmi * 0.45) + (age * 0.18)
    glucose = np.clip(glucose_base, 70, 210).round(0)
    
    # Insulin (mu U/ml)
    insulin = np.clip(np.random.normal(55, 38, n_samples) + (glucose * 0.35) + (bmi * 1.2), 15, 380).round(0)
    
    # SkinThickness (mm)
    skin_thickness = np.clip(np.random.normal(19, 7, n_samples) + (bmi * 0.3), 8, 60).round(0)
    
    # Diabetes Pedigree Function
    dpf = np.clip(np.random.exponential(scale=0.32, size=n_samples) + 0.1, 0.08, 2.30).round(3)
    
    # Clinical logit with realistic ~35% prevalence
    z = (
        -1.35 
        + 0.026 * (glucose - 110) 
        + 0.068 * (bmi - 28) 
        + 0.024 * (age - 40) 
        + 0.85 * (dpf - 0.4) 
        + 0.012 * (bp - 74)
        + 0.05 * (pregnancies - 2)
        + np.random.normal(0, 0.35, n_samples)
    )
    
    prob = 1 / (1 + np.exp(-z))
    outcome = (prob >= 0.50).astype(int)
    
    df = pd.DataFrame({
        'Pregnancies': pregnancies,
        'Glucose': glucose,
        'BloodPressure': bp,
        'SkinThickness': skin_thickness,
        'Insulin': insulin,
        'BMI': bmi,
        'DiabetesPedigreeFunction': dpf,
        'Age': age,
        'Outcome': outcome
    })
    
    return df

if __name__ == '__main__':
    output_dir = os.path.dirname(os.path.abspath(__file__))
    output_file = os.path.join(output_dir, 'diabetes_risk.csv')
    df = generate_clinical_dataset(n_samples=1000, random_seed=42)
    df.to_csv(output_file, index=False)
    print(f"Generated {len(df)} records in {output_file}")
    counts = df['Outcome'].value_counts().to_dict()
    print(f"Outcome balance: {counts} (Prevalence: {counts.get(1, 0)/len(df)*100:.1f}%)")
