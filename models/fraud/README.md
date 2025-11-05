# Fraud Detection Models

This directory contains AI/ML models for fraud detection.

## Models

- **fraud_detection_model.pkl** - Main fraud classifier (XGBoost/Random Forest)
  - Input: Transaction features (amount, location, frequency, type, merchant, time patterns)
  - Output: Fraud probability score (0-100)

- **anomaly_detection_model.pkl** - Isolation Forest for unsupervised anomaly detection
  - Input: User transaction patterns and spending behavior
  - Output: Anomaly score for unusual patterns

- **shap_explainer.pkl** - SHAP explainer for feature importance
  - Purpose: Explain why transactions are flagged
  - Used by `/api/fraud/explain/:id` endpoint

## Training

Run `python scripts/train_fraud_model.py` to train new models.

## Usage

Models are loaded and used via the Python ML API service at `ml_service/app.py`.

