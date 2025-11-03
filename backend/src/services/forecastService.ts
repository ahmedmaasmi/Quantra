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
  // TODO: Integrate with ML model for actual forecasting
  // For now, return mock predictions
  
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

