// src/components/teacher/TeacherNotifications.tsx
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    PlusCircle,
    Search,
    Check,
    Clock,
    Bell,
    AlertTriangle,
    Info,
    Heart,
    User,
} from "lucide-react";
import { toast } from "sonner";
import NewNotificationDialog from "./NewNotificationDialog";
import {
    notificationService,
    NotificationDto,
} from "@/services/notificationService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TeacherNotifications = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isNewNotificationOpen, setIsNewNotificationOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
    const queryClient = useQueryClient();

    // ✅ Received notifications (teacher as recipient)
    const {
        data: receivedNotifications = [],
        isLoading: isLoadingReceived,
        isError: isErrorReceived,
    } = useQuery<NotificationDto[]>({
        queryKey: ["notifications", "received", "teacher"],
        queryFn: notificationService.getReceived,
    });

    // ✅ Sent notifications (teacher as sender)
    const {
        data: sentNotifications = [],
        isLoading: isLoadingSent,
        isError: isErrorSent,
    } = useQuery<NotificationDto[]>({
        queryKey: ["notifications", "sent", "teacher"],
        queryFn: notificationService.getSent,
    });

    // 🔍 Filter for inbox (search by sender name, title, message)
    const filteredInbox = useMemo(
        () =>
            receivedNotifications.filter((notification) => {
                const text = [
                    notification.sender?.name ?? "",
                    notification.title ?? "",
                    notification.message ?? "",
                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(searchQuery.toLowerCase());
            }),
        [receivedNotifications, searchQuery]
    );

    // 🔍 Filter for sent (search by recipient name, title, message)
    const filteredSent = useMemo(
        () =>
            sentNotifications.filter((notification) => {
                const text = [
                    notification.recipient?.name ?? "",
                    notification.title ?? "",
                    notification.message ?? "",
                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(searchQuery.toLowerCase());
            }),
        [sentNotifications, searchQuery]
    );

    // Badge count = unread received notifications
    const unreadCount = useMemo(
        () => receivedNotifications.filter((n) => !n.isRead).length,
        [receivedNotifications]
    );

    // 🔁 Mark one received notification as read
    const markOneMutation = useMutation({
        mutationFn: (id: string) => notificationService.markRead(id),
        onSuccess: () => {
            toast.success("Notification marked as read");
            queryClient.invalidateQueries({
                queryKey: ["notifications", "received", "teacher"],
            });
        },
        onError: () => {
            toast.error("Failed to mark notification as read");
        },
    });

    // 🔁 Mark all received notifications as read
    const markAllMutation = useMutation({
        mutationFn: () => notificationService.markAllRead(),
        onSuccess: () => {
            toast.success("All notifications marked as read");
            queryClient.invalidateQueries({
                queryKey: ["notifications", "received", "teacher"],
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

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "attention_alert":
                return <AlertTriangle className="h-4 w-4 text-amber-500" />;
            case "quiz_result":
                return <Check className="h-4 w-4 text-green-500" />;
            case "progress_update":
                return <Heart className="h-4 w-4 text-purple-500" />;
            case "system":
                return <Info className="h-4 w-4 text-blue-500" />;
            default:
                return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "attention_alert":
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                        Attention Alert
                    </Badge>
                );
            case "quiz_result":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        Quiz Result
                    </Badge>
                );
            case "progress_update":
                return (
                    <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                        Progress Update
                    </Badge>
                );
            case "system":
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                        System
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                        General
                    </Badge>
                );
        }
    };

    const getInboxVariant = (type: string) => {
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

    const renderSentTable = (items: NotificationDto[]) => {
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-12">
                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">No notifications</p>
                </div>
            );
        }

        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Recipient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.map((notification) => (
                        <TableRow key={notification.id}>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="bg-happy-100 text-happy-700">
                                            {(notification.recipient?.name ?? "?")
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">
                                            {notification.recipient?.name ?? "Unknown"}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {notification.recipient?.role === "parent"
                                                ? "Parent"
                                                : "Teacher"}
                                        </div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {getTypeIcon(notification.type)}
                                    {getTypeLabel(notification.type)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{notification.title}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {notification.message}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(notification.sentAt).toLocaleDateString()}
                                </div>
                            </TableCell>
                            <TableCell>
                                {notification.isRead ? (
                                    <Badge variant="outline" className="bg-gray-100">
                                        Read
                                    </Badge>
                                ) : (
                                    <Badge
                                        variant="outline"
                                        className="bg-happy-100 text-happy-800"
                                    >
                                        Unread
                                    </Badge>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        );
    };

    const hasUnreadInbox = unreadCount > 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold">Notifications</h2>
                    {hasUnreadInbox && (
                        <Badge
                            variant="secondary"
                            className="bg-happy-100 text-happy-800"
                        >
                            {unreadCount} unread
                        </Badge>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search notifications..."
                            className="pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button onClick={() => setIsNewNotificationOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Notification
                    </Button>
                </div>
            </div>

            {/* Main Tabs: Inbox vs Sent */}
            <Tabs
                value={activeTab}
                onValueChange={(val) => setActiveTab(val as "inbox" | "sent")}
                className="space-y-4"
            >
                <TabsList>
                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                    <TabsTrigger value="sent">Sent</TabsTrigger>
                </TabsList>

                {/* 📥 INBOX (received notifications from admin / others) */}
                <TabsContent value="inbox">
                    <Card>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between w-full">
                                <CardTitle className="text-left">Inbox</CardTitle>

                                {hasUnreadInbox && (
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
                            {isLoadingReceived ? (
                                <div className="flex justify-center p-6">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600"></div>
                                </div>
                            ) : isErrorReceived ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="h-12 w-12 text-red-500 mb-4" />
                                    <p className="text-lg font-medium">
                                        Failed to load notifications
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Please try again later.
                                    </p>
                                </div>
                            ) : filteredInbox.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">
                                        No notifications in your inbox
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You will see system notifications and important messages
                                        here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredInbox.map((notification) => (
                                        <Alert
                                            key={notification.id}
                                            className={`${getInboxVariant(notification.type)} ${
                                                !notification.isRead ? "border-l-4" : ""
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {getTypeIcon(notification.type)}
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
                                                                {new Date(
                                                                    notification.sentAt
                                                                ).toLocaleDateString()}
                              </span>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
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
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* 📤 SENT (notifications teacher has sent to parents) */}
                <TabsContent value="sent">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Sent Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoadingSent ? (
                                <div className="flex justify-center p-6">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600"></div>
                                </div>
                            ) : isErrorSent ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="h-12 w-12 text-red-500 mb-4" />
                                    <p className="text-lg font-medium">
                                        Failed to load sent notifications
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Please try again later.
                                    </p>
                                </div>
                            ) : (
                                renderSentTable(filteredSent)
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <NewNotificationDialog
                open={isNewNotificationOpen}
                onOpenChange={setIsNewNotificationOpen}
            />
        </div>
    );
};

export default TeacherNotifications;
