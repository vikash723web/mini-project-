"""
================================================================================
LUNG CANCER DETECTION AND DIAGNOSTIC SUPPORT SYSTEM
Module: Member 2 - Machine Learning Pipeline & Clinical Risk Assessment
================================================================================
Upstream:
    Member 1 extracts image-level morphological & texture features from CT scans
    (e.g., GLCM contrast, lesion area) and saves them into features.csv.
Downstream:
    Member 3 imports best_lung_cancer_model.pkl and features.json into a FastAPI
    endpoint for live clinical inference.

Key Responsibilities:
1. Robust Data Loading & Missing Value Handling
2. Stratified 80-20 Train-Test Split (random_state=42)
3. Model Training & Comparison: Logistic Regression, Random Forest, and SVM (RBF)
4. Comprehensive Model Evaluation (Accuracy, Precision, Recall, F1, Confusion Matrices)
5. Model & Schema Artifact Export for Member 3 Backend Integration
6. Multimodal Risk Score Functions combining CT model confidence (60%) & symptoms (40%)
7. Sanity Check & Demo on sample clinical patient profiles from the test set
================================================================================
"""

import os
import sys
import json
import argparse
import warnings
from typing import Dict, Any, Tuple, List, Optional

# Ensure standard UTF-8 encoding across Windows PowerShell / CMD consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# Suppress minor non-critical warnings for clean console outputs
warnings.filterwarnings('ignore')

# Set visual styling for all generated figures
sns.set_theme(style="whitegrid", palette="muted")
plt.rcParams.update({'font.sans-serif': 'DejaVu Sans', 'font.size': 11})


# ==============================================================================
# 1. DATA LOADING & PREPROCESSING
# ==============================================================================

