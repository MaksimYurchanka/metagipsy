import { AnalyzeRequest, AnalyzeResponse, SessionData, AnalyticsData, ApiError } from '@/types';
import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://metagipsy-backend.onrender.com/api/v1';

class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
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
  
  // ✅ ИСПРАВЛЕНО: Получаем токен из Supabase, не из localStorage
  private async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
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
  
  // ✅ НОВЫЙ МЕТОД: Сохранение сессии после анализа
  async saveSession(sessionData: {
    title: string;
    platform: string;
    messageCount: number;
    overallScore: number;
    strategicAvg: number;
    tacticalAvg: number;
    cognitiveAvg: number;
    innovationAvg: number;
    metadata: any;
  }): Promise<{ success: boolean; sessionId: string; message: string }> {
    console.log('🔗 API: Saving session to backend:', {
      title: sessionData.title,
      platform: sessionData.platform,
      messageCount: sessionData.messageCount,
      overallScore: sessionData.overallScore
    });
    
    try {
      const response = await this.request('/sessions/save', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
      
      console.log('✅ API: Session saved successfully:', response);
      return response;
      
    } catch (error) {
      console.error('❌ API: Failed to save session:', error);
      throw error;
    }
  }
  
  // Session endpoints
  async getSessions(params?: {
    limit?: number;
    offset?: number;
    platform?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{ sessions: SessionData[]; pagination: any }> {
    const query = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          query.append(key, String(value));
        }
      });
    }
    
    const queryString = query.toString();
    const endpoint = queryString ? `/sessions?${queryString}` : '/sessions';
    
    return this.request(endpoint);
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
  
  // ✅ НОВЫЙ МЕТОД: Получение сессий конкретного пользователя
  async getUserSessions(userId?: string, page = 1, limit = 20): Promise<{
    sessions: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    // Если userId не передан, используем текущего пользователя
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      userId = user.id;
    }
    
    const offset = (page - 1) * limit;
    
    return this.request(`/sessions?limit=${limit}&offset=${offset}`);
  }
  
  // ✅ НОВЫЙ МЕТОД: Получение аналитики пользователя
  async getUserAnalytics(days = 30): Promise<{
    totalSessions: number;
    totalMessages: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
    improvementRate: number;
    dimensionAverages: {
      strategic: number;
      tactical: number;
      cognitive: number;
      innovation: number;
    };
    recentSessions: any[];
  }> {
    return this.request(`/sessions/analytics/overview?days=${days}`);
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
  
  // Auth endpoints - оставляем для совместимости, но используем Supabase
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    // Используем Supabase для аутентификации
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      token: data.session?.access_token || '',
      user: data.user
    };
  }
  
  async register(email: string, password: string, name?: string): Promise<{ token: string; user: any }> {
    // Используем Supabase для регистрации
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return {
      token: data.session?.access_token || '',
      user: data.user
    };
  }
  
  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }
  
  async getProfile(): Promise<any> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
  
  async updateProfile(data: { name?: string; avatar?: string }): Promise<any> {
    const { data: updatedUser, error } = await supabase.auth.updateUser({
      data
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return updatedUser;
  }
  
  // ✅ НОВЫЙ МЕТОД: Экспорт сессии
  async exportSession(sessionId: string, format: 'json' | 'csv' | 'markdown' = 'json'): Promise<Blob> {
    const response = await fetch(`${this.baseUrl}/sessions/${sessionId}/export?format=${format}`, {
      headers: {
        'Authorization': `Bearer ${await this.getAuthToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to export session');
    }
    
    return response.blob();
  }
  
  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return fetch(`${this.baseUrl.replace('/api/v1', '')}/health`).then(r => r.json());
  }
  
  // ✅ НОВЫЙ МЕТОД: Проверка доступности backend API
  async checkBackendConnection(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.status === 'healthy';
    } catch {
      return false;
    }
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

// ✅ ОБНОВЛЕНО: Auth token helpers теперь работают с Supabase
export async function setAuthToken(token: string): Promise<void> {
  // Supabase управляет токенами автоматически
  console.log('Auth token managed by Supabase');
}

export async function clearAuthToken(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch {
    return null;
  }
}

export default api;