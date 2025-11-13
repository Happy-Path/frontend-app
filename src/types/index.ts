// src/types/index.ts
// Backend user data structure (as received from MongoDB)
interface BackendUser {
    _id: string;
    name: string;
    email: string;
    role: "student" | "teacher" | "parent"| "admin";
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
}

// User interface for frontend use
export interface User {
    id: string; // Mapped from MongoDB's _id
    name: string;
    email: string;
    role: "student" | "teacher" | "parent"| "admin";
    avatar?: string;
    createdAt?: string;
    updatedAt?: string;
    _id?: string; // Optional: keep for backend compatibility
}

// Auth-related types
export interface AuthResponse {
    token: string;
    message?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    role: "student" | "teacher" | "parent";
}

export interface ApiError {
    message: string;
    statusCode?: number;
}

// Learning Module interface
export interface LearningModule {
    id: string;
    title: string;
    description: string;
    difficulty: "easy" | "medium" | "hard";
    duration: number; // in minutes
    category: string;
    imageUrl?: string;
    completionRate?: number;
    isCompleted?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// Keep Module as alias for backward compatibility
export interface Module extends LearningModule {}

export interface Progress {
    id: string;
    userId: string;
    moduleId: string;
    completionPercentage: number;
    // Add other progress properties
}

export type Role = "student" | "teacher" | "parent" | "admin";