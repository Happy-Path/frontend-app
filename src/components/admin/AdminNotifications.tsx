// src/components/admin/AdminNotifications.tsx
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
    Bell,
    Clock,
    Info,
    PlusCircle,
    Search,
    AlertTriangle,
    Check,
    Heart,
} from "lucide-react";
import {
    notificationService,
    NotificationDto,
} from "@/services/notificationService";
import AdminNewNotificationDialog from "./AdminNewNotificationDialog";

const AdminNotifications = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const {
        data: notifications = [],
        isLoading,
        isError,
    } = useQuery<NotificationDto[]>({
        queryKey: ["notifications", "sent", "admin"],
        queryFn: notificationService.getSent,
    });

    const filteredNotifications = useMemo(
        () =>
            notifications.filter((notification) => {
                const text = [
                    notification.recipient?.name ?? "",
                    notification.title ?? "",
                    notification.message ?? "",
                ]
                    .join(" ")
                    .toLowerCase();

                return text.includes(searchQuery.toLowerCase());
            }),
        [notifications, searchQuery]
    );

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.isRead).length,
        [notifications]
    );

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

    const getTypeLabel = (type: string, purpose: string) => {
        if (type === "system" || purpose === "system") {
            return (
                <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 border-blue-200"
                >
                    System
                </Badge>
            );
        }
        switch (type) {
            case "attention_alert":
                return (
                    <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                        Attention
                    </Badge>
                );
            case "quiz_result":
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                    >
                        Quiz
                    </Badge>
                );
            case "progress_update":
                return (
                    <Badge
                        variant="outline"
                        className="bg-purple-50 text-purple-700 border-purple-200"
                    >
                        Progress
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-700 border-gray-200"
                    >
                        General
                    </Badge>
                );
        }
    };

    const systemNotifications = filteredNotifications.filter(
        (n) => n.type === "system" || n.purpose === "system"
    );

    const learningNotifications = filteredNotifications.filter(
        (n) => n.purpose === "learning" && n.type !== "system"
    );

    const renderTable = (items: NotificationDto[]) => {
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
                                    {getTypeLabel(notification.type, notification.purpose)}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{notification.title}</div>
                                <div className="text-xs text-muted-foreground truncate max-w-[260px]">
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold">System Notifications</h2>
                    {unreadCount > 0 && (
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
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New System Notification
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="system" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="system">System</TabsTrigger>
                    <TabsTrigger value="learning">Learning-related</TabsTrigger>
                    <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>

                <TabsContent value="system">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>System Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="flex justify-center p-6">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600" />
                                </div>
                            ) : isError ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="h-12 w-12 text-red-500 mb-4" />
                                    <p className="text-lg font-medium">
                                        Failed to load notifications
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Please try again later.
                                    </p>
                                </div>
                            ) : systemNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">No system notifications</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        You have not sent any system notifications yet.
                                    </p>
                                </div>
                            ) : (
                                renderTable(systemNotifications)
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="learning">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>Learning-related Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {learningNotifications.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No learning-related notifications have been sent from the admin
                                    account.
                                </p>
                            ) : (
                                renderTable(learningNotifications)
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="all">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle>All Notifications</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {filteredNotifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                                    <p className="text-lg font-medium">
                                        No notifications found
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {searchQuery
                                            ? "Try a different search term"
                                            : "You have not sent any notifications yet."}
                                    </p>
                                </div>
                            ) : (
                                renderTable(filteredNotifications)
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <AdminNewNotificationDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
            />
        </div>
    );
};

export default AdminNotifications;
