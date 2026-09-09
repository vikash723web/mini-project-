from .patient import router as patient_router
from .scan import router as scan_router
from .symptoms import router as symptoms_router
from .predict import router as predict_router

__all__ = [
    "patient_router",
    "scan_router",
    "symptoms_router",
    "predict_router",
]
