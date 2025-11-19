// src/pages/parent/Dashboard.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import ParentStudentOverview from "@/components/parent/ParentStudentOverview";
import ParentProgress from "@/components/parent/ParentProgress";
import ParentResources from "@/components/parent/ParentResources";
import ParentNotifications from "@/components/parent/ParentNotifications";
import ParentReports from "@/components/parent/ParentReports";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
    notificationService,
    NotificationDto,
} from "@/services/notificationService";

const ParentDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("overview");

    const { data: notifications = [] } = useQuery<NotificationDto[]>({
        queryKey: ["notifications", "received", "parent"],
        queryFn: notificationService.getReceived,
        enabled: user?.role === "parent",
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Access guard
    if (user?.role !== "parent") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
                <p className="mt-2">You need parent access to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} />

            <main className="container px-4 py-6 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Parent Dashboard
                    </h1>
                </div>

                <Tabs
                    defaultValue="overview"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-5 rounded-lg bg-happy-50">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                        <TabsTrigger value="resources">Learning Resources</TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex items-center gap-2"
                        >
                            <span>Notifications</span>
                            {unreadCount > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 rounded-full px-2 py-0 text-xs bg-happy-100 text-happy-800"
                                >
                                    {unreadCount}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <ParentStudentOverview />
                    </TabsContent>

                    <TabsContent value="progress" className="space-y-6">
                        <ParentProgress />
                    </TabsContent>

                    <TabsContent value="resources" className="space-y-6">
                        <ParentResources />
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <ParentNotifications />
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-6">
                        <ParentReports />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default ParentDashboard;
