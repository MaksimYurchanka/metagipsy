import { AnalyzeRequest, AnalyzeResponse, SessionData, AnalyticsData, ApiError } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      }
    });
    
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        timestamp: new Date().toISOString()
      }));
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  }
  
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  // Analysis endpoints
  async analyzeConversation(data: AnalyzeRequest): Promise<AnalyzeResponse> {
    return this.request('/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  async quickAnalyze(message: string, context?: any): Promise<any> {
    return this.request('/analyze/quick', {
      method: 'POST',
      body: JSON.stringify({ message, context })
    });
  }
  
  // Session endpoints
  async getSessions(params?: {
    limit?: number;
    offset?: number;
    platform?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ sessions: SessionData[]; pagination: any }> {
    const query = new URLSearchParams(params as any);
    return this.request(`/sessions?${query}`);
  }
  
  async getSession(id: string): Promise<any> {
    return this.request(`/sessions/${id}`);
  }
  
  async deleteSession(id: string): Promise<void> {
    return this.request(`/sessions/${id}`, {
      method: 'DELETE'
    });
  }
  
  async updateSession(id: string, data: { title?: string }): Promise<any> {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  // Analytics endpoints
  async getAnalytics(params?: {
    dateFrom?: string;
    dateTo?: string;
    granularity?: 'day' | 'week' | 'month';
  }): Promise<AnalyticsData> {
    const query = new URLSearchParams(params as any);
    return this.request(`/analytics?${query}`);
  }
  
  // Auth endpoints
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }
  
  async register(email: string, password: string, name?: string): Promise<{ token: string; user: any }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    });
  }
  
  async logout(): Promise<void> {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  }
  
  async getProfile(): Promise<any> {
    return this.request('/auth/profile');
  }
  
  async updateProfile(data: { name?: string; avatar?: string }): Promise<any> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return fetch(`${this.baseUrl.replace('/api/v1', '')}/health`).then(r => r.json());
  }
}

export const api = new ApiClient(API_BASE_URL);

// Error handling utilities
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}

export function handleApiError(error: any): string {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

// Request interceptors
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export default api;

