import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/scans", tags=["Scans"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/scans")


@router.post("/upload", response_model=schemas.ScanResponse, status_code=status.HTTP_201_CREATED)
def upload_scan(
    patient_id: int = Form(..., description="ID of patient associated with scan"),
    scan_type: str = Form("Low-Dose CT", description="e.g. Low-Dose CT, Chest X-Ray"),
    radiologist_notes: Optional[str] = Form(None, description="Clinical/radiologist impressions"),
    file: UploadFile = File(..., description="CT or X-Ray image file"),
    db: Session = Depends(get_db)
):
    """Upload a CT scan or X-Ray image file and associate it with a patient."""
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {patient_id} not found."
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
    safe_filename = f"scan_p{patient_id}_{int(os.times().system * 1000)}{file_extension}"
    target_path = os.path.join(UPLOAD_DIR, safe_filename)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    scan = models.Scan(
        patient_id=patient_id,
        scan_type=scan_type,
        file_path=target_path.replace("\\", "/"),
        file_name=file.filename,
        radiologist_notes=radiologist_notes
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


@router.post("/", response_model=schemas.ScanResponse, status_code=status.HTTP_201_CREATED)
def create_scan_metadata(
    scan_in: schemas.ScanCreate,
    db: Session = Depends(get_db)
):
    """Record scan metadata with an existing file path or external storage URL."""
    patient = db.query(models.Patient).filter(models.Patient.id == scan_in.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient with ID {scan_in.patient_id} not found."
        )

    scan = models.Scan(**scan_in.model_dump())
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


@router.get("/", response_model=List[schemas.ScanResponse])
def get_scans(
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Retrieve scans, optionally filtered by patient ID."""
    query = db.query(models.Scan)
    if patient_id is not None:
        query = query.filter(models.Scan.patient_id == patient_id)
    return query.all()


@router.get("/{scan_id}", response_model=schemas.ScanResponse)
def get_scan(
    scan_id: int,
    db: Session = Depends(get_db)
):
    """Retrieve details of a single scan."""
    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID {scan_id} not found."
        )
    return scan


@router.delete("/{scan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db)
):
    """Delete a scan record and remove stored file if present."""
    scan = db.query(models.Scan).filter(models.Scan.id == scan_id).first()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scan with ID {scan_id} not found."
        )

    if scan.file_path and os.path.exists(scan.file_path):
        try:
            os.remove(scan.file_path)
        except OSError:
            pass

    db.delete(scan)
    db.commit()
    return None
