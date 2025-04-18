
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-happy-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-happy-700">Loading</h1>
          <p className="mt-2 text-gray-600">Please wait...</p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login page
  if (!user) {
    toast.error("Authentication required", {
      description: "Please login to access this page",
    });
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;
