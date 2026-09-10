from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from database import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String(20), nullable=False)  # "Male", "Female", "Other"
    smoking_status = Column(String(50), nullable=False)  # "Never", "Former", "Current"
    pack_years = Column(Float, default=0.0)  # Packs/day * years
    family_history_lung_cancer = Column(Boolean, default=False)
    copd_or_emphysema = Column(Boolean, default=False)
    contact_phone = Column(String(50), nullable=True)
    contact_email = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    scans = relationship("Scan", back_populates="patient", cascade="all, delete-orphan")
    symptoms = relationship("SymptomRecord", back_populates="patient", cascade="all, delete-orphan")
    predictions = relationship("PredictionRecord", back_populates="patient", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    scan_type = Column(String(50), default="Low-Dose CT")  # "Low-Dose CT", "Chest X-Ray", "Chest CT"
    file_path = Column(String(500), nullable=False)
    file_name = Column(String(255), nullable=True)
    scan_date = Column(DateTime, default=datetime.utcnow)
    radiologist_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="scans")
    predictions = relationship("PredictionRecord", back_populates="scan")


class SymptomRecord(Base):
    __tablename__ = "symptom_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    persistent_cough = Column(Boolean, default=False)
    coughing_up_blood = Column(Boolean, default=False)
    shortness_of_breath = Column(Boolean, default=False)
    chest_pain = Column(Boolean, default=False)
    unexplained_weight_loss = Column(Boolean, default=False)
    fatigue = Column(Boolean, default=False)
    hoarseness = Column(Boolean, default=False)
    frequent_respiratory_infections = Column(Boolean, default=False)
    duration_weeks = Column(Integer, nullable=True)
    additional_notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="symptoms")


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False)
    scan_id = Column(Integer, ForeignKey("scans.id", ondelete="SET NULL"), nullable=True)
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0 (or percentage)
    risk_level = Column(String(50), nullable=False)  # "Low", "Moderate", "High"
    malignancy_probability = Column(Float, nullable=True)
    primary_factors = Column(Text, nullable=True)  # JSON or bulleted factors
    recommended_action = Column(Text, nullable=True)
    model_version = Column(String(50), default="screening-v1.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    patient = relationship("Patient", back_populates="predictions")
    scan = relationship("Scan", back_populates="predictions")
