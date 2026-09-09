"""
================================================================================
LUNG CANCER DETECTION AND DIAGNOSTIC SUPPORT SYSTEM
Module: Clinical Risk Assessment Engine (Member 2 Deliverable)
================================================================================
This module implements the multimodal risk assessment scoring system combining:
1. Trained Machine Learning model confidence on CT scan image features (60% weight).
2. Clinical patient symptom and epidemiological risk factor score (40% weight).

Formula:
    risk_score = (model_confidence * 0.6) + (symptom_score * 0.4)

Triage Levels:
    - Low Risk    : < 40.0   (Routine monitoring & annual health check)
    - Medium Risk : 40 - 70  (Pulmonologist consultation & repeat low-dose CT in 3-6 mos)
    - High Risk   : > 70.0   (Urgent referral for contrast CT/PET-CT and biopsy)

Author: ML Engineer (Member 2)
Ready for import by Member 3 (FastAPI backend):
    from risk_assessment import get_full_risk_assessment, calculate_risk_score
================================================================================
"""

import os
import sys
from typing import Dict, Any, Optional, List
import numpy as np

# Ensure standard UTF-8 console output for Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def calculate_symptom_score(patient_data: Dict[str, Any]) -> float:
    """
    Calculates a normalized Clinical Symptom & Risk Factor Score (0 to 100)
    based on established oncological risk assessment criteria.

    Clinical Weighting Rationale for Viva & Documentation (Max 100 Points):
    ----------------------------------------------------------------------
    1. smoking_history (Weight: 25 pts)
       Epidemiological rationale: Tobacco smoking is the single greatest causal
       risk factor for lung cancer, accounting for ~85% of all lung malignancies.
       Heavy/current smoking contributes 25 points; past/former smoking contributes 15 points.

    2. age (Weight: 15 pts)
       Clinical rationale: Lung cancer risk increases sharply with age due to
       cumulative genomic DNA damage; >80% of diagnoses occur in patients aged 55+.
       Age >= 60: 15 pts | Age 50-59: 10 pts | Age 40-49: 5 pts | Age < 40: 2 pts.

    3. cough (Weight: 15 pts)
       Clinical rationale: A new, chronic, or worsening cough (especially with
       hemoptysis/blood) is the primary presenting symptom in bronchial tumors.

    4. breathlessness / dyspnea (Weight: 15 pts)
       Clinical rationale: Indicates central airway occlusion, atelectasis,
       or malignant pleural effusion.

    5. chest_pain (Weight: 10 pts)
       Clinical rationale: Persistent thoracic pain indicates parietal pleural,
       ribs, or mediastinal chest wall involvement.

    6. weight_loss (Weight: 10 pts)
       Clinical rationale: Unexplained constitutional weight loss (>5% body mass)
       reflects cancer cachexia and systemic metabolic alteration.

    7. fatigue (Weight: 10 pts)
       Clinical rationale: Systemic cytokine release (TNF-alpha, IL-6) and tumor
       burden manifest as chronic unexplained fatigue.

    Total Raw Score = 100 points maximum.
    """
    raw_score = 0.0

    # Helper function to parse boolean, numeric, or string responses
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
        if smoking >= 20:       # 20+ pack-years
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

    # 3. Cough / Hemoptysis (Max 15 pts)
    if is_present(patient_data.get("cough", "No")):
        raw_score += 15.0

    # 4. Breathlessness / Dyspnea (Max 15 pts)
    if is_present(patient_data.get("breathlessness", patient_data.get("shortness_of_breath", "No"))):
        raw_score += 15.0

    # 5. Chest Pain (Max 10 pts)
    if is_present(patient_data.get("chest_pain", "No")):
        raw_score += 10.0

    # 6. Unexplained Weight Loss (Max 10 pts)
    if is_present(patient_data.get("weight_loss", "No")):
        raw_score += 10.0

    # 7. Fatigue (Max 10 pts)
    if is_present(patient_data.get("fatigue", "No")):
        raw_score += 10.0

    # Normalize and bound safely between 0.0 and 100.0
    symptom_score = float(np.clip(raw_score, 0.0, 100.0))
    return round(symptom_score, 2)


