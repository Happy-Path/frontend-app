// src/components/teacher/TeacherNotifications.tsx
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
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

const getTypeIcon = (type: string) => {
    switch (type) {
        case "attention_alert":
            return <AlertTriangle className="h-4 w-4 text-amber-500" />;
        case "quiz_result":
            return <Check className="h-4 w-4 text-emerald-500" />;
        case "progress_update":
            return <Heart className="h-4 w-4 text-purple-500" />;
        case "system":
            return <Info className="h-4 w-4 text-blue-500" />;
        default:
            return <Info className="h-4 w-4 text-blue-500" />;
    }
};

const getTypeBadge = (type: string) => {
    switch (type) {
        case "attention_alert":
            return (
                <Badge
                    variant="outline"
                    className="bg-amber-50 text-amber-700 border-amber-200 text-[11px] h-5 px-2"
                >
                    Attention Alert
                </Badge>
            );
        case "quiz_result":
            return (
                <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] h-5 px-2"
                >
                    Quiz Result
                </Badge>
            );
        case "progress_update":
            return (
                <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 border-purple-200 text-[11px] h-5 px-2"
                >
                    Progress Update
                </Badge>
            );
        case "system":
            return (
                <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] h-5 px-2"
                >
                    System
                </Badge>
            );
        default:
            return (
                <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200 text-[11px] h-5 px-2"
                >
                    General
                </Badge>
            );
    }
};

const getInboxVariant = (type: string) => {
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

    const hasUnreadInbox = unreadCount > 0;

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

    const renderSentTable = (items: NotificationDto[]) => {
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-10">
                    <Bell className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-base font-medium">No notifications sent yet</p>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md text-center">
                        When you send messages or alerts to parents, they will appear here so
                        you can quickly review what was sent.
                    </p>
                </div>
            );
        }

        return (
            <div className="max-h-[420px] overflow-y-auto rounded-lg border border-gray-100">
                <Table>
                    <TableHeader className="bg-gray-50/60">
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
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={undefined} />
                                            <AvatarFallback className="bg-happy-100 text-happy-700 text-xs">
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
                                        {getTypeBadge(notification.type)}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{notification.title}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[220px]">
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
                                        <Badge variant="outline" className="bg-gray-100 text-gray-700">
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
            </div>
        );
    };

    const isLoadingAny = isLoadingReceived || isLoadingSent;

    return (
        <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-gray-100">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-happy-100 p-2">
                                <Bell className="h-5 w-5 text-happy-800" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Notifications</CardTitle>
                                <CardDescription className="text-xs">
                                    View messages you receive and manage updates you send to parents.
                                </CardDescription>
                            </div>
                            {hasUnreadInbox && (
                                <Badge className="ml-1 bg-happy-100 text-happy-800 rounded-full text-[11px]">
                                    {unreadCount} unread
                                </Badge>
                            )}
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <div className="relative w-full sm:w-64">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search notifications..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="default"
                                onClick={() => setIsNewNotificationOpen(true)}
                                className="whitespace-nowrap"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Notification
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-4">
                    <Tabs
                        value={activeTab}
                        onValueChange={(val) => setActiveTab(val as "inbox" | "sent")}
                        className="space-y-4"
                    >
                        <TabsList>
                            <TabsTrigger value="inbox">Inbox</TabsTrigger>
                            <TabsTrigger value="sent">Sent</TabsTrigger>
                        </TabsList>

                        {/* 📥 INBOX */}
                        <TabsContent value="inbox">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs text-muted-foreground">
                                    Notifications sent to you (system, admin, or other staff).
                                </p>
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

                            {isLoadingReceived ? (
                                <div className="flex justify-center p-6">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-happy-600" />
                                </div>
                            ) : isErrorReceived ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Bell className="h-10 w-10 text-red-500 mb-3" />
                                    <p className="text-base font-medium">
                                        Failed to load notifications
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Please try again later.
                                    </p>
                                </div>
                            ) : filteredInbox.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <Bell className="h-10 w-10 text-muted-foreground mb-3" />
                                    <p className="text-base font-medium">
                                        No notifications in your inbox
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1 max-w-md">
                                        You will see system notifications and important messages here
                                        when they are sent to you.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                                    {filteredInbox.map((notification) => {
                                        const isUnread = !notification.isRead;
                                        return (
                                            <Alert
                                                key={notification.id}
                                                className={`relative rounded-xl border ${getInboxVariant(
                                                    notification.type
                                                )} ${
                                                    isUnread
                                                        ? "border-l-4 border-l-happy-500 shadow-sm"
                                                        : "border-l border-l-gray-200"
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5">
                                                        {getTypeIcon(notification.type)}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex justify-between gap-2">
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <AlertTitle className="text-sm font-semibold">
                                                                        {notification.title}
                                                                    </AlertTitle>
                                                                    {getTypeBadge(notification.type)}
                                                                </div>
                                                                <AlertDescription className="mt-1 text-sm">
                                                                    {notification.message}
                                                                </AlertDescription>
                                                            </div>
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

                                                            {isUnread && (
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
                        </TabsContent>

                        {/* 📤 SENT */}
                        <TabsContent value="sent">
                            <p className="text-xs text-muted-foreground mb-2">
                                Messages and alerts you have sent to parents or other teachers.
                            </p>

                            {isLoadingSent ? (
                                <div className="flex justify-center p-6">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-happy-600" />
                                </div>
                            ) : isErrorSent ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <Bell className="h-10 w-10 text-red-500 mb-3" />
                                    <p className="text-base font-medium">
                                        Failed to load sent notifications
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Please try again later.
                                    </p>
                                </div>
                            ) : (
                                renderSentTable(filteredSent)
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <NewNotificationDialog
                open={isNewNotificationOpen}
                onOpenChange={setIsNewNotificationOpen}
            />

            {isLoadingAny && (
                <span className="sr-only">Loading notifications…</span>
            )}
        </div>
    );
};

export default TeacherNotifications;
