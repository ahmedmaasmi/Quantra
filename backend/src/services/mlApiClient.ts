/**
 * ML Service API Client
 * Handles communication with Python ML service
 */

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

export interface MLServiceError {
  error: string;
  detail?: string;
}

/**
 * Call ML service API endpoint
 */
async function callMLService<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'POST',
  body?: any
): Promise<T> {
  try {
    const url = `${ML_SERVICE_URL}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({ error: 'Unknown error' }))) as { detail?: string; error?: string };
      throw new Error(errorData.detail || errorData.error || `ML service error: ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error: any) {
    // If ML service is not available, log warning and return null
    if (error.message?.includes('fetch') || error.message?.includes('ECONNREFUSED')) {
      console.warn(`ML service not available at ${ML_SERVICE_URL}. Using fallback logic.`);
      return null as T;
    }
    throw error;
  }
}

/**
 * Check if ML service is available
 */
export async function isMLServiceAvailable(): Promise<boolean> {
  try {
    const response = await callMLService<{ status: string }>('/health', 'GET');
    return response !== null && response.status === 'healthy';
  } catch {
    return false;
  }
}

/**
 * Fraud Detection API types
 */
export interface FraudDetectionResponse {
  score: number;
  fraudulent: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export interface FraudExplainResponse {
  score: number;
  fraudulent: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  topFeatures?: Array<{ feature: string; contribution: number }>;
  explanation?: string;
}

export interface FraudAnomalyResponse {
  isAnomaly: boolean;
  anomalyScore: number;
  threshold: number;
  features?: Array<{ feature: string; value: number; contribution: number }>;
}

/**
 * Fraud Detection API calls
 */
export const fraudAPI = {
  detect: async (transaction: any, userHistory?: any[]): Promise<FraudDetectionResponse | null> => {
    return callMLService<FraudDetectionResponse>('/api/fraud/detect', 'POST', {
      transaction,
      user_history: userHistory,
    });
  },
  
  explain: async (transaction: any, userHistory?: any[]): Promise<FraudExplainResponse | null> => {
    return callMLService<FraudExplainResponse>('/api/fraud/explain', 'POST', {
      transaction,
      user_history: userHistory,
    });
  },
  
  detectAnomaly: async (transaction: any, userHistory?: any[]): Promise<FraudAnomalyResponse | null> => {
    return callMLService<FraudAnomalyResponse>('/api/fraud/anomaly', 'POST', {
      transaction,
      user_history: userHistory,
    });
  },
};

/**
 * Forecast API types
 */
export interface ForecastGenerateResponse {
  predictions: Array<{
    date: string;
    predictedAmount: number;
    confidence: number;
  }>;
  accuracy: number;
  model: string;
}

export interface ForecastDefaultRiskResponse {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
  probability: number;
}

/**
 * Forecast API calls
 */
export const forecastAPI = {
  generate: async (userId: string | undefined, period: string, months: number, historicalData?: any[]): Promise<ForecastGenerateResponse | null> => {
    return callMLService<ForecastGenerateResponse>('/api/forecast/generate', 'POST', {
      userId,
      period,
      months,
      historical_data: historicalData,
    });
  },
  
  calculateDefaultRisk: async (userId: string, transactions: any[], averageIncome: number): Promise<ForecastDefaultRiskResponse | null> => {
    return callMLService<ForecastDefaultRiskResponse>('/api/forecast/default-risk', 'POST', {
      userId,
      transactions,
      averageIncome,
    });
  },
};

/**
 * KYC API types
 */
export interface KYCVerifyResponse {
  verified: boolean;
  score: number;
  checks: {
    documentValid: boolean;
    faceMatch: boolean;
    informationMatch: boolean;
  };
  recommendations: string[];
  extractedFields?: Record<string, any>;
}

export interface KYCExtractTextResponse {
  success: boolean;
  extractedText?: Record<string, any>;
  confidence?: number;
  error?: string;
}

export interface KYCMatchFaceResponse {
  success: boolean;
  matched: boolean;
  score: number;
  distance?: number;
  threshold?: number;
  error?: string;
}

/**
 * KYC API calls
 */
export const kycAPI = {
  verify: async (userId: string, documentType: string, documentNumber?: string, documentImage?: string, faceImage?: string): Promise<KYCVerifyResponse | null> => {
    return callMLService<KYCVerifyResponse>('/api/kyc/verify', 'POST', {
      userId,
      documentType,
      documentNumber,
      documentImage,
      faceImage,
    });
  },
  
  extractText: async (documentImage: string, documentType: string): Promise<KYCExtractTextResponse | null> => {
    return callMLService<KYCExtractTextResponse>('/api/kyc/ocr', 'POST', {
      documentImage,
      documentType,
    });
  },
  
  matchFace: async (documentImage: string, faceImage: string): Promise<KYCMatchFaceResponse | null> => {
    return callMLService<KYCMatchFaceResponse>('/api/kyc/face-match', 'POST', {
      documentImage,
      faceImage,
    });
  },
};

/**
 * Simulation API types
 */
export interface SimulationProcessResponse {
  output: {
    predictions?: any[];
    patterns?: string[];
    classifications?: Record<string, any>;
    analysis?: Record<string, any>;
    confidence: number;
    insights: string[];
    metadata: Record<string, any>;
  };
  metrics: {
    accuracy: number;
    loss: number;
    duration: number;
  };
}

/**
 * Simulation API calls
 */
export const simulationAPI = {
  process: async (name: string | undefined, data: any, type?: string, parameters?: any): Promise<SimulationProcessResponse | null> => {
    return callMLService<SimulationProcessResponse>('/api/simulation/process', 'POST', {
      name,
      data,
      type,
      parameters,
    });
  },
};

/**
 * Chat API types
 */
export interface ChatMessageResponse {
  message: string;
  timestamp: string;
  userId?: string;
  context?: any;
  data?: any;
}

/**
 * Chat API calls
 */
export const chatAPI = {
  message: async (message: string, userId?: string, context?: any): Promise<ChatMessageResponse | null> => {
    return callMLService<ChatMessageResponse>('/api/chat/message', 'POST', {
      message,
      userId,
      context,
    });
  },
};

export default {
  fraudAPI,
  forecastAPI,
  kycAPI,
  simulationAPI,
  chatAPI,
  isMLServiceAvailable,
};

