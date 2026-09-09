"""
================================================================================
LUNG CANCER DETECTION AND DIAGNOSTIC SUPPORT SYSTEM
Module: Real-time Patient Risk Prediction & Diagnostic Support
================================================================================
This script demonstrates how to load the trained model pipeline and feature
schema exported by Member 2 to perform inference on a new patient.

Usage:
    python predict_risk.py

Author: ML Engineer (Member 2)
Reference Implementation for: Member 3 (FastAPI Endpoint)
================================================================================
"""

import os
import sys
import json
import joblib
import numpy as np

# Ensure standard UTF-8 console output for Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from risk_assessment import get_full_risk_assessment


def load_model_and_schema(base_dir: str = "."):
    """
    Loads serialized Random Forest model pipeline (.pkl) and feature schema (.json).
    """
    model_path = os.path.join(base_dir, "best_lung_cancer_model.pkl")
    schema_path = os.path.join(base_dir, "features.json")

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at: {model_path}")
    if not os.path.exists(schema_path):
        raise FileNotFoundError(f"Schema file not found at: {schema_path}")

    model = joblib.load(model_path)
    with open(schema_path, "r", encoding="utf-8") as f:
        schema = json.load(f)

    return model, schema


def main():
    print("=" * 76)
    print(" PATIENT DIAGNOSTIC RISK PREDICTION (MEMBER 2 INFERENCE ENGINE)")
    print("=" * 76)

    # Resolve folder where model and schema are located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model, schema = load_model_and_schema(base_dir)

    print(f"Loaded Winning Model : {schema['best_model']}")
    print(f"Expected CT Features : {schema['feature_order']}")
    print(f"Multimodal Formula   : {schema['risk_formula']}")
    print("-" * 76)

    # Example: 3 Test Patients evaluated using the trained model
    test_patients = [
        {
            "id": "Patient #1 (Routine Screening - Benign)",
            "contrast": 2.4235,
            "area": 38607.0,
            "age": 34,
            "smoking_history": "No",
            "cough": "No",
            "breathlessness": "No",
            "chest_pain": "No",
            "weight_loss": "No",
            "fatigue": "No"
        },
        {
            "id": "Patient #2 (Borderline Follow-Up)",
            "contrast": 2.1437,
            "area": 60639.0,
            "age": 56,
            "smoking_history": "Former",
            "cough": "Yes",
            "breathlessness": "No",
            "chest_pain": "No",
            "weight_loss": "No",
            "fatigue": "Yes"
        },
        {
            "id": "Patient #3 (Symptomatic Suspected Malignancy)",
            "contrast": 0.3593,
            "area": 43732.0,
            "age": 67,
            "smoking_history": "Current",
            "cough": "Yes",
            "breathlessness": "Yes",
            "chest_pain": "Yes",
            "weight_loss": "Yes",
            "fatigue": "Yes"
        }
    ]

    for pt in test_patients:
        result = get_full_risk_assessment(
            model=model,
            scaler=None,
            patient_data=pt,
            feature_cols=schema["feature_order"]
        )

        print(f"\nEvaluating: {pt['id']}")
        print(f"  CT Scan Inputs   : Contrast = {pt['contrast']}, Area = {pt['area']} px")
        print(f"  Model Confidence : {result['model_confidence']:.2f}% (Malignancy probability)")
        print(f"  Symptom Score    : {result['symptom_score']:.2f} / 100")
        print(f"  Composite Risk   : {result['risk_score']:.2f} / 100  --> [ {result['risk_level'].upper()} RISK ]")
        print(f"  Clinical Action  : {result['recommendation']}")

    print("\n" + "=" * 76)
    print("Inference completed successfully. Ready for Member 3 API integration!")
    print("=" * 76)


if __name__ == "__main__":
    main()