def find_default_csv_path() -> str:
    """
    Intelligently searches candidate file paths for the features CSV file.
    Checks Desktop, current working directory, and scratch directories.
    """
    candidates = [
        os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop", "features.csv"),
        os.path.join(os.path.expanduser("~"), "Desktop", "features.csv"),
        os.path.join(os.getcwd(), "features.csv"),
        os.path.join(os.path.dirname(__file__), "features.csv"),
        os.path.join(os.path.expanduser("~"), "OneDrive", "Desktop", "miniproject.csv"),
        os.path.join(os.path.expanduser("~"), ".gemini", "antigravity", "scratch", "lung_cancer_detection", "sample_lung_features.csv"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return "features.csv"


def load_and_preprocess_data(csv_path: str) -> Tuple[pd.DataFrame, pd.Series, List[str], Dict[str, int]]:
    """
    Loads dataset from CSV, performs automated column classification,
    handles missing values sensibly, and maps diagnostic labels to binary integers.

    Handling Missing Values:
    -----------------------
    We use SimpleImputer(strategy='median') for numeric feature columns.
    Rationale:
    In medical diagnostic datasets, dropping rows can cause selection bias and
    unnecessary data loss. The median is chosen over the mean because it is
    robust against extreme outliers (e.g., abnormally large tumor dimensions).

    Parameters:
        csv_path (str): Path to the input CSV file.

    Returns:
        X (pd.DataFrame): Cleaned numeric feature matrix.
        y (pd.Series): Binary target labels (1 = Cancer, 0 = Normal).
        feature_cols (List[str]): Names of feature columns used for training.
        label_mapping (Dict[str, int]): Ground-truth string-to-int mapping.
    """
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Input CSV file not found at: {csv_path}")

    print(f"\n[1/7] Loading dataset from: {csv_path}")
    df = pd.read_csv(csv_path)

    print(f"      Initial dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")

    # Display columns and data types
    print("      Columns & Data Types:")
    for col, dtype in df.dtypes.items():
        print(f"        - {col}: {dtype}")

    # Inspect missing values
    missing_counts = df.isnull().sum()
    total_missing = missing_counts.sum()
    if total_missing > 0:
        print(f"      [!] Missing values detected ({total_missing} total). Applying median imputation.")
        for col, count in missing_counts[missing_counts > 0].items():
            print(f"          * {col}: {count} missing")
    else:
        print("      [OK] No missing values detected (complete data).")

    # Dynamic target column detection
    target_candidates = ['label', 'diagnosis', 'target', 'cancer', 'class', 'status']
    target_col = None
    for cand in target_candidates:
        matched = [c for c in df.columns if c.lower() == cand]
        if matched:
            target_col = matched[0]
            break

    if target_col is None:
        raise ValueError(
            f"Could not automatically detect target column. Expected one of: {target_candidates}"
        )

    print(f"      Identified target column: '{target_col}'")

    # Map target values to binary {0, 1}
    # Cancer / Malignant / Positive -> 1; Normal / Benign / Negative -> 0
    unique_labels = df[target_col].dropna().unique()
    label_mapping = {}
    for lbl in unique_labels:
        str_lbl = str(lbl).strip().lower()
        if str_lbl in ['cancer', 'malignant', 'positive', '1', 'true', 'yes']:
            label_mapping[lbl] = 1
        elif str_lbl in ['normal', 'no cancer', 'benign', 'negative', '0', 'false', 'no']:
            label_mapping[lbl] = 0
        else:
            # Default fallback for unanticipated string
            label_mapping[lbl] = 1 if 'cancer' in str_lbl else 0

    y = df[target_col].map(label_mapping)
    if y.isnull().any():
        valid_idx = y.dropna().index
        df = df.loc[valid_idx]
        y = y.loc[valid_idx].astype(int)
    else:
        y = y.astype(int)

    # Class balance summary
    class_counts = y.value_counts().to_dict()
    print(f"      Target Class Distribution:")
    print(f"        - Class 1 (Cancer) : {class_counts.get(1, 0)} ({class_counts.get(1, 0)/len(y)*100:.1f}%)")
    print(f"        - Class 0 (Normal) : {class_counts.get(0, 0)} ({class_counts.get(0, 0)/len(y)*100:.1f}%)")

    # Identify feature columns
    # Exclude non-feature identifier and metadata columns
    excluded_patterns = {'id', 'image_id', 'img_id', 'patient_id', 'split', target_col.lower()}
    candidate_feature_cols = [
        c for c in df.columns if c.lower() not in excluded_patterns
    ]

    # Keep numeric feature columns only
    numeric_feature_cols = [
        c for c in candidate_feature_cols if pd.api.types.is_numeric_dtype(df[c])
    ]

    if not numeric_feature_cols:
        raise ValueError("No numeric feature columns found in dataset after filtering.")

    print(f"      Extracted Feature Columns ({len(numeric_feature_cols)}): {numeric_feature_cols}")

    X = df[numeric_feature_cols].copy()

    # Median imputation for numeric features (handles any edge-case NaN safely)
    imputer = SimpleImputer(strategy='median')
    X_imputed = pd.DataFrame(imputer.fit_transform(X), columns=numeric_feature_cols, index=X.index)

    return X_imputed, y, numeric_feature_cols, label_mapping


# ==============================================================================
# 2. STRATIFIED TRAIN-TEST SPLIT
# ==============================================================================

def split_dataset(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """
    Performs an 80-20 train-test split stratified on the target label.

    Stratification ensures that the training and testing sets maintain the
    identical proportion of Cancer vs Normal cases as the original dataset,
    preventing sampling bias in the evaluation set.
    """
    print(f"\n[2/7] Splitting dataset into 80% Train and 20% Test (Stratified, random_state={random_state})...")
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=test_size,
        random_state=random_state,
        stratify=y
    )

    print(f"      Training set : {X_train.shape[0]} samples ({y_train.sum()} Cancer, {len(y_train) - y_train.sum()} Normal)")
    print(f"      Testing set  : {X_test.shape[0]} samples ({y_test.sum()} Cancer, {len(y_test) - y_test.sum()} Normal)")

    return X_train, X_test, y_train, y_test


# ==============================================================================
# 3. MODEL TRAINING WITH SCIKIT-LEARN PIPELINES
# ==============================================================================

def build_model_pipelines() -> Dict[str, Pipeline]:
    """
    Constructs scikit-learn Pipelines for 3 core classifiers:
    1. Logistic Regression: Linear baseline with L2 regularization and feature standardization.
    2. Random Forest: Non-linear ensemble of decision trees with bagging.
    3. Support Vector Machine (SVM): Kernel-based non-linear boundary with RBF kernel.

    Pipelines encapsulate StandardScaler to avoid data leakage between folds
    and simplify production deployment. 'probability=True' is enabled on SVM
    to allow calibrated predict_proba inference for the risk engine.
    """
    models = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(
                random_state=42,
                class_weight="balanced",
                max_iter=1000,
                C=1.0,
                solver="lbfgs"
            ))
        ]),
        "Random Forest": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", RandomForestClassifier(
                random_state=42,
                n_estimators=100,
                max_depth=6,
                min_samples_split=4,
                min_samples_leaf=2,
                class_weight="balanced"
            ))
        ]),
        "Support Vector Machine": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", SVC(
                kernel="rbf",
                C=1.0,
                gamma="scale",
                probability=True,  # Enables Platt scaling for predict_proba()
                class_weight="balanced",
                random_state=42
            ))
        ])
    }
    return models


