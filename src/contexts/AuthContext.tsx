
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            const { user } = session;
            // Transform the Supabase user to match our existing user format
            const transformedUser = {
              id: user.id,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              email: user.email,
              role: user.user_metadata?.role || 'student',
              avatar: user.user_metadata?.avatar_url || '/placeholder.svg'
            };
            setUser(transformedUser);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
    );

    // Check if there's already a session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log(session)
        const { user } = session;
        // Transform the Supabase user to match our existing user format
        const transformedUser = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email,
          role: user.user_metadata?.role || 'student',
          avatar: user.user_metadata?.avatar_url || '/placeholder.svg'
        };
        setUser(transformedUser);
      }
      setIsLoading(false);
    };

    checkSession();

    // Cleanup subscription on unmount
    return () => subscription?.unsubscribe();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // For testing purposes, let's use mock users if Supabase isn't configured
      if (!data || !data.user) {
        console.log("Using mock user data for testing");
        // Mock users for testing
        if (email === "teacher@example.com" && password === "password123") {
          const mockUser = {
            id: "teacher-123",
            name: "Teacher User",
            email: "teacher@example.com",
            role: "teacher",
            avatar: "/placeholder.svg"
          };
          setUser(mockUser);
          return mockUser;
        } else if (email === "parent@example.com" && password === "password123") {
          const mockUser = {
            id: "parent-123",
            name: "Parent User",
            email: "parent@example.com",
            role: "parent",
            avatar: "/placeholder.svg"
          };
          setUser(mockUser);
          return mockUser;
        } else if (email === "student@example.com" && password === "password123") {
          const mockUser = {
            id: "student-123",
            name: "Student User",
            email: "student@example.com",
            role: "student",
            avatar: "/placeholder.svg"
          };
          setUser(mockUser);
          return mockUser;
        } else {
          throw new Error("Invalid credentials");
        }
      }

      // If we have Supabase data, use it
      const transformedUser = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email,
        role: data.user.user_metadata?.role || 'student',
        avatar: data.user.user_metadata?.avatar_url || '/placeholder.svg'
      };

      setUser(transformedUser);
      return transformedUser;
    } catch (error) {
      toast("Login failed", {
        description: error.message || "Invalid email or password. Please try again."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      toast("Google login failed", {
        description: error.message || "Failed to login with Google. Please try again."
      });
      throw error;
    }
  };

  const register = async (name, email, password, role) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role
          }
        }
      });

      if (error) throw error;

      toast("Registration successful", {
        description: "Your account has been created successfully. Please check your email for verification."
      });

      return data.user;
    } catch (error) {
      toast("Registration failed", {
        description: error.message || "An error occurred during registration. Please try again."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      toast("Logged out", {
        description: "You have been successfully logged out."
      });
    } catch (error) {
      toast("Logout failed", {
        description: error.message || "Failed to logout. Please try again."
      });
    }
  };

  return (
      <AuthContext.Provider value={{ user, isLoading, login, loginWithGoogle, register, logout }}>
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
