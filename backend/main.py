import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # Ensure all models are registered with Base.metadata
from routers import (
    patient_router,
    scan_router,
    symptoms_router,
    predict_router,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("lung_cancer_backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Initializes database tables on startup.
    """
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as exc:
        logger.warning(
            "Could not connect to database on startup (%s). "
            "Please ensure PostgreSQL is running and DATABASE_URL is configured properly in .env.",
            exc
        )
    yield
    logger.info("Shutting down Lung Cancer Screening API...")


app = FastAPI(
    title="Lung Cancer Screening API",
    description=(
        "Backend REST API for lung cancer screening, patient tracking, "
        "medical scan management, symptom logging, and AI risk prediction."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ---------------------------------------------------------
# CORS Middleware
# ---------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configurable for specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Register Routers under /api/v1
# ---------------------------------------------------------
API_V1_PREFIX = "/api/v1"
app.include_router(patient_router, prefix=API_V1_PREFIX)
app.include_router(scan_router, prefix=API_V1_PREFIX)
app.include_router(symptoms_router, prefix=API_V1_PREFIX)
app.include_router(predict_router, prefix=API_V1_PREFIX)


# ---------------------------------------------------------
# Root & Health Endpoints
# ---------------------------------------------------------
@app.get("/", tags=["Health & Root"])
def root():
    """Welcome endpoint with API documentation and status links."""
    return {
        "name": "Lung Cancer Screening API",
        "version": "1.0.0",
        "status": "operational",
        "docs_url": "/docs",
        "endpoints": {
            "patients": f"{API_V1_PREFIX}/patients",
            "scans": f"{API_V1_PREFIX}/scans",
            "symptoms": f"{API_V1_PREFIX}/symptoms",
            "predict": f"{API_V1_PREFIX}/predict",
        }
    }


@app.get("/health", tags=["Health & Root"])
def health_check():
    """Service health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
