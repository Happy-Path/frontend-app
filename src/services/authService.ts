
import { User } from "@/types";

export const authService = {
  getCurrentUser: async (): Promise<User> => {
    // Simulating API call
    return new Promise((resolve) => {
      setTimeout(() => resolve({
        id: "user-123",
        name: "Alex",
        role: "student",
        avatar: "/placeholder.svg"
      }), 500);
    });
  },
  
  loginUser: async (email: string, password: string): Promise<User> => {
    // Simulating API call with basic validation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // This is a mock - in a real app, we'd validate credentials properly
        if (email === "student@example.com" && password === "password123") {
          resolve({
            id: "user-123",
            name: "Alex",
            role: "student",
            avatar: "/placeholder.svg"
          });
        } else if (email === "teacher@example.com" && password === "password123") {
          resolve({
            id: "user-456",
            name: "Teacher Kim",
            role: "teacher",
            avatar: undefined
          });
        } else if (email === "parent@example.com" && password === "password123") {
          resolve({
            id: "user-789",
            name: "Parent Taylor",
            role: "parent",
            avatar: undefined
          });
        } else {
          reject(new Error("Invalid credentials"));
        }
      }, 800);
    });
  },
  
  registerUser: async (name: string, email: string, password: string, role: "student" | "parent" | "teacher"): Promise<void> => {
    // Simulating API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // In a real app, we would create a user in the database
        console.log(`Registered user: ${name}, ${email}, role: ${role}`);
        
        // Simulate potential registration errors
        if (email === "existing@example.com") {
          reject(new Error("Email already exists"));
        } else {
          resolve();
        }
      }, 1000);
    });
  },
};
