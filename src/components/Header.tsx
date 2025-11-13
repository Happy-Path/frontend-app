// src/components/Header.tsx
import React from 'react';
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Home, LogIn, LogOut, Settings, MessageSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/messageService";
import { toast } from "sonner";

interface HeaderProps {
    user?: User;
}

export function MessagesBadge() {
    const { data } = useQuery({
        queryKey: ["unread"],
        queryFn: messageService.unreadCount,
        refetchInterval: 1000,
    });
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

    return (
        <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center rounded-b-xl">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
        <span className="text-3xl font-bold text-happy-600">
          Happy <span className="text-sunny-500">Path</span>
        </span>
            </Link>

            {/* Right section */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="rounded-full hover:bg-happy-100"
                >
                    {/* 👇 Home now goes to /dashboard so it routes by role */}
                    <Link to="/dashboard" title="Home">
                        <Home className="h-5 w-5 text-happy-600" />
                    </Link>
                </Button>

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

                {/* Messages Icon + Unread Badge */}
                <MessagesBadge />

                {user ? (
                    <div className="flex items-center gap-3">
                        <Link to="/profile" title="Profile">
                            <Avatar className="cursor-pointer border-2 border-happy-200 hover:border-happy-400 transition-all">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-sunny-200 text-sunny-700">
                                    {user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="rounded-full hover:bg-happy-100"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5 text-happy-600" />
                        </Button>
                    </div>
                ) : (
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
