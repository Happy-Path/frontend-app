import { LearningModule, User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  // User-related methods
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/auth/me');
  }

  // Module-related methods
  async getModules(): Promise<LearningModule[]> {
    return this.get<LearningModule[]>('/modules');
  }

  async getModule(id: string): Promise<LearningModule> {
    return this.get<LearningModule>(`/modules/${id}`);
  }

  async createModule(moduleData: Omit<LearningModule, 'id'>): Promise<LearningModule> {
    return this.post<LearningModule>('/modules', moduleData);
  }

  async updateModule(id: string, moduleData: Partial<LearningModule>): Promise<LearningModule> {
    return this.put<LearningModule>(`/modules/${id}`, moduleData);
  }

  async deleteModule(id: string): Promise<void> {
    return this.delete<void>(`/modules/${id}`);
  }
}

export const apiClient = new ApiClient();

// Create a legacy 'api' export for backward compatibility
export const api = apiClient;