def train_and_evaluate_models(
    models: Dict[str, Pipeline],
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series
) -> Tuple[Dict[str, Dict[str, Any]], str]:
    """
    Fits each model on the training data, computes key evaluation metrics
    (Accuracy, Precision, Recall, F1-Score), and identifies the best-performing model.
    """
    print("\n[3/7] Training & evaluating candidate models...")
    results = {}

    for name, pipeline in models.items():
        print(f"      -> Fitting {name}...")
        pipeline.fit(X_train, y_train)

        # Predictions on test set
        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        cm = confusion_matrix(y_test, y_pred)

        results[name] = {
            "pipeline": pipeline,
            "accuracy": acc,
            "precision": prec,
            "recall": rec,
            "f1_score": f1,
            "confusion_matrix": cm,
            "y_pred": y_pred,
            "y_prob": y_prob
        }

    # Print summary table of metrics
    print("\n" + "=" * 76)
    print(f"{'Model':<26} | {'Accuracy':<10} | {'Precision':<10} | {'Recall':<10} | {'F1-Score':<10}")
    print("-" * 76)
    for name, res in results.items():
        print(f"{name:<26} | {res['accuracy']:<10.4f} | {res['precision']:<10.4f} | {res['recall']:<10.4f} | {res['f1_score']:<10.4f}")
    print("=" * 76)

    # Determine best model based on F1-score (harmonic mean of precision & recall)
    best_model_name = max(results, key=lambda k: (results[k]["f1_score"], results[k]["accuracy"]))
    print(f"\n[OK] Best Performing Model: '{best_model_name}' (F1: {results[best_model_name]['f1_score']:.4f}, Acc: {results[best_model_name]['accuracy']:.4f})")

    # Print classification report for best model
    print("\nClassification Report for Best Model:")
    target_names = ["Normal (0)", "Cancer (1)"]
    print(classification_report(y_test, results[best_model_name]["y_pred"], target_names=target_names, digits=4))

    return results, best_model_name


# ==============================================================================
# 4. PLOTTING CONFUSION MATRICES & COMPARISON CHARTS
# ==============================================================================

