"""
ML Service API for Quantra
FastAPI service for serving ML model predictions
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import os
from dotenv import load_dotenv

# Import model inference modules
from ml_service.services.fraud_service import FraudDetectionService
from ml_service.services.forecast_service import ForecastService
from ml_service.services.kyc_service import KYCService
from ml_service.services.simulation_service import SimulationService
from ml_service.services.chat_service import ChatService

load_dotenv()

app = FastAPI(title="Quantra ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
fraud_service = FraudDetectionService()
forecast_service = ForecastService()
kyc_service = KYCService()
simulation_service = SimulationService()
chat_service = ChatService()


# Request/Response Models
class TransactionData(BaseModel):
    amount: float
    location: Optional[str] = None
    frequency: Optional[int] = None
    type: Optional[str] = None
    description: Optional[str] = None
    merchant: Optional[str] = None
    category: Optional[str] = None
    country: Optional[str] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class FraudAnalysisRequest(BaseModel):
    transaction: TransactionData
    user_history: Optional[List[Dict[str, Any]]] = None


class ForecastRequest(BaseModel):
    userId: Optional[str] = None
    period: str  # "daily" | "weekly" | "monthly"
    months: int
    historical_data: Optional[List[Dict[str, Any]]] = None


class KYCRequest(BaseModel):
    userId: str
    documentType: str  # "passport" | "id" | "license"
    documentNumber: Optional[str] = None
    documentImage: Optional[str] = None  # Base64 encoded
    faceImage: Optional[str] = None  # Base64 encoded


class SimulationRequest(BaseModel):
    name: Optional[str] = None
    data: Any
    type: Optional[str] = None  # "prediction" | "pattern" | "classification" | "analysis"
    parameters: Optional[Dict[str, Any]] = None


class ChatRequest(BaseModel):
    message: str
    userId: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


@app.get("/")
async def root():
    return {"message": "Quantra ML Service API", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Fraud Detection Endpoints
@app.post("/api/fraud/detect")
async def detect_fraud(request: FraudAnalysisRequest):
    """Detect fraud in a transaction"""
    try:
        result = await fraud_service.detect_fraud(request.transaction, request.user_history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/fraud/explain")
async def explain_fraud(request: FraudAnalysisRequest):
    """Explain why a transaction was flagged"""
    try:
        result = await fraud_service.explain_fraud(request.transaction, request.user_history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/fraud/anomaly")
async def detect_anomaly(request: FraudAnalysisRequest):
    """Detect anomalies in transaction patterns"""
    try:
        result = await fraud_service.detect_anomaly(request.transaction, request.user_history)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Forecast Endpoints
@app.post("/api/forecast/generate")
async def generate_forecast(request: ForecastRequest):
    """Generate spending/income forecast"""
    try:
        result = await forecast_service.generate_forecast(
            request.userId,
            request.period,
            request.months,
            request.historical_data
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/forecast/default-risk")
async def calculate_default_risk(
    userId: str,
    transactions: List[Dict[str, Any]],
    averageIncome: float
):
    """Calculate default risk score"""
    try:
        result = await forecast_service.calculate_default_risk(
            userId,
            transactions,
            averageIncome
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# KYC Endpoints
@app.post("/api/kyc/verify")
async def verify_kyc(request: KYCRequest):
    """Verify KYC documents"""
    try:
        result = await kyc_service.verify_kyc(
            request.userId,
            request.documentType,
            request.documentNumber,
            request.documentImage,
            request.faceImage
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/kyc/ocr")
async def extract_document_text(documentImage: str, documentType: str):
    """Extract text from document using OCR"""
    try:
        result = await kyc_service.extract_text(documentImage, documentType)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/kyc/face-match")
async def match_face(documentImage: str, faceImage: str):
    """Match face in document with selfie"""
    try:
        result = await kyc_service.match_face(documentImage, faceImage)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Simulation Endpoints
@app.post("/api/simulation/process")
async def process_simulation(request: SimulationRequest):
    """Process AI simulation"""
    try:
        result = await simulation_service.process_simulation(
            request.name,
            request.data,
            request.type,
            request.parameters
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Chat Endpoints
@app.post("/api/chat/message")
async def chat_message(request: ChatRequest):
    """Process chat message with AI"""
    try:
        result = await chat_service.process_message(
            request.message,
            request.userId,
            request.context
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_SERVICE_PORT", "5001"))
    uvicorn.run(app, host="0.0.0.0", port=port)

