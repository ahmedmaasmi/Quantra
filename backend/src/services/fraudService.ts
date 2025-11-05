import { fraudScore } from './aiService';
import { fraudAPI } from './mlApiClient';

export interface TransactionData {
  amount: number;
  location?: string;
  frequency?: number;
  type: string;
  description?: string;
  metadata?: any;
}

export const calculateFraudScore = (transaction: TransactionData): number => {
  return fraudScore(transaction);
};

export const isFraudulent = (score: number, threshold: number = 70): boolean => {
  return score >= threshold;
};

export const analyzeTransaction = async (transaction: TransactionData, userHistory?: any[]) => {
  // Try to use ML service first
  try {
    const mlResult = await fraudAPI.detect(transaction, userHistory);
    
    if (mlResult) {
      return {
        score: mlResult.score,
        fraudulent: mlResult.fraudulent,
        riskLevel: mlResult.riskLevel,
        recommendations: mlResult.recommendations || [],
      };
    }
  } catch (error) {
    console.warn('ML service unavailable, using fallback:', error);
  }
  
  // Fallback to rule-based scoring
  const score = calculateFraudScore(transaction);
  const fraudulent = isFraudulent(score);
  
  return {
    score,
    fraudulent,
    riskLevel: score < 30 ? 'low' : score < 70 ? 'medium' : 'high',
    recommendations: score >= 70 
      ? ['Block transaction', 'Notify user', 'Require additional verification']
      : score >= 50
      ? ['Flag for review', 'Monitor user activity']
      : ['Allow transaction']
  };
};