def generate_and_save_plots(
    results: Dict[str, Dict[str, Any]],
    output_dir: str
) -> Dict[str, str]:
    """
    Generates high-resolution diagnostic visualizations:
    1. Individual confusion matrix plots for each model (.png).
    2. Consolidated 3-panel confusion matrix comparison plot (.png).
    3. Accuracy and comprehensive multi-metric comparison bar charts (.png).

    Returns a dictionary of generated image paths.
    """
    os.makedirs(output_dir, exist_ok=True)
    plot_paths = {}

    print(f"\n[4/7] Generating and saving evaluation charts in: {output_dir}")

    # 1. Individual Confusion Matrices
    target_labels = ["Normal", "Cancer"]
    for name, res in results.items():
        sanitized_name = name.lower().replace(" ", "_")
        fig, ax = plt.subplots(figsize=(6, 5))
        sns.heatmap(
            res["confusion_matrix"],
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=target_labels,
            yticklabels=target_labels,
            cbar=False,
            annot_kws={"size": 14, "weight": "bold"},
            ax=ax
        )
        ax.set_title(f"Confusion Matrix - {name}\nAccuracy: {res['accuracy']:.2%} | F1: {res['f1_score']:.4f}", fontsize=12, pad=12)
        ax.set_xlabel("Predicted Diagnosis", fontsize=11, labelpad=8)
        ax.set_ylabel("True Diagnosis", fontsize=11, labelpad=8)
        plt.tight_layout()

        filename = f"confusion_matrix_{sanitized_name}.png"
        filepath = os.path.join(output_dir, filename)
        fig.savefig(filepath, dpi=300)
        plt.close(fig)
        plot_paths[f"cm_{sanitized_name}"] = filepath
        print(f"      -> Saved: {filename}")

    # 2. Consolidated 3-Panel Confusion Matrix
    fig, axes = plt.subplots(1, 3, figsize=(16, 5))
    for ax, (name, res) in zip(axes, results.items()):
        sns.heatmap(
            res["confusion_matrix"],
            annot=True,
            fmt="d",
            cmap="Blues",
            xticklabels=target_labels,
            yticklabels=target_labels,
            cbar=False,
            annot_kws={"size": 13, "weight": "bold"},
            ax=ax
        )
        ax.set_title(f"{name}\nAcc: {res['accuracy']:.2%} | F1: {res['f1_score']:.4f}", fontsize=12, pad=10)
        ax.set_xlabel("Predicted Diagnosis", fontsize=10)
        ax.set_ylabel("True Diagnosis", fontsize=10)

    plt.suptitle("Model Evaluation: Test Set Confusion Matrices", fontsize=15, weight="bold", y=1.02)
    plt.tight_layout()
    consolidated_cm_path = os.path.join(output_dir, "confusion_matrices_comparison.png")
    fig.savefig(consolidated_cm_path, dpi=300, bbox_inches="tight")
    plt.close(fig)
    plot_paths["cm_comparison"] = consolidated_cm_path
    print(f"      -> Saved: confusion_matrices_comparison.png")

    # 3. Model Accuracy Comparison Bar Chart
    model_names = list(results.keys())
    accuracies = [results[m]["accuracy"] * 100 for m in model_names]

    fig, ax = plt.subplots(figsize=(7, 5))
    colors = ["#2b5c8f", "#388e3c", "#d9534f"]
    bars = ax.bar(model_names, accuracies, color=colors, width=0.55, edgecolor="black", linewidth=1.2)

    ax.set_title("Test Set Accuracy Comparison Across Models", fontsize=13, weight="bold", pad=12)
    ax.set_ylabel("Accuracy (%)", fontsize=11)
    ax.set_ylim(0, 105)

    for bar in bars:
        height = bar.get_height()
        ax.annotate(
            f"{height:.2f}%",
            xy=(bar.get_x() + bar.get_width() / 2, height),
            xytext=(0, 5),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontsize=11,
            weight="bold"
        )

    plt.tight_layout()
    acc_chart_path = os.path.join(output_dir, "model_comparison_accuracy.png")
    fig.savefig(acc_chart_path, dpi=300)
    plt.close(fig)
    plot_paths["accuracy_comparison"] = acc_chart_path
    print(f"      -> Saved: model_comparison_accuracy.png")

    # 4. Multi-Metric Performance Comparison (Acc, Prec, Rec, F1)
    metrics_data = []
    for m in model_names:
        metrics_data.append({
            "Model": m,
            "Accuracy": results[m]["accuracy"] * 100,
            "Precision": results[m]["precision"] * 100,
            "Recall": results[m]["recall"] * 100,
            "F1-Score": results[m]["f1_score"] * 100,
        })
    df_metrics = pd.DataFrame(metrics_data).melt(id_vars="Model", var_name="Metric", value_name="Score (%)")

    fig, ax = plt.subplots(figsize=(9, 5))
    sns.barplot(data=df_metrics, x="Metric", y="Score (%)", hue="Model", palette="deep", ax=ax, edgecolor="black", linewidth=0.8)
    ax.set_title("Comprehensive Performance Comparison (Accuracy, Precision, Recall, F1)", fontsize=13, weight="bold", pad=12)
    ax.set_ylim(0, 110)
    ax.legend(loc="lower right", frameon=True)
    plt.tight_layout()

    multi_metric_path = os.path.join(output_dir, "model_metrics_comparison.png")
    fig.savefig(multi_metric_path, dpi=300)
    plt.close(fig)
    plot_paths["metrics_comparison"] = multi_metric_path
    print(f"      -> Saved: model_metrics_comparison.png")

    return plot_paths


# ==============================================================================
# 5. ARTIFACT EXPORT FOR MEMBER 3 (FASTAPI BACKEND)
# ==============================================================================

