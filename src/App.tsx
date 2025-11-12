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
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import About from "./pages/About";
import AuthCallback from "./pages/AuthCallback";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleLanding from "@/components/RoleLanding";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Teacher Routes
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherModules from "./pages/teacher/Modules";
import TeacherAnalytics from "./pages/teacher/Analytics";
import TeacherNotifications from "./pages/teacher/Notifications";
import TeacherStudents from "./pages/teacher/Students";
import TeacherReportsPage from '@/pages/teacher/Reports';

// Parent Routes
import ParentDashboard from "./pages/parent/Dashboard";
import ParentProgress from "./pages/parent/Progress";
import ParentResources from "./pages/parent/Resources";
import ParentNotifications from "./pages/parent/Notifications";

// Student Routes
import StudentResources from "./pages/student/Resources";
import StudentLessonPlayer from "./pages/student/StudentLessonPlayer";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected Common Routes */}
              <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  }
              />

              {/* Student Routes */}
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
              {/* ✅ NEW Student lesson route */}
              <Route
                  path="/student/lesson/:id"
                  element={
                    <ProtectedRoute allowedRoles={["student"]}>
                      <StudentLessonPlayer />
                    </ProtectedRoute>
                  }
              />

              {/* Teacher Routes */}
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

              {/* Parent Routes */}
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

                <Route
                    path="/teacher/reports"
                    element={
                    <TeacherReportsPage />
                }
                />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />

                
                      {/* Protected: role landing (auto-redirects by role) */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <RoleLanding />
                          </ProtectedRoute>
                        }
                      />

                      {/* Keep your existing root index protected if desired */}
                      <Route
                        path="/"
                        element={
                          <ProtectedRoute>
                            <Index />
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

              {/* Catch all route - 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
);

export default App;
