// src/components/RoleLanding.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function RoleLanding() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case "admin":
      return <Navigate to="/admin" replace />;
    case "teacher":
      return <Navigate to="/teacher" replace />;
    case "parent":
      return <Navigate to="/parent" replace />;
    case "student":
    default:
      return <Navigate to="/" replace />;
  }
}
