/**
 * API Client Configuration
 * Centralized API client for connecting frontend to backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface ApiError {
  error: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get JWT token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        // Try to get error message from response body
        try {
          const text = await response.text();
          if (text) {
            try {
              const errorData: ApiError = JSON.parse(text);
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch {
              // Not JSON, use text as error message
              errorMessage = text.substring(0, 200) || errorMessage;
            }
          }
        } catch (textError) {
          // Failed to read response, use default message
        }
        
        throw new Error(errorMessage);
      }

      // Parse successful JSON response
      try {
        const text = await response.text();
        if (!text) {
          return {} as T;
        }
        return JSON.parse(text) as T;
      } catch (parseError) {
        throw new Error('Failed to parse response as JSON');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Users
  async getUsers() {
    return this.request<any[]>('/users');
  }

  async getUser(userId: string) {
    return this.request<any>(`/users/${userId}`);
  }

  // Transactions
  async getTransactions(userId?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.request<any[]>(`/transactions?${params.toString()}`);
  }

  async getTransaction(transactionId: string) {
    return this.request<any>(`/transactions/${transactionId}`);
  }

  async createTransaction(data: any) {
    return this.request<any>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransactionStats(userId: string) {
    return this.request<any>(`/transactions/stats/${userId}`);
  }

  // Alerts
  async getAlerts(userId?: string, status?: string) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    return this.request<any[]>(`/alerts?${params.toString()}`);
  }

  async getAlert(alertId: string) {
    return this.request<any>(`/alerts/${alertId}`);
  }

  async createAlert(data: any) {
    return this.request<any>('/alerts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAlert(alertId: string, data: any) {
    return this.request<any>(`/alerts/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async markAlertAsRead(alertId: string) {
    return this.request<any>(`/alerts/${alertId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllAlertsAsRead(userId: string) {
    return this.request<{ updated: number }>(`/alerts/user/${userId}/read-all`, {
      method: 'PATCH',
    });
  }

  async deleteAlert(alertId: string) {
    return this.request<void>(`/alerts/${alertId}`, {
      method: 'DELETE',
    });
  }

  // Forecast
  async getForecast(userId: string, months = 3) {
    return this.request<any>(`/forecast/${userId}?months=${months}`);
  }

  async createForecast(data: any) {
    return this.request<any>('/forecast', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Fraud Detection
  async analyzeTransaction(data: any) {
    return this.request<any>('/fraud/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cases
  async getCases(userId?: string, status?: string) {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    return this.request<any[]>(`/cases?${params.toString()}`);
  }

  // KYC
  async uploadKYC(userId: string, formData: FormData) {
    const url = `${this.baseUrl}/users/${userId}/kyc`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.message || error.error || 'Request failed');
    }
    return response.json();
  }

  async updateKYCStatus(userId: string, status: string) {
    return this.request<any>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ kycStatus: status }),
    });
  }

  // Fraud
  async markAsFalsePositive(transactionId: string) {
    return this.request<any>(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify({ isFlagged: false }),
    });
  }

  // Search
  async search(query: string) {
    return this.request<any>(`/search?q=${encodeURIComponent(query)}`);
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  }

  async getCase(caseId: string) {
    return this.request<any>(`/cases/${caseId}`);
  }

  async createCase(data: any) {
    return this.request<any>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCase(caseId: string, data: any) {
    return this.request<any>(`/cases/${caseId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async assignCase(caseId: string, assignedTo: string) {
    return this.request<any>(`/cases/${caseId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    });
  }

  // Dashboard Stats
  async getDashboardStats() {
    return this.request<any>('/dashboard');
  }

  // Chat
  async sendChatMessage(message: string, userId?: string | null, context?: any) {
    return this.request<{ message: string; timestamp: string; userId?: string; data?: any }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, userId, context }),
    });
  }

  async getChatHistory(userId: string) {
    return this.request<any[]>(`/chat/${userId}`);
  }

  // Simulations
  async createSimulation(data: { name?: string; data: any; type?: string; parameters?: any }) {
    return this.request<any>('/simulations/simulate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSimulations(status?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    return this.request<{ simulations: any[]; total: number; limit: number; offset: number }>(`/simulations/simulations?${params.toString()}`);
  }

  async getSimulation(simulationId: string) {
    return this.request<any>(`/simulations/simulations/${simulationId}`);
  }

  async getSimulationMetrics() {
    return this.request<any>('/simulations/metrics');
  }

  async deleteSimulation(simulationId: string) {
    return this.request<{ message: string; id: string }>(`/simulations/simulations/${simulationId}`, {
      method: 'DELETE',
    });
  }

  async deleteAllSimulations() {
    return this.request<{ message: string; deletedCount: number }>('/simulations/simulations', {
      method: 'DELETE',
    });
  }

  private formatTimestamp(date: string | Date): string {
    const now = new Date();
    const timestamp = new Date(date);
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return timestamp.toLocaleDateString();
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;