def export_artifacts(
    best_pipeline: Pipeline,
    best_model_name: str,
    feature_cols: List[str],
    X_train: pd.DataFrame,
    output_dir: str
) -> Tuple[str, str]:
    """
    Serializes the winning trained model pipeline and feature specification schema.

    - best_lung_cancer_model.pkl: Contains the complete Scikit-Learn Pipeline
      (fitted StandardScaler + trained classifier). Member 3 can load this directly
      via joblib.load() and run pipeline.predict_proba(features) without manual scaling!
    - features.json: Machine-readable feature schema defining input feature order,
      data types, baseline distributions (mean/std), and target label mappings.
    """
    os.makedirs(output_dir, exist_ok=True)
    print(f"\n[5/7] Exporting deployment artifacts for Member 3 API in: {output_dir}")

    # 1. Model Serialization (.pkl)
    model_filepath = os.path.join(output_dir, "best_lung_cancer_model.pkl")
    joblib.dump(best_pipeline, model_filepath)
    print(f"      -> Serialized Pipeline: best_lung_cancer_model.pkl")

    # 2. Schema Export (features.json)
    feature_stats = {}
    for col in feature_cols:
        feature_stats[col] = {
            "type": "float",
            "mean": float(X_train[col].mean()),
            "std": float(X_train[col].std()),
            "min": float(X_train[col].min()),
            "max": float(X_train[col].max())
        }

    schema = {
        "project": "Lung Cancer Detection and Diagnostic Support System",
        "author": "Member 2 - ML Pipeline",
        "best_model": best_model_name,
        "feature_order": feature_cols,
        "n_features": len(feature_cols),
        "target_mapping": {"0": "Normal", "1": "Cancer"},
        "risk_formula": "risk_score = (model_confidence * 0.6) + (symptom_score * 0.4)",
        "risk_thresholds": {
            "low": "< 40.0",
            "medium": "40.0 - 70.0",
            "high": "> 70.0"
        },
        "feature_specifications": feature_stats
    }

    schema_filepath = os.path.join(output_dir, "features.json")
    with open(schema_filepath, "w") as f:
        json.dump(schema, f, indent=4)
    print(f"      -> Feature Schema: features.json")

    return model_filepath, schema_filepath


# ==============================================================================
# 6. MULTIMODAL CLINICAL RISK SCORING ENGINE
# ==============================================================================

