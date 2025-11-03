import { fraudScore } from './aiService';

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

export const analyzeTransaction = (transaction: TransactionData) => {
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

