import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles = [] }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Show nothing while auth state is loading
  if (isLoading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!user) {
    if (location.pathname !== "/login") {
      toast.error("Authentication required", {
        description: "Please login to access this page",
      });
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check if user role is allowed
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return children;
  }

  // If role not allowed, deny access and redirect based on role
  toast.error("Access denied", {
    description: "You don't have permission to access this page",
  });

  const roleBasedRedirect =
      user.role === "teacher"
          ? "/teacher"
          : user.role === "parent"
              ? "/parent"
              : user.role === "student"
                  ? "/student/resources"
                  : "/";

  return <Navigate to={roleBasedRedirect} replace />;
};

export default ProtectedRoute;
