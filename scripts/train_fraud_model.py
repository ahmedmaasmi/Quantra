"""
Train Fraud Detection Models
Trains fraud detection classifier, anomaly detection model, and SHAP explainer
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
import xgboost as xgb

# Try to import optional dependencies
try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    print("Warning: shap not available. SHAP explainer will be skipped.")
    print("Install with: pip install shap")

# Add parent directory to path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

MODELS_DIR = BASE_DIR / "models" / "fraud"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def generate_synthetic_data(n_samples=10000):
    """Generate synthetic fraud detection training data"""
    np.random.seed(42)
    
    data = []
    labels = []
    
    for _ in range(n_samples):
        # Generate features
        amount = np.random.exponential(5000)
        location_foreign = np.random.choice([0, 1], p=[0.7, 0.3])
        frequency = np.random.poisson(5)
        tx_type = np.random.choice(['credit', 'debit', 'withdrawal'], p=[0.3, 0.5, 0.2])
        
        # Create feature vector
        features = [
            amount,
            1 if amount > 50000 else 0,
            1 if amount > 10000 else 0,
            1 if amount > 5000 else 0,
            location_foreign,
            frequency,
            1 if frequency > 10 else 0,
            1 if frequency > 5 else 0,
            1 if tx_type == 'withdrawal' else 0,
            1 if tx_type == 'credit' else 0,
            0,  # avg_amount placeholder
            0   # amount_deviation placeholder
        ]
        
        # Determine label (fraud probability)
        fraud_score = 0
        if amount > 50000:
            fraud_score += 60
        elif amount > 10000:
            fraud_score += 40
        
        if location_foreign:
            fraud_score += 30
        
        if frequency > 10:
            fraud_score += 30
        
        if tx_type == 'withdrawal' and amount > 5000:
            fraud_score += 20
        
        is_fraud = 1 if fraud_score >= 70 else 0
        
        data.append(features)
        labels.append(is_fraud)
    
    return np.array(data), np.array(labels)

def train_fraud_detection_model():
    """Train main fraud detection classifier"""
    print("Training fraud detection model...")
    
    # Generate or load training data
    X, y = generate_synthetic_data(n_samples=10000)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train XGBoost model
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        base_score=0.5,  # Explicitly set to valid range for logistic loss
        objective='binary:logistic'
    )
    
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    
    print(f"Training accuracy: {train_score:.4f}")
    print(f"Test accuracy: {test_score:.4f}")
    
    # Save model and scaler
    model_path = MODELS_DIR / "fraud_detection_model.pkl"
    scaler_path = MODELS_DIR / "fraud_scaler.pkl"
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"Model saved to {model_path}")
    
    return model, scaler

def train_anomaly_detection_model():
    """Train isolation forest for anomaly detection"""
    print("Training anomaly detection model...")
    
    # Generate training data (normal transactions)
    X, _ = generate_synthetic_data(n_samples=5000)
    
    # Filter to mostly normal transactions
    normal_mask = np.random.random(len(X)) > 0.1  # 90% normal
    X_normal = X[normal_mask]
    
    # Train Isolation Forest
    model = IsolationForest(
        contamination=0.1,
        random_state=42,
        n_estimators=100
    )
    
    model.fit(X_normal)
    
    # Evaluate
    predictions = model.predict(X_normal)
    anomaly_rate = (predictions == -1).mean()
    
    print(f"Detected anomaly rate: {anomaly_rate:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "anomaly_detection_model.pkl"
    joblib.dump(model, model_path)
    
    print(f"Model saved to {model_path}")
    
    return model

def train_shap_explainer(fraud_model, X_sample):
    """Train SHAP explainer for feature importance"""
    if not SHAP_AVAILABLE:
        print("SHAP not available. Skipping SHAP explainer.")
        print("Install with: pip install shap")
        return None
    
    print("Training SHAP explainer...")
    
    try:
        # Use TreeExplainer for XGBoost
        explainer = shap.TreeExplainer(fraud_model)
        
        # Calculate SHAP values for sample
        shap_values = explainer.shap_values(X_sample[:100])
        
        # Save explainer
        explainer_path = MODELS_DIR / "shap_explainer.pkl"
        joblib.dump(explainer, explainer_path)
        
        print(f"SHAP explainer saved to {explainer_path}")
        
        return explainer
    except Exception as e:
        print(f"Warning: Could not create SHAP explainer: {e}")
        return None

def main():
    """Main training function"""
    print("=" * 50)
    print("Fraud Detection Model Training")
    print("=" * 50)
    
    # Generate sample data for SHAP
    X_sample, _ = generate_synthetic_data(n_samples=1000)
    
    # Train models
    fraud_model, scaler = train_fraud_detection_model()
    anomaly_model = train_anomaly_detection_model()
    
    # Train SHAP explainer
    X_sample_scaled = scaler.transform(X_sample)
    shap_explainer = train_shap_explainer(fraud_model, X_sample_scaled)
    
    print("\n" + "=" * 50)
    print("Training completed!")
    print("=" * 50)
    print(f"\nModels saved to: {MODELS_DIR}")
    print("\nModels created:")
    print("  - fraud_detection_model.pkl")
    print("  - fraud_scaler.pkl")
    print("  - anomaly_detection_model.pkl")
    if shap_explainer:
        print("  - shap_explainer.pkl")

if __name__ == "__main__":
    main()

