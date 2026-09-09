from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/patients", tags=["Patients"])


@router.post("/", response_model=schemas.PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_in: schemas.PatientCreate,
    db: Session = Depends(get_db)
):
    """Register a new patient for lung cancer screening."""
    patient = models.Patient(**patient_in.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.get("/", response_model=List[schemas.PatientResponse])
def get_patients(
    skip: int = Query(0, ge=0, description="Records to skip"),
    limit: int = Query(20, ge=1, le=100, description="Records to fetch"),
    smoking_status: Optional[str] = Query(None, description="Filter by smoking status"),
    db: Session = Depends(get_db)
):
    """Retrieve list of registered patients."""
    query = db.query(models.Patient)
    if smoking_status:
        query = query.filter(models.Patient.smoking_status.ilike(f"%{smoking_status}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/{patient_id}", response_model=schemas.PatientDetailResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve detailed patient profile, including scans, symptoms, and risk predictions."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )
    return patient


@router.put("/{patient_id}", response_model=schemas.PatientResponse)
def update_patient(
    patient_id: int,
    patient_in: schemas.PatientUpdate,
    db: Session = Depends(get_db)
):
    """Update patient demographic and medical risk details."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    update_data = patient_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{patient_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db)
):
    """Delete patient and all associated screening records."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    db.delete(patient)
    db.commit()
    return None
