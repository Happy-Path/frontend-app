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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";

const getNotificationIcon = (type: string) => {
    switch (type) {
        case "attention_alert":
            return <AlertTriangle className="h-5 w-5 text-amber-500" />;
        case "quiz_result":
            return <Check className="h-5 w-5 text-emerald-500" />;
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
            return "border-amber-200/70 bg-amber-50";
        case "quiz_result":
            return "border-emerald-200/70 bg-emerald-50";
        case "progress_update":
            return "border-purple-200/70 bg-purple-50";
        case "system":
            return "border-blue-200/70 bg-blue-50";
        default:
            return "border-blue-200/70 bg-blue-50";
    }
};

const getTypeLabel = (type: string) => {
    switch (type) {
        case "attention_alert":
            return "Attention Alert";
        case "quiz_result":
            return "Quiz Result";
        case "progress_update":
            return "Progress Update";
        case "system":
            return "System";
        default:
            return "Update";
    }
};

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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600" />
                <p className="mt-4 text-muted-foreground">
                    Loading notifications...
                </p>
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
            <Card className="border border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className="rounded-full bg-happy-100 p-2">
                                <Bell className="h-4 w-4 text-happy-800" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Notifications</CardTitle>
                                <CardDescription className="text-xs">
                                    Messages and alerts sent to you about your child&apos;s
                                    learning.
                                </CardDescription>
                            </div>
                            {hasUnread && (
                                <Badge className="ml-1 bg-happy-100 text-happy-800 rounded-full text-[11px]">
                                    {unreadCount} unread
                                </Badge>
                            )}
                        </div>

                        {hasUnread && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                                disabled={markAllMutation.isPending}
                            >
                                {markAllMutation.isPending ? "Marking..." : "Mark all as read"}
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent>
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <Bell className="h-10 w-10 text-muted-foreground mb-3" />
                            <p className="text-base font-medium">No notifications yet</p>
                            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                                You&apos;ll receive updates from the system and teachers here
                                — quiz results, progress updates, and attention alerts.
                            </p>
                        </div>
                    ) : (
                        // 🔹 Scrollable list for long notification history
                        <div className="max-h-[480px] overflow-y-auto space-y-4 pr-1">
                            {notifications.map((notification) => {
                                const isUnread = !notification.isRead;
                                const typeLabel = getTypeLabel(notification.type);

                                return (
                                    <Alert
                                        key={notification.id}
                                        className={`relative rounded-xl border ${getNotificationVariant(
                                            notification.type
                                        )} ${
                                            isUnread
                                                ? "border-l-4 border-l-happy-500 shadow-sm"
                                                : "border-l border-l-gray-200"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* icon */}
                                            <div className="mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </div>

                                            {/* main content */}
                                            <div className="flex-1 space-y-2">
                                                <div className="flex justify-between gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <AlertTitle className="text-sm font-semibold">
                                                                {notification.title}
                                                            </AlertTitle>
                                                            <Badge
                                                                variant="outline"
                                                                className="h-5 text-[11px] px-2 border-none bg-white/60 text-gray-700"
                                                            >
                                                                {typeLabel}
                                                            </Badge>
                                                        </div>
                                                        <AlertDescription className="mt-1 text-sm">
                                                            {notification.message}
                                                        </AlertDescription>
                                                    </div>

                                                    {/* unread dot */}
                                                    {isUnread && (
                                                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-happy-500 mt-1" />
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center pt-1">
                                                    <div className="flex flex-wrap items-center text-xs text-muted-foreground gap-3">
                                                        {notification.sender?.name && (
                                                            <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                                                {notification.sender.name}
                              </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                                                            {new Date(
                                                                notification.sentAt
                                                            ).toLocaleDateString()}
                            </span>
                                                    </div>

                                                    {!notification.isRead && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs"
                                                            onClick={() =>
                                                                handleMarkAsRead(notification.id)
                                                            }
                                                            disabled={markOneMutation.isPending}
                                                        >
                                                            Mark as read
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Alert>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ParentNotifications;
