// src/pages/teacher/TeacherDashboard.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import TeacherModules from "@/components/teacher/TeacherModules";
import TeacherStudents from "@/components/teacher/TeacherStudents";
import TeacherAnalytics from "@/components/teacher/TeacherAnalytics";
import TeacherNotifications from "@/components/teacher/TeacherNotifications";
import TeacherReportsPanel from "@/components/teacher/TeacherReportsPanel";
import { useAuth } from "@/contexts/AuthContext";
import TeacherQuizzes from "@/components/teacher/TeacherQuizzes";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
    notificationService,
    NotificationDto,
} from "@/services/notificationService";
import TeacherMicroBreakManager from "@/components/teacher/TeacherMicroBreakManager";

const TeacherDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState("modules");

    const { data: receivedNotifications = [] } = useQuery<NotificationDto[]>({
        queryKey: ["notifications", "received", "teacher"],
        queryFn: notificationService.getReceived,
        enabled: user?.role === "teacher",
    });

    const unreadNotifications = receivedNotifications.filter(
        (n) => !n.isRead
    ).length;

    if (user?.role !== "teacher") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
                <p className="mt-2">You need teacher access to view this page.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} />

            <main className="container px-4 py-6 max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Teacher Dashboard
                    </h1>
                </div>

                <Tabs
                    defaultValue="modules"
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="space-y-6"
                >
                    <TabsList className="grid w-full grid-cols-7 rounded-lg bg-happy-50">
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="modules">Learning Modules</TabsTrigger>
                        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="reports">Reports</TabsTrigger>
                        <TabsTrigger
                            value="notifications"
                            className="flex items-center gap-2"
                        >
                            <span>Notifications</span>
                            {unreadNotifications > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 rounded-full px-2 py-0 text-xs bg-happy-100 text-happy-800"
                                >
                                    {unreadNotifications}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="micro-breaks">Micro-Breaks</TabsTrigger>
                    </TabsList>


                    <TabsContent value="modules" className="space-y-6">
                        <TeacherModules />
                    </TabsContent>

                    <TabsContent value="students" className="space-y-6">
                        <TeacherStudents />
                    </TabsContent>

                    <TabsContent value="micro-breaks" className="space-y-6">
                        <TeacherMicroBreakManager />
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        <TeacherAnalytics />
                    </TabsContent>

                    <TabsContent value="notifications" className="space-y-6">
                        <TeacherNotifications />
                    </TabsContent>

                    <TabsContent value="reports" className="space-y-6">
                        <TeacherReportsPanel />
                    </TabsContent>

                    <TabsContent value="quizzes" className="space-y-6">
                        <TeacherQuizzes />
                    </TabsContent>

                </Tabs>
            </main>
        </div>
    );
};

export default TeacherDashboard;
