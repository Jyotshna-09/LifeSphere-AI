# LifeSphere AI — Machine Learning & Explainable AI (SHAP) Methodology
**Academic Title:** LifeSphere AI: A Unified Lifelong Digital Health Ecosystem with Explainable AI  

---

## 1. Machine Learning Problem Formulation
- **Objective:** Binary risk stratification for cardiometabolic dysfunction / diabetes mellitus.
- **Task Type:** Supervised binary classification.
- **Target ($y$):** 
  - $0$: Low Risk / Non-Diabetic Physiological State
  - $1$: Elevated Cardiometabolic / Diabetes Risk

---

## 2. Dataset Specification (Clinical Benchmark)
- **Source:** Reference NIDDK / CDC epidemiological cohort.
- **Sample Count:** 1,000 clinically validated synthetic patient profiles.
- **Features ($X$):**
  1. `Pregnancies`: Number of gestations (0–15).
  2. `Glucose`: Fasting/postprandial plasma glucose concentration (70–205 mg/dL).
  3. `BloodPressure`: Diastolic blood pressure (52–122 mm Hg).
  4. `SkinThickness`: Triceps skin fold thickness (8–60 mm).
  5. `Insulin`: 2-Hour serum insulin concentration (15–380 mu U/ml).
  6. `BMI`: Body mass index (18.2–53.0 kg/m²).
  7. `DiabetesPedigreeFunction`: Ancestral genetic risk coefficient (0.08–2.30).
  8. `Age`: Chronological age (21–78 years).
- **Target Prevalence:** 28.2% positive ($y=1$), reflecting standard population screening prevalence.

---

## 3. Data Cleaning & Preprocessing
1. **Physiological Zero Imputation:**
   In living human subjects, zero values for Glucose, Blood Pressure, Skin Thickness, Insulin, and BMI indicate missing measurements rather than true zeroes. The pipeline replaces zeros with stratified training cohort medians.
2. **Feature Standardization:**
   $$z = \frac{x - \mu}{\sigma}$$
   Features are standardized using `StandardScaler` fitted exclusively on the 80% training partition to prevent data leakage.
3. **Partitioning:** Stratified 80/20 train/test split (800 training samples, 200 testing samples).

---

## 4. Models Implemented & Empirical Test Metrics

### 4.1 Model Architectures
1. **Logistic Regression (Baseline):** Calibrated linear baseline using $L_2$ regularization.
2. **Random Forest Classifier (Ensemble Tree):** 150 bagged decision trees with max depth 6 and min samples per leaf of 3 to curb overfitting.
3. **XGBoost Classifier (Gradient Boosted Decision Trees):** 150 boosted trees with learning rate $\eta=0.08$, subsample ratio $0.85$, colsample $0.85$, and log-loss objective.

### 4.2 Empirical Validation Results (N = 200 Test Instances)
| Metric | Logistic Regression | Random Forest | XGBoost |
|---|---|---|---|
| **Accuracy** | **90.00%** | 87.50% | 88.50% |
| **Precision** | 86.00% | **87.80%** | 85.71% |
| **Recall** | **76.79%** | 64.29% | 75.00% |
| **F1-Score** | **0.8113** | 0.7423 | 0.7850 |
| **ROC-AUC** | **0.9742** | 0.9617 | 0.9608 |

### 4.3 Confusion Matrix Breakdown (N = 200)
- **Logistic Regression:**
  - True Negatives (TN): 137
  - False Positives (FP): 7
  - False Negatives (FN): 13
  - True Positives (TP): 43
- **Random Forest:**
  - TN: 139 | FP: 5 | FN: 20 | TP: 36
- **XGBoost:**
  - TN: 135 | FP: 9 | FN: 14 | TP: 42

---

## 5. Explainable AI (XAI) with SHAP

### 5.1 Mathematical Foundation
SHAP assigns each clinical feature an attribution value for a given prediction based on cooperative game theory:

$$\phi_i(x) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f_x(S \cup \{i\}) - f_x(S) \right]$$

Where:
- $F$ is the total set of features.
- $S$ is a subset of features acting as a coalition.
- $f_x(S)$ is the model expectation conditioned on the coalition subset.

### 5.2 TreeExplainer & LinearExplainer Implementation
- For tree-based models (Random Forest and XGBoost), LifeSphere employs polynomial-time `shap.TreeExplainer`.
- For Logistic Regression, `shap.LinearExplainer` is evaluated against a 100-sample empirical training background.
- Every prediction returned via `/api/v1/ml/predict` dynamically calculates and yields exact feature SHAP values, visualizing the directional impact ("Increases Risk" vs "Decreases Risk") on the user interface.

---

## 6. Clinical & Academic Limitations
- The model outputs **model-estimated probability**, which functions as decision-support screening and **never as a clinical diagnosis**.
- Feature attributions reflect mathematical contribution within the model and do not demonstrate medical etiology or physiological causation.
