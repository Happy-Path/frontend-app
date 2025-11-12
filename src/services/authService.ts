// src/services/authService.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authService = {
  async loginUser(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    const token = res.data?.token;
    if (!token) throw new Error("Login did not return a token");
    localStorage.setItem("token", token);

    // ✅ Always fetch current user to guarantee role is present
    const me = await api.get("/auth/me");
    return me.data; // user object
  },

  async registerUser(name: string, email: string, password: string, role: "student"|"teacher"|"parent") {
    await api.post("/auth/register", { name, email, password, role });
  },

  async getCurrentUser() {
    const res = await api.get("/auth/me");
    return res.data;
  },

  async logoutUser() {
    localStorage.removeItem("token");
  },
};
