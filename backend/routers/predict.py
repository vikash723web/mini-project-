import json
from datetime import datetime
from typing import List, Tuple
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/predict", tags=["Prediction"])


def _calculate_lung_cancer_risk(
    age: int,
    smoking_status: str,
    pack_years: float,
    family_history: bool,
    copd_or_emphysema: bool,
    persistent_cough: bool,
    coughing_up_blood: bool,
    shortness_of_breath: bool,
    chest_pain: bool,
    unexplained_weight_loss: bool,
) -> Tuple[float, str, float, List[str], str]:
    """
    Heuristic clinical risk model for lung cancer screening.
    Synthesizes USPSTF screening indicators and clinical red-flag symptoms.
    Can be replaced or augmented with a trained ML model (e.g., XGBoost, PyTorch).
    """
    score = 0.05  # Baseline population risk
    risk_factors = []

    # 1. Age Factor (Highest prevalence between 50-80)
    if age >= 65:
        score += 0.20
        risk_factors.append(f"Advanced age ({age} years)")
    elif age >= 50:
        score += 0.12
        risk_factors.append(f"Age in high-risk bracket ({age} years)")

    # 2. Smoking History (Primary etiology in ~85% of cases)
    status_lower = smoking_status.lower() if smoking_status else "never"
    if "current" in status_lower:
        score += 0.25
        risk_factors.append("Active tobacco smoker")
    elif "former" in status_lower:
        score += 0.12
        risk_factors.append("Former tobacco smoker")

    if pack_years >= 30:
        score += 0.25
        risk_factors.append(f"Heavy smoking history ({pack_years:.1f} pack-years >= 30)")
    elif pack_years >= 20:
        score += 0.15
        risk_factors.append(f"Significant smoking history ({pack_years:.1f} pack-years)")
    elif pack_years > 0:
        score += 0.05

    # 3. Medical History
    if family_history:
        score += 0.10
        risk_factors.append("Family history of lung malignancy")

    if copd_or_emphysema:
        score += 0.10
        risk_factors.append("Underlying chronic pulmonary disease (COPD/Emphysema)")

    # 4. Critical Clinical Symptoms (Alarm symptoms)
    if coughing_up_blood:
        score += 0.25
        risk_factors.append("Hemoptysis (coughing blood) - high clinical urgency")

    if persistent_cough:
        score += 0.10
        risk_factors.append("Persistent subacute/chronic cough")

    if unexplained_weight_loss:
        score += 0.15
        risk_factors.append("Unexplained weight loss (constitutional symptom)")

    if shortness_of_breath:
        score += 0.05
        risk_factors.append("Progressive shortness of breath")

    if chest_pain:
        score += 0.05
        risk_factors.append("Persistent thoracic / chest pain")

    # Bound risk score between 0.02 and 0.98
    normalized_score = round(min(max(score, 0.02), 0.98), 3)

    # Categorize Risk Level & Clinical Action
    if normalized_score >= 0.60:
        risk_level = "High"
        malignancy_prob = round(normalized_score * 0.85, 3)
        action = (
            "Immediate referral for Low-Dose CT (LDCT) scan and multidisciplinary "
            "pulmonology/oncology consultation within 1-2 weeks."
        )
    elif normalized_score >= 0.25:
        risk_level = "Moderate"
        malignancy_prob = round(normalized_score * 0.45, 3)
        action = (
            "Recommended for annual Low-Dose CT (LDCT) lung cancer screening. "
            "Recommend smoking cessation counseling if applicable."
        )
    else:
        risk_level = "Low"
        malignancy_prob = round(normalized_score * 0.15, 3)
        action = (
            "Routine primary care follow-up. Advise patient to report any new or worsening "
            "respiratory symptoms (e.g., persistent cough or hemoptysis)."
        )

    return normalized_score, risk_level, malignancy_prob, risk_factors, action


