"""
Train Forecast Models
Trains spending/income forecast models and default risk model
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingRegressor, GradientBoostingClassifier
import xgboost as xgb

# Try to import Prophet
try:
    from prophet import Prophet
    PROPHET_AVAILABLE = True
except ImportError:
    PROPHET_AVAILABLE = False
    print("Warning: Prophet not available. Will use alternative forecasting methods.")

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models" / "forecast"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

def generate_forecast_data(n_samples=1000):
    """Generate synthetic time series data for forecasting"""
    np.random.seed(42)
    
    dates = pd.date_range(start='2020-01-01', periods=n_samples, freq='D')
    
    # Generate time series with trend and seasonality
    trend = np.linspace(1000, 5000, n_samples)
    seasonal = 1000 * np.sin(2 * np.pi * np.arange(n_samples) / 365.25)
    noise = np.random.normal(0, 200, n_samples)
    
    values = trend + seasonal + noise
    
    df = pd.DataFrame({
        'ds': dates,
        'y': values
    })
    
    return df

def train_spending_forecast_model():
    """Train spending forecast model using Prophet or alternative"""
    print("Training spending forecast model...")
    
    if PROPHET_AVAILABLE:
        # Use Prophet
        df = generate_forecast_data(n_samples=1000)
        
        model = Prophet(
            yearly_seasonality=True,
            weekly_seasonality=True,
            daily_seasonality=False
        )
        
        model.fit(df)
        
        model_path = MODELS_DIR / "spending_forecast_model.pkl"
        joblib.dump(model, model_path)
        
        print(f"Prophet model saved to {model_path}")
        return model
    else:
        # Use alternative: XGBoost time series
        print("Using XGBoost for time series forecasting...")
        
        df = generate_forecast_data(n_samples=1000)
        
        # Create features
        df['day_of_year'] = df['ds'].dt.dayofyear
        df['day_of_week'] = df['ds'].dt.dayofweek
        df['month'] = df['ds'].dt.month
        df['year'] = df['ds'].dt.year
        
        # Lag features
        for lag in [1, 7, 30]:
            df[f'lag_{lag}'] = df['y'].shift(lag)
        
        df = df.dropna()
        
        X = df[['day_of_year', 'day_of_week', 'month', 'year', 'lag_1', 'lag_7', 'lag_30']].values
        y = df['y'].values
        
        model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42
        )
        
        model.fit(X, y)
        
        model_path = MODELS_DIR / "spending_forecast_model.pkl"
        joblib.dump(model, model_path)
        
        print(f"XGBoost model saved to {model_path}")
        return model

def train_income_forecast_model():
    """Train income forecast model"""
    print("Training income forecast model...")
    
    # Similar to spending forecast
    return train_spending_forecast_model()

def generate_default_risk_data(n_samples=5000):
    """Generate synthetic default risk training data"""
    np.random.seed(42)
    
    data = []
    labels = []
    
    for _ in range(n_samples):
        # Generate features
        debt_to_income = np.random.beta(2, 5)  # Skewed towards lower values
        transaction_frequency = np.random.poisson(10)
        large_transactions = np.random.poisson(2)
        avg_monthly_spending = np.random.exponential(2000)
        
        features = [
            debt_to_income,
            transaction_frequency,
            large_transactions,
            avg_monthly_spending
        ]
        
        # Determine default risk
        risk_score = 0
        if debt_to_income > 0.5:
            risk_score += 40
        elif debt_to_income > 0.3:
            risk_score += 20
        
        if transaction_frequency > 50:
            risk_score += 25
        
        if large_transactions > 5:
            risk_score += 20
        
        # Binary label (high risk = 1)
        is_high_risk = 1 if risk_score >= 70 else 0
        
        data.append(features)
        labels.append(is_high_risk)
    
    return np.array(data), np.array(labels)

def train_default_risk_model():
    """Train default risk classification model"""
    print("Training default risk model...")
    
    X, y = generate_default_risk_data(n_samples=5000)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train XGBoost classifier
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
    model_path = MODELS_DIR / "default_risk_model.pkl"
    scaler_path = MODELS_DIR / "default_risk_scaler.pkl"
    
    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    
    print(f"Model saved to {model_path}")
    print(f"Scaler saved to {scaler_path}")
    
    return model, scaler

def main():
    """Main training function"""
    print("=" * 50)
    print("Forecast Model Training")
    print("=" * 50)
    
    # Train models
    spending_model = train_spending_forecast_model()
    income_model = train_income_forecast_model()
    default_risk_model, default_risk_scaler = train_default_risk_model()
    
    print("\n" + "=" * 50)
    print("Training completed!")
    print("=" * 50)
    print(f"\nModels saved to: {MODELS_DIR}")
    print("\nModels created:")
    print("  - spending_forecast_model.pkl")
    print("  - income_forecast_model.pkl")
    print("  - default_risk_model.pkl")
    print("  - default_risk_scaler.pkl")

if __name__ == "__main__":
    main()

