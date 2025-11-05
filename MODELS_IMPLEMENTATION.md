# AI Models Implementation Summary

## Overview

This document summarizes the AI/ML models implementation for the Quantra platform. All models are organized in the `models/` directory and served through a Python FastAPI service.

## Directory Structure

```
models/
├── fraud/              # Fraud detection models
├── forecast/            # Financial forecasting models
├── kyc/                 # KYC verification models
├── simulation/          # AI simulation models
├── chat/                # Chatbot models
└── requirements.txt     # Python dependencies

ml_service/
├── app.py              # FastAPI application
├── services/           # Service implementations
│   ├── fraud_service.py
│   ├── forecast_service.py
│   ├── kyc_service.py
│   ├── simulation_service.py
│   └── chat_service.py
└── README.md

scripts/
├── train_fraud_model.py
├── train_forecast_model.py
├── train_kyc_models.py
├── train_simulation_models.py
└── train_all_models.py
```

## Models by Service

### 1. Fraud Detection (`models/fraud/`)
- **fraud_detection_model.pkl** - XGBoost classifier for fraud detection
- **anomaly_detection_model.pkl** - Isolation Forest for anomaly detection
- **shap_explainer.pkl** - SHAP explainer for feature importance

### 2. Forecast (`models/forecast/`)
- **spending_forecast_model.pkl** - Prophet/XGBoost for spending predictions
- **income_forecast_model.pkl** - Prophet/XGBoost for income predictions
- **default_risk_model.pkl** - XGBoost for credit default risk

### 3. KYC (`models/kyc/`)
- **face_recognition_config.pkl** - Face recognition configuration
- **document_validator.h5** - CNN for document validation
- **tesseract_config/** - OCR configuration

### 4. Simulation (`models/simulation/`)
- **pattern_detector.pkl** - Pattern detection model
- **classifier.pkl** - General classifier
- **analyzer.pkl** - Statistical analysis tools

### 5. Chat (`models/chat/`)
- Uses cloud APIs (OpenAI, Anthropic) or local LLM models

## Integration

### Backend Integration

TypeScript services in `backend/src/services/` now integrate with the Python ML service:

- **fraudService.ts** - Calls `/api/fraud/detect` and `/api/fraud/explain`
- **forecastService.ts** - Calls `/api/forecast/generate` and `/api/forecast/default-risk`
- **kycService.ts** - Calls `/api/kyc/verify`, `/api/kyc/ocr`, `/api/kyc/face-match`
- **simulationService.ts** - Calls `/api/simulation/process`

All services have fallback logic if the ML service is unavailable.

### ML API Client

The `mlApiClient.ts` provides a unified interface for calling ML services:

```typescript
import { fraudAPI, forecastAPI, kycAPI } from './mlApiClient';

// Example usage
const result = await fraudAPI.detect(transaction, userHistory);
```

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd models
pip install -r requirements.txt
```

### 2. Train Models (Optional)

```bash
python scripts/train_all_models.py
```

### 3. Configure Environment

Backend `.env`:
```bash
ML_SERVICE_URL=http://localhost:5001
```

ML Service `.env`:
```bash
ML_SERVICE_PORT=5001
ML_SERVICE_HOST=0.0.0.0
MODELS_DIR=models
```

### 4. Start Services

ML Service:
```bash
cd ml_service
python app.py
```

Backend (already configured):
```bash
cd backend
npm run dev
```

## Model Training

Models are trained using synthetic data by default. For production:

1. Replace synthetic data generation with real data
2. Collect training datasets for each model type
3. Retrain models regularly with new data
4. Implement model versioning and A/B testing

## Fallback Behavior

If the ML service is unavailable, all services fall back to:
- Rule-based fraud detection
- Mock forecast predictions
- Basic KYC verification
- Simulated AI processing

This ensures the application continues to function even without ML models.

## Next Steps

1. **Data Collection**: Gather real transaction data for training
2. **Model Training**: Train models on production data
3. **Model Evaluation**: Evaluate model performance and accuracy
4. **Model Deployment**: Deploy trained models to production
5. **Monitoring**: Set up monitoring for model performance and drift
6. **Retraining**: Schedule regular model retraining

## Notes

- Models are loaded lazily on first request
- Model files are gitignored (too large for version control)
- Training scripts use synthetic data - replace with real data for production
- ML service automatically falls back if models are missing

