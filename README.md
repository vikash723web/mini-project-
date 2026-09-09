# Lung Cancer Detection & Diagnostic Support System
## Member 2: Machine Learning Classification & Multimodal Clinical Risk Engine

Welcome to the **Member 2** project workspace for the Lung Cancer Detection and Diagnostic Support System.

---

## 📁 Project Structure

```
lung_cancer_detection/
├── features.csv                          # Dataset of extracted CT features (from Member 1)
├── model_training.py                     # Main ML training & risk scoring pipeline script
├── model_training.ipynb                  # Interactive presentation-ready Jupyter Notebook
├── best_lung_cancer_model.pkl            # Trained model pipeline ready for Member 3 (FastAPI)
├── features.json                         # Feature schema definition for API inference
├── requirements.txt                      # Python library dependencies
├── README.md                             # Project documentation & quickstart guide
│
├── Plots for Presentations & Reports:
│   ├── confusion_matrices_comparison.png # 3-panel confusion matrix comparison
│   ├── confusion_matrix_random_forest.png# Winning model confusion matrix
│   ├── confusion_matrix_logistic_regression.png
│   ├── confusion_matrix_support_vector_machine.png
│   ├── model_comparison_accuracy.png     # Test set accuracy bar chart
│   └── model_metrics_comparison.png      # Acc, Prec, Rec, F1 multi-metric comparison
```

---

## 🚀 Quickstart in VS Code

### 1. Open Terminal in VS Code
Press `` Ctrl + ` `` to open the integrated terminal in VS Code.

### 2. Install Dependencies (if needed)
```bash
pip install -r requirements.txt
```

### 3. Run the ML Training Pipeline
```bash
python model_training.py
```
This will automatically:
- Load `features.csv`
- Perform stratified 80-20 train-test split
- Train & evaluate Logistic Regression, Random Forest, and SVM
- Save confusion matrix and comparison plots (`.png`)
- Save the winning model to `best_lung_cancer_model.pkl`
- Save the schema to `features.json`
- Run the multimodal risk assessment demo on 3 representative test patients

### 4. Run the Jupyter Notebook
Open [`model_training.ipynb`](model_training.ipynb) in VS Code and click **Run All** to see step-by-step visualizations and commentary.

---

## 🏆 Model Performance Summary (Test Set, N = 200)

| Model | Accuracy | Precision | Recall | F1-Score | Result |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Logistic Regression** | 95.50% | 0.9744 | 0.9682 | 0.9712 | Benchmarked |
| **Random Forest** | **97.50%** | **1.0000** | **0.9682** | **0.9838** | 🏆 **Selected Best** |
| **Support Vector Machine (SVM)** | 95.50% | 0.9805 | 0.9618 | 0.9711 | Benchmarked |

---

## 🩺 Multimodal Risk Assessment Formula

$$\text{risk\_score} = (\text{model\_confidence} \times 0.6) + (\text{symptom\_score} \times 0.4)$$

- **Model Confidence (60% weight)**: Probability of malignancy predicted from CT scan texture & morphology.
- **Symptom Score (40% weight)**: Normalized clinical risk factor score based on:
  - `smoking_history` (25 pts)
  - `age` (15 pts)
  - `cough` / hemoptysis (15 pts)
  - `breathlessness` (15 pts)
  - `chest_pain` (10 pts)
  - `weight_loss` (10 pts)
  - `fatigue` (10 pts)

### Triage Levels
- **Low Risk (< 40)**: Routine monitoring, annual health check.
- **Medium Risk (40 - 70)**: Pulmonologist consultation, repeat CT in 3–6 months.
- **High Risk (> 70)**: Urgent oncology referral for biopsy and staging.

---

## 🔌 Member 3 (FastAPI Backend) Integration Example

Member 3 can load the model and run inference with just a few lines of code:

```python
import joblib
import json
import numpy as np

# 1. Load pipeline and feature schema
model = joblib.load("best_lung_cancer_model.pkl")
with open("features.json") as f:
    schema = json.load(f)

# 2. Predict on incoming patient CT scan features
sample_features = np.array([[0.75, 48000.0]])  # [contrast, area]
cancer_probability = model.predict_proba(sample_features)[0][1]

print(f"Cancer Probability: {cancer_probability * 100:.2f}%")
```
