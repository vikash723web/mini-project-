from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field


# ---------------------------------------------------------
# Base Schema Configuration
# ---------------------------------------------------------
class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------------------------------------------------------
# Patient Schemas
# ---------------------------------------------------------
class PatientBase(BaseModel):
    first_name: str = Field(..., max_length=100, examples=["John"])
    last_name: str = Field(..., max_length=100, examples=["Doe"])
    age: int = Field(..., ge=1, le=120, examples=[58])
    gender: str = Field(..., examples=["Male"])  # "Male", "Female", "Other"
    smoking_status: str = Field(..., examples=["Former"])  # "Never", "Former", "Current"
    pack_years: float = Field(0.0, ge=0.0, examples=[30.0])
    family_history_lung_cancer: bool = False
    copd_or_emphysema: bool = False
    contact_phone: Optional[str] = Field(None, max_length=50, examples=["+1-555-0199"])
    contact_email: Optional[str] = Field(None, max_length=100, examples=["john.doe@example.com"])


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    age: Optional[int] = Field(None, ge=1, le=120)
    gender: Optional[str] = None
    smoking_status: Optional[str] = None
    pack_years: Optional[float] = Field(None, ge=0.0)
    family_history_lung_cancer: Optional[bool] = None
    copd_or_emphysema: Optional[bool] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None


class PatientResponse(PatientBase, ORMBase):
    id: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------
# Scan Schemas
# ---------------------------------------------------------
class ScanBase(BaseModel):
    patient_id: int
    scan_type: str = Field("Low-Dose CT", examples=["Low-Dose CT"])
    radiologist_notes: Optional[str] = Field(None, examples=["Subcentimeter nodule detected in right upper lobe."])


class ScanCreate(ScanBase):
    file_path: str
    file_name: Optional[str] = None
    scan_date: Optional[datetime] = None


class ScanResponse(ScanBase, ORMBase):
    id: int
    file_path: str
    file_name: Optional[str] = None
    scan_date: datetime
    created_at: datetime


# ---------------------------------------------------------
# Symptoms Schemas
# ---------------------------------------------------------
class SymptomsBase(BaseModel):
    patient_id: int
    persistent_cough: bool = False
    coughing_up_blood: bool = False  # Hemoptysis
    shortness_of_breath: bool = False
    chest_pain: bool = False
    unexplained_weight_loss: bool = False
    fatigue: bool = False
    hoarseness: bool = False
    frequent_respiratory_infections: bool = False
    duration_weeks: Optional[int] = Field(None, ge=0, examples=[4])
    additional_notes: Optional[str] = Field(None, examples=["Cough worsens at night."])


class SymptomsCreate(SymptomsBase):
    pass


class SymptomsResponse(SymptomsBase, ORMBase):
    id: int
    recorded_at: datetime


# ---------------------------------------------------------
# Prediction / Risk Screening Schemas
# ---------------------------------------------------------
class PredictRequest(BaseModel):
    """
    Request to trigger lung cancer risk assessment.
    Can be run by referencing an existing patient_id (and optional scan_id),
    or by passing standalone clinical parameters.
    """
    patient_id: Optional[int] = Field(None, description="Registered patient ID (if available)")
    scan_id: Optional[int] = Field(None, description="Associated CT/X-Ray scan ID")

    # Standalone/override clinical inputs (used if patient_id is not provided or to test hypothetical values)
    age: Optional[int] = Field(None, ge=1, le=120, examples=[62])
    smoking_status: Optional[str] = Field(None, examples=["Current"])
    pack_years: Optional[float] = Field(None, ge=0.0, examples=[35.0])
    family_history_lung_cancer: Optional[bool] = False
    copd_or_emphysema: Optional[bool] = False
    persistent_cough: Optional[bool] = False
    coughing_up_blood: Optional[bool] = False
    shortness_of_breath: Optional[bool] = False
    chest_pain: Optional[bool] = False
    unexplained_weight_loss: Optional[bool] = False


class PredictResponse(BaseModel):
    prediction_id: Optional[int] = None
    patient_id: Optional[int] = None
    scan_id: Optional[int] = None
    risk_score: float = Field(..., description="Screening risk score (0.0 - 1.0)")
    risk_percentage: float = Field(..., description="Risk score expressed as percentage")
    risk_level: str = Field(..., description="'Low', 'Moderate', or 'High'")
    malignancy_probability: Optional[float] = None
    key_risk_factors: List[str] = []
    recommended_action: str
    model_version: str = "screening-v1.0"
    assessed_at: datetime


class PredictionRecordResponse(ORMBase):
    id: int
    patient_id: int
    scan_id: Optional[int] = None
    risk_score: float
    risk_level: str
    malignancy_probability: Optional[float] = None
    primary_factors: Optional[str] = None
    recommended_action: Optional[str] = None
    model_version: str
    created_at: datetime


# ---------------------------------------------------------
# Detailed Patient Profile (with nested relations)
# ---------------------------------------------------------
class PatientDetailResponse(PatientResponse):
    scans: List[ScanResponse] = []
    symptoms: List[SymptomsResponse] = []
    predictions: List[PredictionRecordResponse] = []
