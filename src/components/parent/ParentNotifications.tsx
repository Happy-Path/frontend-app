// src/components/parent/ParentNotifications.tsx
import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    AlertTriangle,
    Bell,
    Check,
    Clock,
    Info,
    User,
    Heart,
} from "lucide-react";
import { toast } from "sonner";
import {
    notificationService,
    NotificationDto,
} from "@/services/notificationService";

const ParentNotifications = () => {
    const queryClient = useQueryClient();

    const {
        data: notifications = [],
        isLoading,
        isError,
    } = useQuery<NotificationDto[]>({
        queryKey: ["notifications", "received", "parent"],
        queryFn: notificationService.getReceived,
    });

    const hasUnread = useMemo(
        () => notifications.some((n) => !n.isRead),
        [notifications]
    );

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.isRead).length,
        [notifications]
    );

    const markOneMutation = useMutation({
        mutationFn: (id: string) => notificationService.markRead(id),
        onSuccess: () => {
            toast.success("Notification marked as read");
            queryClient.invalidateQueries({
                queryKey: ["notifications", "received", "parent"],
            });
        },
        onError: () => {
            toast.error("Failed to mark notification as read");
        },
    });

    const markAllMutation = useMutation({
        mutationFn: () => notificationService.markAllRead(),
        onSuccess: () => {
            toast.success("All notifications marked as read");
            queryClient.invalidateQueries({
                queryKey: ["notifications", "received", "parent"],
            });
        },
        onError: () => {
            toast.error("Failed to mark all notifications as read");
        },
    });

    const handleMarkAsRead = (id: string) => {
        markOneMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        markAllMutation.mutate();
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "attention_alert":
                return <AlertTriangle className="h-5 w-5 text-amber-500" />;
            case "quiz_result":
                return <Check className="h-5 w-5 text-green-500" />;
            case "progress_update":
                return <Heart className="h-5 w-5 text-purple-500" />;
            case "system":
                return <Info className="h-5 w-5 text-blue-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getNotificationVariant = (type: string) => {
        switch (type) {
            case "attention_alert":
                return "border-amber-200 bg-amber-50";
            case "quiz_result":
                return "border-green-200 bg-green-50";
            case "progress_update":
                return "border-purple-200 bg-purple-50";
            case "system":
                return "border-blue-200 bg-blue-50";
            default:
                return "border-blue-200 bg-blue-50";
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600" />
                <p className="mt-4 text-muted-foreground">Loading notifications...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Bell className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-lg font-medium">Failed to load notifications</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold">Notifications</h2>
                    {hasUnread && (
                        <Badge className="bg-happy-100 text-happy-800">
                            {unreadCount} unread
                        </Badge>
                    )}
                </div>
                {hasUnread && (
                    <Button
                        variant="outline"
                        onClick={handleMarkAllAsRead}
                        disabled={markAllMutation.isPending}
                    >
                        {markAllMutation.isPending ? "Marking..." : "Mark all as read"}
                    </Button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No notifications yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                        You'll receive notifications from the system and teachers here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map((notification) => (
                        <Alert
                            key={notification.id}
                            className={`${getNotificationVariant(notification.type)} ${
                                !notification.isRead ? "border-l-4" : ""
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                {getNotificationIcon(notification.type)}
                                <div className="flex-1">
                                    <AlertTitle>{notification.title}</AlertTitle>
                                    <AlertDescription className="mt-1">
                                        {notification.message}
                                    </AlertDescription>
                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex items-center text-sm text-muted-foreground gap-3">
                                            {notification.sender?.name && (
                                                <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                                                    {notification.sender.name}
                        </span>
                                            )}
                                            <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                                                {new Date(notification.sentAt).toLocaleDateString()}
                      </span>
                                        </div>
                                        {!notification.isRead && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleMarkAsRead(notification.id)}
                                                disabled={markOneMutation.isPending}
                                            >
                                                Mark as read
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Alert>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ParentNotifications;
