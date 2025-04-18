
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import TeacherModules from '@/components/teacher/TeacherModules';
import TeacherStudents from '@/components/teacher/TeacherStudents';
import TeacherAnalytics from '@/components/teacher/TeacherAnalytics';
import TeacherNotifications from '@/components/teacher/TeacherNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("modules");
  
  // Check if user is teacher
  if (user?.role !== 'teacher') {
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
          <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>
        </div>
        
        <Tabs defaultValue="modules" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 rounded-lg bg-happy-50">
            <TabsTrigger value="modules">Learning Modules</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="modules" className="space-y-6">
            <TeacherModules />
          </TabsContent>
          
          <TabsContent value="students" className="space-y-6">
            <TeacherStudents />
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <TeacherAnalytics />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <TeacherNotifications />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TeacherDashboard;
