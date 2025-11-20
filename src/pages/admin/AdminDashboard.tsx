// src/pages/admin/AdminDashboard.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";

// Split tabs
import AdminTabsUsers from "@/components/admin/AdminTabsUsers";
import AdminTabsAnalytics from "@/components/admin/AdminTabsAnalytics";
import AdminTabsReports from "@/components/admin/AdminTabsReports";
import AdminTabsSystem from "@/components/admin/AdminTabsSystem";
import AdminTabsAssignments from "@/components/admin/AdminTabsAssignments";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("users");

  if (user?.role !== "admin") {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-2xl font-semibold text-red-600">
            Access Denied
          </h1>
          <p className="mt-2">You need admin access to view this page.</p>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <main className="container px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              Admin Dashboard
            </h1>
          </div>

          <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-5 rounded-lg bg-happy-50">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="assignments">
                Parent–Student Assignments
              </TabsTrigger>
                <TabsTrigger value="system">System Notifications</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <AdminTabsUsers />
            </TabsContent>

            <TabsContent value="assignments" className="space-y-6">
              <AdminTabsAssignments />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AdminTabsAnalytics />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <AdminTabsReports />
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <AdminTabsSystem />
            </TabsContent>
          </Tabs>
        </main>
      </div>
  );
}
