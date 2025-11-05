# Forecast Models

This directory contains AI/ML models for financial forecasting and credit risk assessment.

## Models

- **spending_forecast_model.pkl** - Prophet/LSTM model for spending predictions
  - Input: Historical transaction data (amounts, dates, categories)
  - Output: Future spending predictions with confidence intervals

- **income_forecast_model.pkl** - Prophet/LSTM model for income predictions
  - Input: Historical credit transaction data
  - Output: Future income predictions with confidence intervals

- **default_risk_model.pkl** - XGBoost model for credit default risk assessment
  - Input Features: debt-to-income ratio, transaction frequency, spending patterns, fraud history
  - Output: Default risk score (0-100) and probability

## Training

Run `python scripts/train_forecast_model.py` to train new models.

## Usage

Models are loaded and used via the Python ML API service at `ml_service/app.py`.

