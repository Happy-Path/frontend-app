// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import ModuleDetail from "./pages/ModuleDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AuthCallback from "./pages/AuthCallback";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import RoleLanding from "@/components/RoleLanding";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import MessagesPage from "./pages/MessagesPage";

// Teacher
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherModules from "./pages/teacher/Modules";
import TeacherAnalytics from "./pages/teacher/Analytics";
import TeacherNotifications from "./pages/teacher/Notifications";
import TeacherStudents from "./pages/teacher/Students";
import TeacherReportsPage from "@/pages/teacher/Reports";

// Parent
import ParentDashboard from "./pages/parent/Dashboard";
import ParentProgress from "./pages/parent/Progress";
import ParentResources from "./pages/parent/Resources";
import ParentNotifications from "./pages/parent/Notifications";

// Student
import StudentResources from "./pages/student/Resources";
import StudentLessonPlayer from "./pages/student/StudentLessonPlayer";
import StudentLessonQuiz from "./pages/student/StudentLessonQuiz";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        {/* Public */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Common protected */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Index />
                                </ProtectedRoute>
                            }
                        />
                        {/* Auto-redirect to role dashboard */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <RoleLanding />
                                </ProtectedRoute>
                            }
                        />
                        {/* Messages (any logged-in role) */}
                        <Route
                            path="/messages"
                            element={
                                <ProtectedRoute>
                                    <MessagesPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Admin */}
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />

                        {/* Teacher */}
                        <Route
                            path="/teacher/*"
                            element={
                                <ProtectedRoute allowedRoles={["teacher"]}>
                                    <TeacherDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher/modules"
                            element={
                                <ProtectedRoute allowedRoles={["teacher"]}>
                                    <TeacherModules />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher/analytics"
                            element={
                                <ProtectedRoute allowedRoles={["teacher"]}>
                                    <TeacherAnalytics />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher/notifications"
                            element={
                                <ProtectedRoute allowedRoles={["teacher"]}>
                                    <TeacherNotifications />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher/students"
                            element={
                                <ProtectedRoute allowedRoles={["teacher"]}>
                                    <TeacherStudents />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/teacher/reports"
                            element={
                                <ProtectedRoute allowedRoles={["teacher"]}>
                                    <TeacherReportsPage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Parent */}
                        <Route
                            path="/parent/*"
                            element={
                                <ProtectedRoute allowedRoles={["parent"]}>
                                    <ParentDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/parent/progress"
                            element={
                                <ProtectedRoute allowedRoles={["parent"]}>
                                    <ParentProgress />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/parent/resources"
                            element={
                                <ProtectedRoute allowedRoles={["parent"]}>
                                    <ParentResources />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/parent/notifications"
                            element={
                                <ProtectedRoute allowedRoles={["parent"]}>
                                    <ParentNotifications />
                                </ProtectedRoute>
                            }
                        />

                        {/* Student */}
                        <Route
                            path="/student/resources"
                            element={
                                <ProtectedRoute allowedRoles={["student"]}>
                                    <StudentResources />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/modules/:moduleId"
                            element={
                                <ProtectedRoute allowedRoles={["student"]}>
                                    <ModuleDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/student/lesson/:id"
                            element={
                                <ProtectedRoute allowedRoles={["student"]}>
                                    <StudentLessonPlayer />
                                </ProtectedRoute>
                            }
                        />
                        {/* NEW: Student lesson quiz route */}
                        <Route
                            path="/student/lesson/:lessonId/quiz"
                            element={
                                <ProtectedRoute allowedRoles={["student"]}>
                                    <StudentLessonQuiz />
                                </ProtectedRoute>
                            }
                        />

                        {/* 404 */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </TooltipProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
