# Lung Cancer Screening Backend

A RESTful backend API built with **FastAPI**, **SQLAlchemy**, and **PostgreSQL** designed for lung cancer risk screening, patient demographic tracking, CT/X-Ray scan management, symptom logging, and AI-assisted risk prediction.

---

## Project Structure

```text
lung cancer backend/
│
├── database.py              # SQLAlchemy database engine, session factory, & get_db dependency
├── models.py                # SQLAlchemy ORM models (Patient, Scan, SymptomRecord, PredictionRecord)
├── schemas.py               # Pydantic v2 validation & response schemas
├── main.py                  # FastAPI application entry point, CORS, lifespan, & router registration
├── requirements.txt         # Project dependencies
├── .env.example             # Environment variable template
├── .gitignore               # Git ignore rules for Python, virtual environments, & uploads
│
├── routers/
│   ├── __init__.py          # Export router modules
│   ├── patient.py           # Patient CRUD & profile management endpoints
│   ├── scan.py              # CT/X-Ray scan uploads and metadata endpoints
│   ├── symptoms.py          # Clinical symptom logging & history endpoints
│   └── predict.py           # Risk assessment prediction & scoring endpoints
│
└── uploads/                 # Storage directory for uploaded scan images (auto-created)
    └── scans/
```

---

## Prerequisites

- **Python**: 3.10 or higher (3.13 supported)
- **PostgreSQL**: Running instance (local or hosted, e.g., Supabase / Neon / Docker)

---

## Getting Started

### 1. Create and Activate a Virtual Environment

```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Windows (Command Prompt)
python -m venv venv
.\venv\Scripts\activate.bat

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and set your PostgreSQL credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://<username>:<password>@localhost:5432/lung_cancer_db
HOST=0.0.0.0
PORT=8000
DEBUG=True
UPLOAD_DIR=uploads/scans
```

> **Note**: If you want to quickly test locally without PostgreSQL, you can temporarily set:
> `DATABASE_URL=sqlite:///./local_test.db`

### 4. Run the Development Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or run directly:

```bash
python main.py
```

---

## API Documentation

Once the server is running, interactive API documentation is available at:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Available API Endpoints

### Health & Information
- `GET /` - Root status and endpoint directory
- `GET /health` - Health check status

### Patients (`/api/v1/patients`)
- `POST /` - Register a new patient
- `GET /` - List patients (supports pagination & smoking status filter)
- `GET /{patient_id}` - Get patient detail (including scans, symptoms, predictions)
- `PUT /{patient_id}` - Update patient records
- `DELETE /{patient_id}` - Delete patient and associated records

### Scans (`/api/v1/scans`)
- `POST /upload` - Upload a scan image (CT / X-Ray) with patient ID
- `POST /` - Record scan metadata directly
- `GET /` - List scans (supports `patient_id` filter)
- `GET /{scan_id}` - Retrieve scan details
- `DELETE /{scan_id}` - Delete scan record and file

### Symptoms (`/api/v1/symptoms`)
- `POST /` - Record symptom checklist for patient screening
- `GET /` - List symptoms (supports `patient_id` filter)
- `GET /{symptom_id}` - Retrieve specific symptom log
- `DELETE /{symptom_id}` - Delete symptom record

### Prediction (`/api/v1/predict`)
- `POST /` - Perform risk assessment (synthesizes age, pack-years, symptoms, etc.)
- `GET /history/{patient_id}` - Retrieve past prediction records for a patient
- `GET /{prediction_id}` - Retrieve a single prediction record by ID