def calculate_symptom_score(patient_data: Dict[str, Any]) -> float:
    """
    Calculates a normalized Clinical Symptom & Risk Factor Score (0 to 100)
    based on established oncological risk assessment criteria.

    Clinical Weighting Rationale (Max 100 Points):
    ---------------------------------------------
    1. smoking_history (Weight: 25 pts)
       Epidemiological rationale: Tobacco smoking is the single greatest causal
       risk factor for lung cancer, accounting for ~85% of all lung malignancies.
       Heavy/current smoking contributes 25 points; past smoking contributes 15 points.

    2. age (Weight: 15 pts)
       Clinical rationale: Lung cancer risk increases sharply with age due to
       cumulative genomic damage; >80% of diagnoses occur in patients aged 55+.
       Age >= 60: 15 pts | Age 50-59: 10 pts | Age 40-49: 5 pts | Age < 40: 2 pts.

    3. cough (Weight: 15 pts)
       Clinical rationale: A new, chronic, or worsening cough (especially with
       hemoptysis/blood) is the primary presenting symptom in bronchial tumors.

    4. breathlessness / dyspnea (Weight: 15 pts)
       Clinical rationale: Indicates central airway occlusion, atelectasis,
       or malignant pleural effusion.

    5. chest_pain (Weight: 10 pts)
       Clinical rationale: Persistent, dull or sharp thoracic pain indicates
       parietal pleural, ribs, or mediastinal chest wall involvement.

    6. weight_loss (Weight: 10 pts)
       Clinical rationale: Unexplained constitutional weight loss (>5% body mass)
       reflects cancer cachexia and systemic metabolic alteration.

    7. fatigue (Weight: 10 pts)
       Clinical rationale: Systemic cytokine release (TNF-alpha, IL-6) and tumor
       burden manifest as chronic unexplained fatigue.

    Total Raw Score = 100 points maximum.
    """
    raw_score = 0.0

    # Helper function to parse boolean/string/numeric yes-no flags
    def is_present(value: Any) -> bool:
        if value is None:
            return False
        if isinstance(value, (bool, np.bool_)):
            return bool(value)
        if isinstance(value, (int, float)):
            return value > 0
        val_str = str(value).strip().lower()
        return val_str in ['yes', 'y', 'true', '1', 'positive', 'present', 'severe', 'moderate']

    # 1. Smoking History (Max 25 pts)
    smoking = patient_data.get("smoking_history", patient_data.get("smoking", "No"))
    if isinstance(smoking, str):
        smk_lower = smoking.strip().lower()
        if smk_lower in ['current', 'heavy', 'yes', 'true', '1']:
            raw_score += 25.0
        elif smk_lower in ['former', 'past', 'light', 'moderate']:
            raw_score += 15.0
    elif isinstance(smoking, (int, float)):
        if smoking >= 20:
            raw_score += 25.0
        elif smoking > 0:
            raw_score += 15.0

    # 2. Age (Max 15 pts)
    age = patient_data.get("age", 45)
    try:
        age_val = float(age)
        if age_val >= 60:
            raw_score += 15.0
        elif age_val >= 50:
            raw_score += 10.0
        elif age_val >= 40:
            raw_score += 5.0
        else:
            raw_score += 2.0
    except (ValueError, TypeError):
        raw_score += 5.0

    # 3. Cough (Max 15 pts)
    if is_present(patient_data.get("cough", "No")):
        raw_score += 15.0

    # 4. Breathlessness / Dyspnea (Max 15 pts)
    if is_present(patient_data.get("breathlessness", patient_data.get("shortness_of_breath", "No"))):
        raw_score += 15.0

    # 5. Chest Pain (Max 10 pts)
    if is_present(patient_data.get("chest_pain", "No")):
        raw_score += 10.0

    # 6. Weight Loss (Max 10 pts)
    if is_present(patient_data.get("weight_loss", "No")):
        raw_score += 10.0

    # 7. Fatigue (Max 10 pts)
    if is_present(patient_data.get("fatigue", "No")):
        raw_score += 10.0

    # Bound result to 0.0 - 100.0
    symptom_score = float(np.clip(raw_score, 0.0, 100.0))
    return round(symptom_score, 2)


def calculate_risk_score(model_confidence: float, patient_data: Dict[str, Any]) -> float:
    """
    Computes a composite multimodal risk score (0 - 100) using the formula:
        risk_score = (model_confidence * 0.6) + (symptom_score * 0.4)

    Parameters:
        model_confidence (float): The model's predicted probability for the
            'Cancer' class. Can be supplied as 0.0 to 1.0, or 0.0 to 100.0.
        patient_data (Dict[str, Any]): Dictionary of clinical symptoms and risk factors.

    Returns:
        risk_score (float): Composite risk score on a 0 - 100 scale.
    """
    # Normalize model confidence to 0 - 100 scale if given as probability [0.0, 1.0]
    conf_100 = model_confidence * 100.0 if model_confidence <= 1.0 else model_confidence
    conf_100 = float(np.clip(conf_100, 0.0, 100.0))

    # Calculate symptom score (0 - 100)
    symptom_score = calculate_symptom_score(patient_data)

    # Composite formula
    composite_risk = (conf_100 * 0.6) + (symptom_score * 0.4)
    return round(float(np.clip(composite_risk, 0.0, 100.0)), 2)


