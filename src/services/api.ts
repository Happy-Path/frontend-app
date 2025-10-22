
import { LearningModule, User } from '@/types';
import type { InferResponse } from '@/types/telemetry';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api';
const ML_BASE_URL  = import.meta.env.VITE_ML_URL      ?? 'http://localhost:8000';

class ApiClient {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handle<T>(resp: Response): Promise<T> {
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || 'Request failed');
    return data;
  }

  // ---------- Generic helpers ----------
  async get<T>(endpoint: string): Promise<T> {
    const resp = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handle<T>(resp);
  }

  async post<T>(endpoint: string, body: any): Promise<T> {
    const resp = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return this.handle<T>(resp);
  }

  async put<T>(endpoint: string, body: any): Promise<T> {
    const resp = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body),
    });
    return this.handle<T>(resp);
  }

  async delete<T>(endpoint: string): Promise<T> {
    const resp = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    return this.handle<T>(resp);
  }

  // ---------- Existing domain methods ----------
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/auth/me');
  }

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

  // ---------- NEW: Sessions/Telemetry/ML ----------
  /**
   * Start a learning session for the current (student) user.
   * Returns the created session document.
   */
  async startSession(lessonId?: string): Promise<{ _id: string }> {
    return this.post<{ _id: string }>('/sessions', {
      lessonId,
      deviceInfo: { ua: navigator.userAgent },
    });
  }

  /**
   * Log either an attention or emotion event.
   * `body` can be a single event or an array of events.
   */
  async logEvent(sessionId: string, body: any): Promise<{ inserted: number }> {
    return this.post<{ inserted: number }>(`/sessions/${sessionId}/events`, body);
  }

  /**
   * Call the Flask model for inference.
   * No auth header required here (unless your Flask API enforces it).
   */
  async infer(frameBase64: string, sessionId: string): Promise<InferResponse> {
    const resp = await fetch(`${ML_BASE_URL}/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, frameBase64, clientTs: Date.now() }),
    });
    return this.handle<InferResponse>(resp);
  }

  // ---------- NEW: Reports ----------
  async getDailyReport(userId: string, from?: string, to?: string): Promise<any[]> {
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    const query = qs.toString() ? `?${qs.toString()}` : '';
    return this.get<any[]>(`/reports/learner/${userId}/daily${query}`);
  }

  async getSessionReport(sessionId: string): Promise<{
    attentionTrend: { ts: string; score: number }[];
    emotions: { ts: string; label: string }[];
  }> {
    return this.get(`/reports/session/${sessionId}`);
  }
}

export const apiClient = new ApiClient();
// legacy named export kept
export const api = apiClient;
