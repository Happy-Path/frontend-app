// src/components/Header.tsx
import React from "react";
import { User } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, LogIn, LogOut, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/messageService";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
    user?: User;
}

/* -------------------------------------------------------
   MS Teams style initials generator
------------------------------------------------------- */
function getInitials(name?: string | null): string {
    if (!name) return "?";
    const trimmed = name.trim();
    if (!trimmed) return "?";

    const parts = trimmed.split(/\s+/);

    if (parts.length === 1) {
        // Single name → first 2 letters
        return parts[0].substring(0, 2).toUpperCase();
    }

    // First letter of first two words
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

/* -------------------------------------------------------
   Messages Badge (Teacher + Parent Only)
------------------------------------------------------- */
export function MessagesBadge() {
    const { user } = useAuth();

    const role = user?.role;
    const isTeacherOrParent = role === "teacher" || role === "parent";
    const hasToken = !!localStorage.getItem("token");

    // only fetch for teacher/parent
    const shouldFetch = isTeacherOrParent && hasToken;

    const { data } = useQuery({
        queryKey: ["unread"],
        queryFn: messageService.unreadCount,
        enabled: shouldFetch,
        refetchInterval: shouldFetch ? 2000 : false,
    });

    if (!isTeacherOrParent) return null;

    const count = data?.count ?? 0;

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                asChild
                className="rounded-full hover:bg-happy-100"
            >
                <Link to="/messages" title="Messages">
                    <MessageSquare className="h-5 w-5 text-happy-600" />
                </Link>
            </Button>

            {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5 leading-none">
          {count > 99 ? "99+" : count}
        </span>
            )}
        </div>
    );
}

/* -------------------------------------------------------
   Role badge label / color
------------------------------------------------------- */
function RoleBadge({ role }: { role: User["role"] }) {
    const label =
        role === "teacher"
            ? "Teacher"
            : role === "parent"
                ? "Parent"
                : role === "admin"
                    ? "Admin"
                    : "Student";

    return (
        <span className="inline-flex items-center rounded-full bg-happy-100 px-2 py-0.5 text-[11px] font-medium text-happy-800 uppercase tracking-wide">
      {label}
    </span>
    );
}

/* -------------------------------------------------------
   Header Component
------------------------------------------------------- */
const Header = ({ user: propUser }: HeaderProps) => {
    const { user: authUser, logout } = useAuth();
    const user = propUser || authUser;
    const navigate = useNavigate();
    const qc = useQueryClient();

    const handleLogout = async () => {
        try {
            await logout();
            qc.clear();

            toast("Logged out", {
                description: "You have been successfully logged out.",
            });

            navigate("/login", { replace: true });
        } catch (error: any) {
            toast("Logout failed", {
                description: error.message || "Could not log out.",
            });
        }
    };

    const handleViewProfile = () => {
        navigate("/profile");
    };

    return (
        <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center rounded-b-xl">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
        <span className="text-3xl font-bold text-happy-600">
          Happy <span className="text-sunny-500">Path</span>
        </span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-4">
                {/* Home */}
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="rounded-full hover:bg-happy-100"
                >
                    <Link to="/dashboard" title="Home">
                        <Home className="h-5 w-5 text-happy-600" />
                    </Link>
                </Button>

                {/* Settings – currently hidden/commented as requested */}
                {/*
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="rounded-full hover:bg-happy-100"
        >
          <Link to="/settings" title="Settings">
            <Settings className="h-5 w-5 text-happy-600" />
          </Link>
        </Button>
        */}

                {/* Messages */}
                <MessagesBadge />

                {/* Profile + Logout */}
                {user ? (
                    <div className="flex items-center gap-3">
                        {/* Profile popover */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    type="button"
                                    title="Profile"
                                    className="rounded-full focus:outline-none focus:ring-2 focus:ring-happy-400"
                                >
                                    <Avatar className="cursor-pointer border-2 border-happy-200 hover:border-happy-400 transition-all">
                                        <AvatarFallback className="bg-sunny-200 text-sunny-700">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </button>
                            </PopoverTrigger>
                            <PopoverContent
                                align="end"
                                className="w-64 p-4 border border-happy-100 shadow-lg rounded-xl"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-sunny-200 text-sunny-700">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <RoleBadge role={user.role} />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={handleViewProfile}
                                    >
                                        View profile
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                        className="flex items-center gap-1"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span className="text-xs">Logout</span>
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        {/* Separate logout icon can be removed if you prefer only in popover
                Keeping it here for now, but you can safely delete this block. */}
                        {/*
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full hover:bg-happy-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5 text-happy-600" />
            </Button>
            */}
                    </div>
                ) : (
                    /* Login */
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="rounded-full hover:bg-happy-100"
                    >
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