@router.post("/", response_model=schemas.PredictResponse, status_code=status.HTTP_200_OK)
def predict_risk(
    req: schemas.PredictRequest,
    db: Session = Depends(get_db)
):
    """
    Run lung cancer screening risk prediction.
    Accepts an existing patient_id (optionally paired with scan_id) or ad-hoc screening parameters.
    Saves the prediction record if patient_id exists.
    """
    patient = None
    age = req.age or 50
    smoking_status = req.smoking_status or "Never"
    pack_years = req.pack_years or 0.0
    family_history = req.family_history_lung_cancer or False
    copd = req.copd_or_emphysema or False

    persistent_cough = req.persistent_cough or False
    coughing_up_blood = req.coughing_up_blood or False
    shortness_of_breath = req.shortness_of_breath or False
    chest_pain = req.chest_pain or False
    unexplained_weight_loss = req.unexplained_weight_loss or False

    if req.patient_id:
        patient = db.query(models.Patient).filter(models.Patient.id == req.patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient with ID {req.patient_id} not found."
            )

        # Use patient attributes unless explicitly overridden in request
        age = req.age if req.age is not None else patient.age
        smoking_status = req.smoking_status or patient.smoking_status
        pack_years = req.pack_years if req.pack_years is not None else patient.pack_years
        family_history = req.family_history_lung_cancer if req.family_history_lung_cancer is not None else patient.family_history_lung_cancer
        copd = req.copd_or_emphysema if req.copd_or_emphysema is not None else patient.copd_or_emphysema

        # If symptom flags weren't explicitly provided, check patient's latest recorded symptoms
        latest_symptom = (
            db.query(models.SymptomRecord)
            .filter(models.SymptomRecord.patient_id == req.patient_id)
            .order_by(models.SymptomRecord.recorded_at.desc())
            .first()
        )
        if latest_symptom:
            persistent_cough = req.persistent_cough if req.persistent_cough is not None else latest_symptom.persistent_cough
            coughing_up_blood = req.coughing_up_blood if req.coughing_up_blood is not None else latest_symptom.coughing_up_blood
            shortness_of_breath = req.shortness_of_breath if req.shortness_of_breath is not None else latest_symptom.shortness_of_breath
            chest_pain = req.chest_pain if req.chest_pain is not None else latest_symptom.chest_pain
            unexplained_weight_loss = req.unexplained_weight_loss if req.unexplained_weight_loss is not None else latest_symptom.unexplained_weight_loss

    score, level, mal_prob, factors, action = _calculate_lung_cancer_risk(
        age=age,
        smoking_status=smoking_status,
        pack_years=pack_years,
        family_history=family_history,
        copd_or_emphysema=copd,
        persistent_cough=persistent_cough,
        coughing_up_blood=coughing_up_blood,
        shortness_of_breath=shortness_of_breath,
        chest_pain=chest_pain,
        unexplained_weight_loss=unexplained_weight_loss
    )

    prediction_id = None
    if patient:
        record = models.PredictionRecord(
            patient_id=patient.id,
            scan_id=req.scan_id,
            risk_score=score,
            risk_level=level,
            malignancy_probability=mal_prob,
            primary_factors=json.dumps(factors),
            recommended_action=action,
            model_version="screening-v1.0"
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        prediction_id = record.id

    return schemas.PredictResponse(
        prediction_id=prediction_id,
        patient_id=req.patient_id,
        scan_id=req.scan_id,
        risk_score=score,
        risk_percentage=round(score * 100, 1),
        risk_level=level,
        malignancy_probability=mal_prob,
        key_risk_factors=factors,
        recommended_action=action,
        model_version="screening-v1.0",
        assessed_at=datetime.utcnow()
    )


@router.get("/history/{patient_id}", response_model=List[schemas.PredictionRecordResponse])
def get_prediction_history(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve risk prediction history for a given patient."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    return (
        db.query(models.PredictionRecord)
        .filter(models.PredictionRecord.patient_id == patient_id)
        .order_by(models.PredictionRecord.created_at.desc())
        .all()
    )


@router.get("/{prediction_id}", response_model=schemas.PredictionRecordResponse)
def get_prediction_by_id(
    prediction_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve a specific prediction assessment by its ID."""
    record = db.query(models.PredictionRecord).filter(models.PredictionRecord.id == prediction_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record with ID {prediction_id} not found."
        )
    return record
