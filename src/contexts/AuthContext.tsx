// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
      name: string,
      email: string,
      password: string,
      role: "student" | "teacher" | "parent"
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user", error);
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      // Expect authService.loginUser to also set token in localStorage
      const userData = await authService.loginUser(email, password);

      // Helpful extras for role-based redirects, etc.
      if ((userData as any)?.role) localStorage.setItem("role", (userData as any).role);
      if ((userData as any)?._id) localStorage.setItem("userId", (userData as any)._id);

      setUser(userData);
      toast("Login successful", { description: `Welcome back, ${userData.name}` });
      return userData;
    } catch (error: any) {
      toast("Login failed", { description: error?.response?.data?.message || "Invalid credentials" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
      name: string,
      email: string,
      password: string,
      role: "student" | "teacher" | "parent"
  ) => {
    setIsLoading(true);
    try {
      await authService.registerUser(name, email, password, role);
      toast("Registration successful", { description: "Please login with your new account." });
    } catch (error: any) {
      toast("Registration failed", { description: error?.response?.data?.message || "Could not register user" });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logoutUser(); // server-side logout if available
    } catch (error: any) {
      // Not fatal—continue to clear local state
      console.warn("Logout error:", error?.message || error);
      toast("Logout failed", { description: error?.message || "Logging you out locally." });
    } finally {
      setUser(null);
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      toast("Logged out", { description: "You have been successfully logged out." });
    }
  };

  return (
      <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
