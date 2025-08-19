import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role: "student" | "teacher" | "parent") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check token and get current user on load
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
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const userData = await authService.loginUser(email, password);
      setUser(userData);
      toast("Login successful", {
        description: `Welcome back, ${userData.name}`,
      });
      return userData;
    } catch (error: any) {
      toast("Login failed", {
        description: error.message || "Invalid credentials",
      });
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
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.registerUser(name, email, password, role);
      toast("Registration successful", {
        description: "Please login with your new account.",
      });
    } catch (error: any) {
      toast("Registration failed", {
        description: error.message || "Could not register user",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logoutUser();
      setUser(null);
      toast("Logged out", {
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast("Logout failed", {
        description: error.message || "Could not log out",
      });
    }
  };

  return (
      <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};