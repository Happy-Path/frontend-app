const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface AuthResponse {
  token: string;
  message?: string;
}

import { User } from '@/types';

// Backend user data structure (as received from MongoDB)
interface BackendUser {
  _id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "parent";
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

class AuthService {
  // Register user
  async registerUser(
      name: string,
      email: string,
      password: string,
      role: "student" | "teacher" | "parent"
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
  }

  // Login user
  async loginUser(email: string, password: string): Promise<User> {
    console.log('Login attempt:', { email, apiUrl: `${API_BASE_URL}/auth/login` });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      console.log('Login response headers:', response.headers);

      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        console.error('Login failed with status:', response.status, 'Data:', data);
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.token);
      console.log('Token stored:', data.token);

      // Get user data after successful login
      const user = await this.getCurrentUser();
      console.log('User data retrieved:', user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const backendUser: BackendUser = await response.json();

    if (!response.ok) {
      // If token is invalid, remove it
      localStorage.removeItem('token');
      throw new Error((backendUser as any).message || 'Failed to get user data');
    }

    // Map backend user data to frontend User interface
    const user: User = {
      id: backendUser._id,
      name: backendUser.name,
      email: backendUser.email,
      role: backendUser.role,
      avatar: backendUser.avatar || '/placeholder.svg',
      createdAt: backendUser.createdAt,
      updatedAt: backendUser.updatedAt,
      _id: backendUser._id,
    };

    return user;
  }

  // Logout user
  async logoutUser(): Promise<void> {
    localStorage.removeItem('token');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const authService = new AuthService();