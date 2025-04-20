
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

const AuthCallback = () => {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the auth tokens from the URL
        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        // If successful, redirect to dashboard
        navigate("/dashboard");
      } catch (err) {
        console.error("Error during auth callback:", err);
        setError(err instanceof AuthError ? err.message : "Authentication failed");
        // If there's an error, redirect to login after a short delay
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-happy-50">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Authentication Failed</h1>
          <p className="mt-2 text-gray-600">{error}</p>
          <p className="mt-4">Redirecting to login page...</p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-happy-700">Completing Login</h1>
          <p className="mt-2 text-gray-600">Please wait while we authenticate you...</p>
          <div className="mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthCallback;
