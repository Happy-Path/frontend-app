import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<void>;
  register: (name: string, email: string, password: string, role: 'student' | 'parent' | 'teacher') => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: { name: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on component mount
    const checkSession = async () => {
      try {
        // Try to get current user from local storage first
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          // If no stored user, try to get from API
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
          // Store user in local storage
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      } catch (error) {
        console.error("No active session found", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const user = await api.loginUser(email, password);
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (error) {
      toast("Login failed", {
        description: "Invalid email or password. Please try again."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast("Google login failed", {
        description: error.message || "Failed to login with Google. Please try again."
      });
      throw error;
    }
  };

  const register = async (
    name: string, 
    email: string, 
    password: string, 
    role: 'student' | 'parent' | 'teacher'
  ): Promise<void> => {
    setIsLoading(true);
    try {
      await api.registerUser(name, email, password, role);
      toast("Registration successful", {
        description: "Your account has been created successfully. Please log in."
      });
    } catch (error) {
      toast("Registration failed", {
        description: "An error occurred during registration. Please try again."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: { name: string }): Promise<void> => {
    try {
      // In a real app, this would call an API to update the user profile
      setUser(prev => prev ? { ...prev, name: userData.name } : null);
      
      // Update user in localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const updatedUser = { ...JSON.parse(storedUser), name: userData.name };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast("Logged out", {
      description: "You have been successfully logged out."
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      loginWithGoogle, 
      register, 
      logout,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
