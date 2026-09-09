from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/symptoms", tags=["Symptoms"])


@router.post("/", response_model=schemas.SymptomsResponse, status_code=status.HTTP_201_CREATED)
def record_symptoms(
    symptoms_in: schemas.SymptomsCreate,
    db: Session = Depends(get_db)
):
    """Record reported symptoms and clinical signs for a patient."""
    patient = db.query(models.Patient).filter(models.Patient.id == symptoms_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {symptoms_in.patient_id} not found."
        )

    symptom_record = models.SymptomRecord(**symptoms_in.model_dump())
    db.add(symptom_record)
    db.commit()
    db.refresh(symptom_record)
    return symptom_record


@router.get("/", response_model=List[schemas.SymptomsResponse])
def get_symptoms(
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """List recorded symptoms, optionally filtered by patient ID."""
    query = db.query(models.SymptomRecord)
    if patient_id is not None:
        query = query.filter(models.SymptomRecord.patient_id == patient_id)
    return query.order_by(models.SymptomRecord.recorded_at.desc()).all()


@router.get("/{symptom_id}", response_model=schemas.SymptomsResponse)
def get_symptom_record(
    symptom_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve details for a specific symptom entry."""
    record = db.query(models.SymptomRecord).filter(models.SymptomRecord.id == symptom_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Symptom record with ID {symptom_id} not found."
        )
    return record


@router.delete("/{symptom_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_symptom_record(
    symptom_id: int,
    db: Session = Depends(get_db)
):
    """Delete a symptom record."""
    record = db.query(models.SymptomRecord).filter(models.SymptomRecord.id == symptom_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Symptom record with ID {symptom_id} not found."
        )

    db.delete(record)
    db.commit()
    return None
