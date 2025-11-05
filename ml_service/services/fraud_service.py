"""
Fraud Detection Service
Handles fraud detection, anomaly detection, and explainability
"""

import os
import sys
import joblib
import numpy as np
from typing import Dict, Any, Optional, List
from pathlib import Path

# Add models directory to path
# Go up to Quantra directory (parent of ml_service)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODELS_DIR = BASE_DIR / "models"

class FraudDetectionService:
    def __init__(self):
        self.fraud_model = None
        self.anomaly_model = None
        self.shap_explainer = None
        self.load_models()
    
    def load_models(self):
        """Load trained models"""
        fraud_model_path = MODELS_DIR / "fraud" / "fraud_detection_model.pkl"
        anomaly_model_path = MODELS_DIR / "fraud" / "anomaly_detection_model.pkl"
        shap_explainer_path = MODELS_DIR / "fraud" / "shap_explainer.pkl"
        
        # Load models if they exist, otherwise use fallback
        if fraud_model_path.exists():
            try:
                self.fraud_model = joblib.load(fraud_model_path)
            except Exception as e:
                print(f"Warning: Could not load fraud model: {e}")
        
        if anomaly_model_path.exists():
            try:
                self.anomaly_model = joblib.load(anomaly_model_path)
            except Exception as e:
                print(f"Warning: Could not load anomaly model: {e}")
        
        if shap_explainer_path.exists():
            try:
                self.shap_explainer = joblib.load(shap_explainer_path)
            except Exception as e:
                print(f"Warning: Could not load SHAP explainer: {e}")
    
    def extract_features(self, transaction: Dict[str, Any], user_history: Optional[List[Dict[str, Any]]] = None) -> np.ndarray:
        """Extract features from transaction data"""
        features = []
        
        # Amount-based features
        amount = transaction.get('amount', 0)
        features.append(amount)
        features.append(1 if amount > 50000 else 0)
        features.append(1 if amount > 10000 else 0)
        features.append(1 if amount > 5000 else 0)
        
        # Location features
        location = transaction.get('location') or transaction.get('country')
        features.append(1 if location and location != "userCountry" else 0)
        
        # Frequency features
        frequency = transaction.get('frequency', 0)
        features.append(frequency)
        features.append(1 if frequency > 10 else 0)
        features.append(1 if frequency > 5 else 0)
        
        # Type features
        tx_type = transaction.get('type', '')
        features.append(1 if tx_type == 'withdrawal' else 0)
        features.append(1 if tx_type == 'credit' else 0)
        
        # Time-based features (if timestamp available)
        # Simplified for now
        
        # User history features
        if user_history:
            avg_amount = np.mean([t.get('amount', 0) for t in user_history]) if user_history else 0
            features.append(avg_amount)
            features.append(1 if amount > avg_amount * 3 else 0)
        else:
            features.extend([0, 0])
        
        return np.array(features).reshape(1, -1)
    
    async def detect_fraud(self, transaction: Dict[str, Any], user_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Detect fraud in a transaction"""
        features = self.extract_features(transaction, user_history)
        
        if self.fraud_model:
            try:
                # Use trained model
                fraud_score = self.fraud_model.predict_proba(features)[0][1] * 100
            except Exception as e:
                print(f"Error using fraud model: {e}")
                fraud_score = self._rule_based_score(transaction)
        else:
            # Fallback to rule-based scoring
            fraud_score = self._rule_based_score(transaction)
        
        is_fraudulent = fraud_score >= 70
        risk_level = 'high' if fraud_score >= 70 else ('medium' if fraud_score >= 30 else 'low')
        
        recommendations = []
        if fraud_score >= 70:
            recommendations = ['Block transaction', 'Notify user', 'Require additional verification']
        elif fraud_score >= 50:
            recommendations = ['Flag for review', 'Monitor user activity']
        else:
            recommendations = ['Allow transaction']
        
        return {
            'score': float(fraud_score),
            'fraudulent': is_fraudulent,
            'riskLevel': risk_level,
            'recommendations': recommendations
        }
    
    async def explain_fraud(self, transaction: Dict[str, Any], user_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Explain why a transaction was flagged"""
        features = self.extract_features(transaction, user_history)
        analysis = await self.detect_fraud(transaction, user_history)
        
        # Feature contributions (simplified)
        feature_names = [
            'amount', 'amount_high', 'amount_medium', 'amount_low',
            'location_foreign', 'frequency', 'frequency_high', 'frequency_medium',
            'type_withdrawal', 'type_credit', 'avg_amount', 'amount_deviation'
        ]
        
        top_features = []
        amount = transaction.get('amount', 0)
        location = transaction.get('location') or transaction.get('country')
        frequency = transaction.get('frequency', 0)
        
        if amount > 50000:
            top_features.append({
                'feature': 'High Transaction Amount',
                'contribution': 60,
                'description': f'Transaction amount of ${amount} exceeds high-risk threshold',
                'impact': 'high'
            })
        elif amount > 10000:
            top_features.append({
                'feature': 'Large Transaction Amount',
                'contribution': 40,
                'description': f'Transaction amount of ${amount} is significantly above average',
                'impact': 'medium'
            })
        
        if location and location != 'US':
            top_features.append({
                'feature': 'International Transaction',
                'contribution': 30,
                'description': f'Transaction from country: {location}',
                'impact': 'medium'
            })
        
        if frequency > 10:
            top_features.append({
                'feature': 'High Transaction Frequency',
                'contribution': 30,
                'description': f'User has made {frequency} transactions in the last 24 hours',
                'impact': 'medium'
            })
        
        # Use SHAP if available
        if self.shap_explainer and self.fraud_model:
            try:
                shap_values = self.shap_explainer.shap_values(features)
                # Process SHAP values for top features
                # This is simplified - actual implementation would rank features
            except Exception as e:
                print(f"Error using SHAP explainer: {e}")
        
        return {
            'transactionId': transaction.get('id'),
            'fraudScore': analysis['score'],
            'isFlagged': analysis['fraudulent'],
            'topFeatures': sorted(top_features, key=lambda x: x['contribution'], reverse=True)[:5],
            'explanation': '; '.join(analysis['recommendations']),
            'recommendations': analysis['recommendations']
        }
    
    async def detect_anomaly(self, transaction: Dict[str, Any], user_history: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        """Detect anomalies in transaction patterns"""
        features = self.extract_features(transaction, user_history)
        
        if self.anomaly_model:
            try:
                anomaly_score = self.anomaly_model.decision_function(features)[0]
                is_anomaly = self.anomaly_model.predict(features)[0] == -1
            except Exception as e:
                print(f"Error using anomaly model: {e}")
                is_anomaly = False
                anomaly_score = 0
        else:
            # Fallback: use fraud detection score
            analysis = await self.detect_fraud(transaction, user_history)
            is_anomaly = analysis['fraudulent']
            anomaly_score = analysis['score'] / 100
        
        return {
            'isAnomaly': bool(is_anomaly),
            'anomalyScore': float(anomaly_score),
            'normalizedScore': float(min(max(anomaly_score * 100, 0), 100))
        }
    
    def _rule_based_score(self, transaction: Dict[str, Any]) -> float:
        """Fallback rule-based scoring"""
        score = 0
        amount = transaction.get('amount', 0)
        
        if amount > 50000:
            score += 60
        elif amount > 10000:
            score += 40
        elif amount > 5000:
            score += 20
        
        location = transaction.get('location') or transaction.get('country')
        if location and location != "userCountry":
            score += 30
        
        frequency = transaction.get('frequency', 0)
        if frequency > 10:
            score += 30
        elif frequency > 5:
            score += 15
        
        tx_type = transaction.get('type', '')
        if tx_type == 'withdrawal' and amount > 5000:
            score += 20
        
        return min(score, 100)