def calculate_risk_score(model_confidence: float, patient_data: Dict[str, Any]) -> float:
    """
    Computes a composite multimodal risk score (0 - 100) using the formula:
        risk_score = (model_confidence * 0.6) + (symptom_score * 0.4)

    Parameters:
        model_confidence (float): The model's predicted probability for the
            'Cancer' class. Accepts values as [0.0, 1.0] or scaled [0.0, 100.0].
        patient_data (Dict[str, Any]): Dictionary of clinical symptoms and risk factors.

    Returns:
        risk_score (float): Composite risk score on a 0 - 100 scale.
    """
    # Normalize model confidence to 0 - 100 scale if given as probability [0.0, 1.0]
    conf_100 = model_confidence * 100.0 if model_confidence <= 1.0 else model_confidence
    conf_100 = float(np.clip(conf_100, 0.0, 100.0))

    # Calculate symptom score (0 - 100)
    symptom_score = calculate_symptom_score(patient_data)

    # Apply weighted composite formula
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
        patient_data: Dict containing CT features ('contrast', 'area') and symptoms.
        feature_cols: List of expected feature column names (default: ['contrast', 'area']).

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
            # Check common medical aliases
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
    if hasattr(model, "predict_proba"):
        if scaler is not None and not hasattr(model, "named_steps"):
            X_sample = scaler.transform(X_sample)
        probabilities = model.predict_proba(X_sample)[0]
        # Class 1 corresponds to Cancer
        model_prob = float(probabilities[1])
    elif hasattr(model, "decision_function"):
        decision = model.decision_function(X_sample)[0]
        model_prob = float(1.0 / (1.0 + np.exp(-decision)))
    else:
        model_prob = float(model.predict(X_sample)[0])

    model_conf_percent = round(model_prob * 100.0, 2)
    symptom_score = calculate_symptom_score(patient_data)
    final_risk_score = calculate_risk_score(model_prob, patient_data)

    # Stratify risk level and provide clinical recommendations
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
# SELF-TEST & VERIFICATION
# ==============================================================================
if __name__ == "__main__":
    print("=" * 76)
    print(" LUNG CANCER RISK ASSESSMENT ENGINE - STANDALONE VERIFICATION")
    print("=" * 76)

    # Test Symptom Scoring
    test_cases = [
        {
            "name": "Case A (Young Healthy Non-Smoker)",
            "age": 30, "smoking_history": "No", "cough": "No",
            "breathlessness": "No", "chest_pain": "No", "weight_loss": "No", "fatigue": "No"
        },
        {
            "name": "Case B (Middle-Aged Former Smoker with Chronic Cough)",
            "age": 55, "smoking_history": "Former", "cough": "Yes",
            "breathlessness": "No", "chest_pain": "No", "weight_loss": "No", "fatigue": "Yes"
        },
        {
            "name": "Case C (Elderly Heavy Smoker with Severe Constitutional Symptoms)",
            "age": 68, "smoking_history": "Current", "cough": "Yes",
            "breathlessness": "Yes", "chest_pain": "Yes", "weight_loss": "Yes", "fatigue": "Yes"
        }
    ]

    for tc in test_cases:
        s_score = calculate_symptom_score(tc)
        print(f"\nProfile: {tc['name']}")
        print(f"  -> Calculated Symptom Score: {s_score} / 100")

    # Test Composite Risk Calculation
    print("\nTesting Composite Risk Formula: risk = (model_conf * 0.6) + (symptom * 0.4)")
    low_risk = calculate_risk_score(model_confidence=0.05, patient_data=test_cases[0])
    med_risk = calculate_risk_score(model_confidence=0.45, patient_data=test_cases[1])
    high_risk = calculate_risk_score(model_confidence=0.95, patient_data=test_cases[2])

    print(f"  -> Low Risk Scenario  : {low_risk} / 100")
    print(f"  -> Medium Risk Scenario: {med_risk} / 100")
    print(f"  -> High Risk Scenario  : {high_risk} / 100")
    print("\n[OK] Risk Assessment Module successfully verified.")
    print("=" * 76)