def get_full_risk_assessment(
    model: Any,
    scaler: Optional[Any],
    patient_data: Dict[str, Any],
    feature_cols: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Performs end-to-end multimodal diagnostic risk assessment for a patient.

    Combines:
    1. CT Scan feature inference via the trained classifier / pipeline.
    2. Clinical symptom scoring via calculate_symptom_score.
    3. Composite risk score computation via calculate_risk_score.
    4. Clinical risk tier stratification (Low, Medium, High) with actionable recommendations.

    Parameters:
        model: Trained classifier or Scikit-Learn Pipeline.
        scaler: Fitted StandardScaler (optional; None if model is already a Pipeline).
        patient_data: Dict containing CT features and clinical symptoms.
        feature_cols: List of expected feature column names.

    Returns:
        Dict with keys:
            - 'model_confidence': Predicted cancer probability (0-100 scale)
            - 'symptom_score': Clinical symptom score (0-100 scale)
            - 'risk_score': Multimodal composite score (0-100 scale)
            - 'risk_level': 'Low' (<40) | 'Medium' (40-70) | 'High' (>70)
            - 'recommendation': Clinical action advice
    """
    if feature_cols is None:
        feature_cols = ["contrast", "area"]

    # Extract CT scan numerical features
    ct_features = []
    for col in feature_cols:
        val = patient_data.get(col, None)
        if val is None:
            # Check common aliases
            aliases = {
                "contrast": ["texture_contrast", "glcm_contrast"],
                "area": ["area_mm2", "lesion_area", "nodule_area"]
            }
            for alias in aliases.get(col, []):
                if alias in patient_data:
                    val = patient_data[alias]
                    break
        if val is None:
            raise KeyError(f"Missing required CT feature '{col}' in patient_data.")
        ct_features.append(float(val))

    X_sample = np.array(ct_features).reshape(1, -1)

    # Handle scaling and prediction
    # If model is a Pipeline, it handles scaling internally
    if hasattr(model, "predict_proba"):
        if scaler is not None and not isinstance(model, Pipeline):
            X_sample = scaler.transform(X_sample)
        probabilities = model.predict_proba(X_sample)[0]
        # Class 1 corresponds to Cancer
        model_prob = float(probabilities[1])
    elif hasattr(model, "decision_function"):
        decision = model.decision_function(X_sample)[0]
        model_prob = float(1.0 / (1.0 + np.exp(-decision)))
    else:
        # Fallback to binary prediction
        model_prob = float(model.predict(X_sample)[0])

    model_conf_percent = round(model_prob * 100.0, 2)
    symptom_score = calculate_symptom_score(patient_data)
    final_risk_score = calculate_risk_score(model_prob, patient_data)

    # Risk level stratification based on defined thresholds
    if final_risk_score < 40.0:
        risk_level = "Low"
        recommendation = "Low clinical risk. Advise routine lifestyle counseling and standard annual follow-up."
    elif final_risk_score <= 70.0:
        risk_level = "Medium"
        recommendation = "Moderate clinical risk. Schedule pulmonologist consultation and follow-up low-dose CT in 3 to 6 months."
    else:
        risk_level = "High"
        recommendation = "HIGH CLINICAL RISK! Urgent referral to multidisciplinary thoracic oncology for diagnostic biopsy and PET-CT staging."

    return {
        "model_confidence": model_conf_percent,
        "symptom_score": symptom_score,
        "risk_score": final_risk_score,
        "risk_level": risk_level,
        "recommendation": recommendation
    }


# ==============================================================================
# 7. DEMO / SANITY CHECK EXECUTION
# ==============================================================================

def run_demo(
    best_pipeline: Pipeline,
    feature_cols: List[str],
    X_test: pd.DataFrame,
    y_test: pd.Series
):
    """
    Executes an end-to-end diagnostic simulation on 3 representative patients
    drawn directly from the test set, demonstrating Low, Medium, and High
    multimodal risk assessment outcomes.
    """
    print("\n[6/7] Running Sanity Check & Demo on 3 Representative Test Set Patients...")
    print("=" * 76)

    # Identify representative cases from X_test:
    # Patient 1: Test Sample #377 (True Normal)
    p1_sample = X_test.loc[377] if 377 in X_test.index else X_test[y_test == 0].iloc[0]
    p1_idx = 377 if 377 in X_test.index else X_test[y_test == 0].index[0]

    # Patient 2: Test Sample #488 (Intermediate boundary sample)
    p2_sample = X_test.loc[488] if 488 in X_test.index else X_test.iloc[len(X_test)//2]
    p2_idx = 488 if 488 in X_test.index else X_test.index[len(X_test)//2]

    # Patient 3: Test Sample #925 (True Malignant lesion)
    p3_sample = X_test.loc[925] if 925 in X_test.index else X_test[y_test == 1].iloc[0]
    p3_idx = 925 if 925 in X_test.index else X_test[y_test == 1].index[0]

    sample_patients = [
        {
            "id": f"Patient 1 (Test Sample #{p1_idx} - Low Risk / Benign)",
            "contrast": float(p1_sample["contrast"]),
            "area": float(p1_sample["area"]),
            "age": 34,
            "smoking_history": "No",
            "cough": "No",
            "breathlessness": "No",
            "chest_pain": "No",
            "weight_loss": "No",
            "fatigue": "No",
            "clinical_profile": "Young non-smoker with benign CT scan presentation and no constitutional symptoms."
        },
        {
            "id": f"Patient 2 (Test Sample #{p2_idx} - Medium Risk / Borderline)",
            "contrast": float(p2_sample["contrast"]),
            "area": float(p2_sample["area"]),
            "age": 56,
            "smoking_history": "Former",
            "cough": "Yes",
            "breathlessness": "No",
            "chest_pain": "No",
            "weight_loss": "No",
            "fatigue": "Yes",
            "clinical_profile": "56-year-old former smoker presenting with chronic cough, mild dyspnea, and borderline CT scan density."
        },
        {
            "id": f"Patient 3 (Test Sample #{p3_idx} - High Risk / Malignant)",
            "contrast": float(p3_sample["contrast"]),
            "area": float(p3_sample["area"]),
            "age": 67,
            "smoking_history": "Current",
            "cough": "Yes",
            "breathlessness": "Yes",
            "chest_pain": "Yes",
            "weight_loss": "Yes",
            "fatigue": "Yes",
            "clinical_profile": "67-year-old heavy smoker presenting with hemoptysis, chest pain, and unexplained weight loss."
        }
    ]

    for pt in sample_patients:
        assessment = get_full_risk_assessment(
            model=best_pipeline,
            scaler=None,
            patient_data=pt,
            feature_cols=feature_cols
        )
        print(f"Case ID           : {pt['id']}")
        print(f"Clinical Profile  : {pt['clinical_profile']}")
        print(f"CT Features       : Contrast = {pt['contrast']:.4f}, Area = {pt['area']:.1f} px")
        print(f"Model Confidence  : {assessment['model_confidence']:.2f}% (Predicted Cancer probability)")
        print(f"Symptom Score     : {assessment['symptom_score']:.2f} / 100")
        print(f"Composite Risk    : {assessment['risk_score']:.2f} / 100  -> [ {assessment['risk_level'].upper()} RISK ]")
        print(f"Triage & Action   : {assessment['recommendation']}")
        print("-" * 76)


# ==============================================================================
# MAIN PIPELINE ENTRY POINT
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Member 2: Lung Cancer Detection & Diagnostic Support ML Pipeline"
    )
    parser.add_argument(
        "--csv",
        type=str,
        default=None,
        help="Path to features.csv. If omitted, searches standard project locations automatically."
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=None,
        help="Directory to save model artifacts, schema, and evaluation plots."
    )
    args = parser.parse_args()

    # Determine CSV path
    csv_path = args.csv if args.csv else find_default_csv_path()

    # Determine output directory
    if args.output_dir:
        output_dir = args.output_dir
    else:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_dir = script_dir

    print("=" * 76)
    print(" LUNG CANCER DETECTION & DIAGNOSTIC SUPPORT SYSTEM: MEMBER 2 PIPELINE")
    print("=" * 76)
    print(f"Working Directory  : {os.getcwd()}")
    print(f"Input Features CSV : {csv_path}")
    print(f"Artifacts Output   : {output_dir}")

    # 1. Load & Preprocess Data
    X, y, feature_cols, label_mapping = load_and_preprocess_data(csv_path)

    # 2. Train-Test Split (80-20 Stratified)
    X_train, X_test, y_train, y_test = split_dataset(X, y, test_size=0.2, random_state=42)

    # 3. Model Training & Comparison
    models = build_model_pipelines()
    results, best_model_name = train_and_evaluate_models(models, X_train, y_train, X_test, y_test)
    best_pipeline = results[best_model_name]["pipeline"]

    # 4. Generate & Save Evaluation Plots
    plot_paths = generate_and_save_plots(results, output_dir)

    # 5. Export Model & Schema for Member 3
    model_path, schema_path = export_artifacts(
        best_pipeline=best_pipeline,
        best_model_name=best_model_name,
        feature_cols=feature_cols,
        X_train=X_train,
        output_dir=output_dir
    )

    # 6. Sanity Check / Demo
    run_demo(best_pipeline, feature_cols, X_test, y_test)

    print("\n[7/7] Pipeline Execution Complete Successfully! All deliverables are ready.")
    print("=" * 76)


if __name__ == "__main__":
    main()
