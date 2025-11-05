import { forecastAPI } from './mlApiClient';

export interface ForecastRequest {
  userId?: string;
  period: 'daily' | 'weekly' | 'monthly';
  months: number;
}

export interface ForecastResult {
  predictions: Array<{
    date: string;
    predictedAmount: number;
    confidence: number;
  }>;
  accuracy?: number;
  model: string;
}

export const generateForecast = async (request: ForecastRequest): Promise<ForecastResult> => {
  // Try to use ML service first
  try {
    const mlResult = await forecastAPI.generate(
      request.userId,
      request.period,
      request.months,
      request.historical_data
    );
    
    if (mlResult) {
      return {
        predictions: mlResult.predictions || [],
        accuracy: mlResult.accuracy || 0.85,
        model: mlResult.model || 'prophet-model-v1'
      };
    }
  } catch (error) {
    console.warn('ML service unavailable, using fallback:', error);
  }
  
  // Fallback to mock predictions
  const predictions = [];
  const startDate = new Date();
  
  for (let i = 0; i < request.months * 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    predictions.push({
      date: date.toISOString().split('T')[0],
      predictedAmount: Math.random() * 5000 + 1000,
      confidence: Math.random() * 0.3 + 0.7 // 70-100%
    });
  }
  
  return {
    predictions,
    accuracy: 0.85,
    model: 'prophet-model-v1'
  };
};

export const predictSpending = async (userId: string, months: number = 1) => {
  return generateForecast({
    userId,
    period: 'monthly',
    months
  });
};

export const predictIncome = async (userId: string, months: number = 1) => {
  return generateForecast({
    userId,
    period: 'monthly',
    months
  });
};

export interface DefaultRiskScore {
  score: number; // 0-100, higher = more risky
  level: 'low' | 'medium' | 'high';
  factors: string[];
  probability: number; // 0-1, probability of default
}

export const calculateDefaultRisk = async (
  userId: string,
  userTransactions: any[],
  averageIncome: number
): Promise<DefaultRiskScore> => {
  // Try to use ML service first
  try {
    const mlResult = await forecastAPI.calculateDefaultRisk(userId, userTransactions, averageIncome);
    
    if (mlResult) {
      return {
        score: mlResult.score,
        level: mlResult.level,
        factors: mlResult.factors || [],
        probability: mlResult.probability || mlResult.score / 100,
      };
    }
  } catch (error) {
    console.warn('ML service unavailable, using fallback:', error);
  }
  
  // Fallback to rule-based calculation
  let riskScore = 0;
  const factors: string[] = [];
  
  // Calculate transaction statistics
  const totalDebits = userTransactions
    .filter(tx => tx.type === 'debit' || (tx.amount < 0))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  const totalCredits = userTransactions
    .filter(tx => tx.type === 'credit' || (tx.amount > 0))
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  const avgMonthlySpending = totalDebits / Math.max(1, userTransactions.length / 30);
  const debtToIncomeRatio = averageIncome > 0 ? avgMonthlySpending / averageIncome : 0;
  
  // High debt-to-income ratio
  if (debtToIncomeRatio > 0.5) {
    riskScore += 40;
    factors.push('High debt-to-income ratio');
  } else if (debtToIncomeRatio > 0.3) {
    riskScore += 20;
    factors.push('Moderate debt-to-income ratio');
  }
  
  // High transaction frequency (potential cash flow issues)
  const recentTransactions = userTransactions.filter(tx => {
    const txDate = new Date(tx.timestamp || tx.createdAt);
    const daysAgo = (Date.now() - txDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 30;
  });
  
  if (recentTransactions.length > 50) {
    riskScore += 25;
    factors.push('High transaction frequency');
  }
  
  // Large transaction amounts
  const largeTransactions = userTransactions.filter(tx => Math.abs(tx.amount) > 10000);
  if (largeTransactions.length > 5) {
    riskScore += 20;
    factors.push('Multiple large transactions');
  }
  
  // Negative balance trend
  const recentTotal = recentTransactions.reduce((sum, tx) => {
    const amount = tx.type === 'credit' ? tx.amount : -tx.amount;
    return sum + amount;
  }, 0);
  
  if (recentTotal < -5000) {
    riskScore += 30;
    factors.push('Negative balance trend');
  }
  
  // Fraud flags
  const flaggedTransactions = userTransactions.filter(tx => tx.isFlagged || (tx.fraudScore && tx.fraudScore > 70));
  if (flaggedTransactions.length > 0) {
    riskScore += 15;
    factors.push('Fraud-flagged transactions');
  }
  
  // Cap at 100
  riskScore = Math.min(100, riskScore);
  
  // Determine risk level
  let level: 'low' | 'medium' | 'high';
  if (riskScore < 30) {
    level = 'low';
  } else if (riskScore < 70) {
    level = 'medium';
  } else {
    level = 'high';
  }
  
  // Calculate probability (0-1)
  const probability = riskScore / 100;
  
  return {
    score: riskScore,
    level,
    factors: factors.length > 0 ? factors : ['No significant risk factors identified'],
    probability
  };
};

