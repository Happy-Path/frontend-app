
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, LogIn, LogOut, Settings, User as UserIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Header = ({ user: propUser }) => {
  const { user: authUser, logout } = useAuth();
  const user = propUser || authUser;

  return (
    <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center rounded-b-xl">
      <Link to="/" className="flex items-center gap-2">
        <span className="text-3xl font-bold text-happy-600">Happy<span className="text-sunny-500">Path</span></span>
      </Link>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-happy-100">
          <Link to="/">
            <Home className="h-5 w-5 text-happy-600" />
          </Link>
        </Button>
        
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-happy-100">
          <Link to="/settings">
            <Settings className="h-5 w-5 text-happy-600" />
          </Link>
        </Button>
        
        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/profile">
              <Avatar className="cursor-pointer border-2 border-happy-200 hover:border-happy-400 transition-all">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-sunny-200 text-sunny-700">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={logout} 
              className="rounded-full hover:bg-happy-100" 
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-happy-600" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-happy-100">
            <Link to="/login" title="Login">
              <LogIn className="h-5 w-5 text-happy-600" />
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
