# ML Service Setup Guide

## Overview

The ML Service is a Python FastAPI service that provides AI/ML model inference for the Quantra platform.

## Setup

### 1. Install Python Dependencies

```bash
cd models
pip install -r requirements.txt
```

### 2. Set Environment Variables

Create a `.env` file in `ml_service/` directory:

```bash
ML_SERVICE_PORT=5001
ML_SERVICE_HOST=0.0.0.0
MODELS_DIR=models


```

**Note:** The OpenRouter API key is already configured with a default value in the code, but you can override it via environment variables for better security.

### 3. Train Models (Optional)

Models can be trained using the scripts in `scripts/`:

```bash
# Train all models
python scripts/train_all_models.py

# Or train individually
python scripts/train_fraud_model.py
python scripts/train_forecast_model.py
python scripts/train_kyc_models.py
python scripts/train_simulation_models.py
```

### 4. Start ML Service

```bash
cd ml_service
python app.py
```

Or using uvicorn directly:

```bash
uvicorn ml_service.app:app --host 0.0.0.0 --port 5001
```

## API Endpoints

### Health Check
- `GET /health` - Check service health

### Fraud Detection
- `POST /api/fraud/detect` - Detect fraud in transaction
- `POST /api/fraud/explain` - Explain fraud detection
- `POST /api/fraud/anomaly` - Detect anomalies

### Forecast
- `POST /api/forecast/generate` - Generate forecasts
- `POST /api/forecast/default-risk` - Calculate default risk

### KYC
- `POST /api/kyc/verify` - Verify KYC documents
- `POST /api/kyc/ocr` - Extract text from documents
- `POST /api/kyc/face-match` - Match faces

### Simulation
- `POST /api/simulation/process` - Process AI simulation

### Chat
- `POST /api/chat/message` - Process chat message using OpenRouter API (nvidia/nemotron-nano-12b-v2-vl:free model)

The chat service uses OpenRouter API for AI-powered responses. If the API is unavailable, it falls back to rule-based responses.

## Integration with Backend

The TypeScript backend services automatically use the ML service when available, falling back to rule-based logic if the service is unavailable.

Set the ML service URL in backend `.env`:

```bash
ML_SERVICE_URL=http://localhost:5001
```

## Model Files

Models are stored in `models/` directory:
- `models/fraud/` - Fraud detection models
- `models/forecast/` - Forecasting models
- `models/kyc/` - KYC verification models
- `models/simulation/` - Simulation models
- `models/chat/` - Chatbot models

## Notes

- Models are loaded lazily on first request
- If a model file doesn't exist, the service falls back to rule-based logic
- Training scripts use synthetic data - replace with real data for production

