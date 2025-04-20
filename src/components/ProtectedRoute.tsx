
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

  // During loading, show nothing
  if (isLoading) {
    return null;
  }

  // If not logged in, redirect to login immediately
  if (!user) {
    console.log("User not authenticated, redirecting to login");
    // Only show toast if not already on login page to avoid infinite loop
    if (location.pathname !== '/login') {
      toast.error("Authentication required", {
        description: "Please login to access this page",
      });
    }
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If no specific roles required or user has the required role, allow access
  if (allowedRoles.length === 0 || allowedRoles.includes(user.role)) {
    return children;
  }

  // If user doesn't have the required role, redirect to their dashboard
  console.log(`Access denied for role: ${user.role}, required roles: ${allowedRoles.join(', ')}`);
  toast.error("Access denied", {
    description: "You don't have permission to access this page",
  });

  // Role-based redirects
  const roleBasedRedirect = user.role === 'teacher' 
    ? '/teacher' 
    : user.role === 'parent' 
      ? '/parent'
      : user.role === 'student'
        ? '/student/resources'
        : '/';

  return <Navigate to={roleBasedRedirect} replace />;
};

export default ProtectedRoute;
