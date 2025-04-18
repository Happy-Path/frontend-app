
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-happy-50 p-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 text-center">
        <div className="mb-6">
          <span className="inline-block text-8xl font-bold text-happy-600">404</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4 text-happy-700">Oops! Page not found</h1>
        
        <p className="text-xl text-gray-600 mb-8">
          We can't find the page you're looking for.
        </p>
        
        <div className="flex justify-center">
          <Button asChild size="lg" className="happy-button">
            <Link to="/">
              <Home className="mr-2 h-5 w-5" /> Go Back Home
            </Link>
          </Button>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-100">
          <p className="text-gray-500">
            Need help? Contact support.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
