# Simulation Models

This directory contains AI/ML models for general AI simulation tasks.

## Models

- **pattern_detector.pkl** - Autoencoder or clustering model for pattern detection
  - Purpose: Detect patterns in time series data
  - Output: Detected patterns, anomalies

- **classifier.pkl** - Random Forest or Neural Network for general classification
  - Purpose: General classification tasks
  - Output: Class predictions with probabilities

- **analyzer.pkl** - Statistical analysis and PCA tools
  - Purpose: Data analysis and feature extraction
  - Output: Statistical summaries, correlations, insights

## Training

Run `python scripts/train_simulation_models.py` to train new models.

## Usage

Models are loaded and used via the Python ML API service at `ml_service/app.py`.

