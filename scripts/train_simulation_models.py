"""
Train Simulation Models
Trains pattern detection, classification, and analysis models
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models" / "simulation"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def generate_pattern_data(n_samples=1000):
    """Generate synthetic time series data for pattern detection"""
    np.random.seed(42)
    
    # Generate time series with patterns
    time = np.arange(n_samples)
    
    # Trend
    trend = np.linspace(0, 100, n_samples)
    
    # Seasonal pattern
    seasonal = 20 * np.sin(2 * np.pi * time / 100)
    
    # Random noise
    noise = np.random.normal(0, 5, n_samples)
    
    # Anomalies
    anomalies = np.zeros(n_samples)
    anomaly_indices = np.random.choice(n_samples, size=10, replace=False)
    anomalies[anomaly_indices] = np.random.normal(0, 30, 10)
    
    data = trend + seasonal + noise + anomalies
    
    return data.reshape(-1, 1)

def train_pattern_detector():
    """Train autoencoder for pattern detection"""
    print("Training pattern detector...")
    
    # Generate training data
    X = generate_pattern_data(n_samples=1000)
    
    # Use Isolation Forest for anomaly/pattern detection
    model = IsolationForest(
        contamination=0.1,
        random_state=42,
        n_estimators=100
    )
    
    model.fit(X)
    
    # Evaluate
    predictions = model.predict(X)
    anomaly_rate = (predictions == -1).mean()
    
    print(f"Detected anomaly rate: {anomaly_rate:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "pattern_detector.pkl"
    joblib.dump(model, model_path)
    
    print(f"Pattern detector saved to {model_path}")
    
    return model

def generate_classification_data(n_samples=2000):
    """Generate synthetic classification data"""
    np.random.seed(42)
    
    n_features = 10
    X = np.random.randn(n_samples, n_features)
    
    # Create labels based on feature combinations
    y = (X[:, 0] + X[:, 1] > 0).astype(int)
    
    return X, y

def train_classifier():
    """Train general-purpose classifier"""
    print("Training classifier...")
    
    X, y = generate_classification_data(n_samples=2000)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train Random Forest
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"Training accuracy: {train_score:.4f}")
    print(f"Test accuracy: {test_score:.4f}")
    
    # Save model
    model_path = MODELS_DIR / "classifier.pkl"
    joblib.dump(model, model_path)
    
    print(f"Classifier saved to {model_path}")
    
    return model

def train_analyzer():
    """Train/setup analysis tools (PCA, scalers)"""
    print("Setting up analyzer...")
    
    # Generate sample data
    X = np.random.randn(1000, 20)
    
    # PCA for dimensionality reduction
    pca = PCA(n_components=10)
    pca.fit(X)
    
    # Standard scaler
    scaler = StandardScaler()
    scaler.fit(X)
    
    # Create analyzer object
    analyzer = {
        'pca': pca,
        'scaler': scaler,
        'feature_names': [f'feature_{i}' for i in range(X.shape[1])]
    }
    
    # Save analyzer
    analyzer_path = MODELS_DIR / "analyzer.pkl"
    joblib.dump(analyzer, analyzer_path)
    
    print(f"Analyzer saved to {analyzer_path}")
    print(f"PCA explained variance: {pca.explained_variance_ratio_.sum():.4f}")
    
    return analyzer

def main():
    """Main training function"""
    print("=" * 50)
    print("Simulation Model Training")
    print("=" * 50)
    
    # Train models
    pattern_detector = train_pattern_detector()
    classifier = train_classifier()
    analyzer = train_analyzer()
    
    print("\n" + "=" * 50)
    print("Training completed!")
    print("=" * 50)
    print(f"\nModels saved to: {MODELS_DIR}")
    print("\nModels created:")
    print("  - pattern_detector.pkl")
    print("  - classifier.pkl")
    print("  - analyzer.pkl")

if __name__ == "__main__":
    main()

