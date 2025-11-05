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
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.detail || errorData.error || `ML service error: ${response.statusText}`);
    }

    return await response.json();
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
 * Fraud Detection API calls
 */
export const fraudAPI = {
  detect: async (transaction: any, userHistory?: any[]) => {
    return callMLService('/api/fraud/detect', 'POST', {
      transaction,
      user_history: userHistory,
    });
  },
  
  explain: async (transaction: any, userHistory?: any[]) => {
    return callMLService('/api/fraud/explain', 'POST', {
      transaction,
      user_history: userHistory,
    });
  },
  
  detectAnomaly: async (transaction: any, userHistory?: any[]) => {
    return callMLService('/api/fraud/anomaly', 'POST', {
      transaction,
      user_history: userHistory,
    });
  },
};

/**
 * Forecast API calls
 */
export const forecastAPI = {
  generate: async (userId: string | undefined, period: string, months: number, historicalData?: any[]) => {
    return callMLService('/api/forecast/generate', 'POST', {
      userId,
      period,
      months,
      historical_data: historicalData,
    });
  },
  
  calculateDefaultRisk: async (userId: string, transactions: any[], averageIncome: number) => {
    return callMLService('/api/forecast/default-risk', 'POST', {
      userId,
      transactions,
      averageIncome,
    });
  },
};

/**
 * KYC API calls
 */
export const kycAPI = {
  verify: async (userId: string, documentType: string, documentNumber?: string, documentImage?: string, faceImage?: string) => {
    return callMLService('/api/kyc/verify', 'POST', {
      userId,
      documentType,
      documentNumber,
      documentImage,
      faceImage,
    });
  },
  
  extractText: async (documentImage: string, documentType: string) => {
    return callMLService('/api/kyc/ocr', 'POST', {
      documentImage,
      documentType,
    });
  },
  
  matchFace: async (documentImage: string, faceImage: string) => {
    return callMLService('/api/kyc/face-match', 'POST', {
      documentImage,
      faceImage,
    });
  },
};

/**
 * Simulation API calls
 */
export const simulationAPI = {
  process: async (name: string | undefined, data: any, type?: string, parameters?: any) => {
    return callMLService('/api/simulation/process', 'POST', {
      name,
      data,
      type,
      parameters,
    });
  },
};

/**
 * Chat API calls
 */
export const chatAPI = {
  message: async (message: string, userId?: string, context?: any) => {
    return callMLService('/api/chat/message', 'POST', {
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

