// src/components/teacher/StudentDetailDialog.tsx
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, FileText, Send } from "lucide-react";
import { toast } from "sonner";
import StudentPerformanceChart from "./StudentPerformanceChart";
import StudentEmotionChart from "./StudentEmotionChart";
import { reportsService } from "@/services/reportsService";
// we only use notificationService for future wiring; currently still mocked
import { notificationService } from "@/services/notificationService";

interface StudentDetailDialogProps {
    student: {
        id: string;
        name: string;
        email: string;
        progress: number;
        lastActive: string;
        completedModules: number;
        totalModules: number;
        attentionScore?: number | null;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

type ProgressDoc = {
    lessonId: string;
    percent?: number;
    completed?: boolean;
    lastPingAt?: string;
};

type SessionDoc = {
    _id: string;
    lessonId: string;
    startedAt: string;
    endedAt?: string | null;
};

// helper to format ms → "Xh Ym"
function formatDuration(ms: number): string {
    if (!ms || ms <= 0) return "0m";
    const totalMinutes = Math.round(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

const StudentDetailDialog = ({
                                 student,
                                 open,
                                 onOpenChange,
                             }: StudentDetailDialogProps) => {
    const [notificationMessage, setNotificationMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ─────────────────────────────────────────────
    // Data: progress + sessions + daily attention
    // ─────────────────────────────────────────────
    const {
        data: progressDocs = [],
        isLoading: isLoadingProgress,
    } = useQuery<ProgressDoc[]>({
        queryKey: ["teacher", "student-progress", student.id],
        queryFn: () => reportsService.progressByUser(student.id),
        enabled: open && !!student?.id,
    });

    const {
        data: sessionDocs = [],
        isLoading: isLoadingSessions,
    } = useQuery<SessionDoc[]>({
        queryKey: ["teacher", "student-sessions", student.id],
        queryFn: () => reportsService.sessionsByUser(student.id),
        enabled: open && !!student?.id,
    });

    const {
        data: dailyAttention = [],
        isLoading: isLoadingDaily,
    } = useQuery<any[]>({
        queryKey: ["teacher", "student-daily", student.id],
        // last 7 days; backend defaults are already sensible but we pass `from`
        queryFn: () =>
            reportsService.learnerDaily(student.id, {
                // just let backend default; you can add from/to if needed
            }),
        enabled: open && !!student?.id,
    });

    // ─────────────────────────────────────────────
    // Derived stats
    // ─────────────────────────────────────────────
    const {
        totalTimeMs,
        avgSessionMs,
        completedModules,
        totalModules,
        avgPercent,
        lastActivityDate,
    } = useMemo(() => {
        // sessions
        let totalMs = 0;
        let lastAct: Date | null = null;

        sessionDocs.forEach((s) => {
            const start = s.startedAt ? new Date(s.startedAt) : null;
            const end = s.endedAt ? new Date(s.endedAt) : null;

            if (start) {
                if (!lastAct || start > lastAct) lastAct = start;
            }

            if (start && end) {
                totalMs += Math.max(0, end.getTime() - start.getTime());
            }
        });

        const avgMs =
            sessionDocs.length > 0 ? totalMs / sessionDocs.length : 0;

        // progress
        const total = progressDocs.length;
        let completed = 0;
        let sumPct = 0;
        progressDocs.forEach((p) => {
            if (p.completed) completed += 1;
            sumPct += p.percent ?? 0;
        });
        const avg =
            total > 0 ? Math.round(sumPct / total) : student.progress ?? 0;

        return {
            totalTimeMs: totalMs,
            avgSessionMs: avgMs,
            completedModules: completed || student.completedModules,
            totalModules: total || student.totalModules,
            avgPercent: avg,
            lastActivityDate:
                lastAct ??
                (student.lastActive ? new Date(student.lastActive) : null),
        };
    }, [sessionDocs, progressDocs, student]);

    // Data for performance chart (simple: each lesson progress)
    const performanceChartData = useMemo(
        () =>
            progressDocs.map((p, idx) => ({
                name: `Module ${idx + 1}`,
                percent: Math.round(p.percent ?? 0),
            })),
        [progressDocs]
    );

    // Data for attention chart
    const emotionChartData = useMemo(
        () =>
            (dailyAttention || []).map((d: any) => ({
                date: d.date,
                avgAttention: d.attention?.avg ?? 0,
                lowPct: d.attention?.lowPct ?? 0,
                medPct: d.attention?.medPct ?? 0,
                highPct: d.attention?.highPct ?? 0,
            })),
        [dailyAttention]
    );

    // ─────────────────────────────────────────────
    // Send notification (still generic, sends to "parents" group)
    // ─────────────────────────────────────────────
    const handleSendNotification = async () => {
        if (!notificationMessage.trim()) {
            toast.error("Please enter a message");
            return;
        }

        setIsSubmitting(true);

        try {
            // For now we send a generic notification to all parents.
            // Later we can narrow this to the specific parent of this student.
            await notificationService.send({
                recipientIds: [], // backend interprets empty as "all" for teachers? if not, adjust later
                recipientRole: "parent",
                type: "general",
                title: `Message about ${student.name}`,
                message: notificationMessage.trim(),
            });

            toast.success(`Notification sent regarding ${student.name}`);
            setNotificationMessage("");
        } catch (error: any) {
            console.error("Failed to send notification", error);
            toast.error("Failed to send notification");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={undefined} />
                            <AvatarFallback className="bg-happy-100 text-happy-700 text-lg">
                                {student.name
                                    .split(" ")
                                    .map((n: string) => n[0])
                                    .join("")}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-xl mb-1">
                                {student.name}
                            </DialogTitle>
                            <p className="text-sm text-muted-foreground">
                                {student.email} • Overall progress: {avgPercent}%
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="contact">Contact</TabsTrigger>
                    </TabsList>

                    {/* OVERVIEW TAB */}
                    <TabsContent value="overview" className="space-y-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">
                                        Learning Stats
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total time spent
                      </span>
                                            <span className="font-medium">
                        {isLoadingSessions
                            ? "Loading..."
                            : formatDuration(totalTimeMs)}
                      </span>
                                        </div>
                                        <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Average session length
                      </span>
                                            <span className="font-medium">
                        {isLoadingSessions
                            ? "Loading..."
                            : formatDuration(avgSessionMs)}
                      </span>
                                        </div>
                                        <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Modules completed
                      </span>
                                            <span className="font-medium">
                        {completedModules}/{totalModules}
                      </span>
                                        </div>
                                        <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Average quiz score
                      </span>
                                            <span className="font-medium">
                        {/* quiz analytics not wired yet */}
                                                N/A
                      </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base">
                                        Recent Activity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="border-l-2 border-happy-200 pl-4 py-1">
                                            <div className="flex items-center text-sm">
                                                <Calendar className="h-3.5 w-3.5 mr-1 text-happy-500" />
                                                <span className="text-muted-foreground mr-2">
                          {lastActivityDate
                              ? lastActivityDate.toLocaleDateString()
                              : "—"}
                        </span>
                                                <Clock className="h-3.5 w-3.5 mr-1 ml-2 text-happy-500" />
                                                <span className="text-muted-foreground">
                          {lastActivityDate
                              ? lastActivityDate.toLocaleTimeString()
                              : "—"}
                        </span>
                                            </div>
                                            <p className="font-medium mt-1">
                                                Most recent learning session
                                            </p>
                                        </div>

                                        {/* You can add more activity items later using sessions/progress */}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    Attention Level Trend
                                </CardTitle>
                                <CardDescription>
                                    Last few days of attention tracking
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <StudentEmotionChart
                                    data={emotionChartData}
                                    loading={isLoadingDaily}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* PERFORMANCE TAB */}
                    <TabsContent value="performance" className="space-y-4 pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Module Performance</CardTitle>
                                <CardDescription>
                                    Progress across different learning modules
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-2">
                                <StudentPerformanceChart
                                    data={performanceChartData}
                                    loading={isLoadingProgress}
                                />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Quiz Results</CardTitle>
                                <CardDescription>
                                    (To be wired when quiz analytics endpoint is ready)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground">
                                    Quiz analytics are not connected yet. Once we have a
                                    quiz attempts API for teachers, we can render the last
                                    few quiz scores here.
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* CONTACT TAB */}
                    <TabsContent value="contact" className="space-y-4 pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Send Notification</CardTitle>
                                <CardDescription>
                                    Send a notification to the parent(s) about this
                                    student's learning.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <Textarea
                                        placeholder="Type your message here..."
                                        className="min-h-32 resize-none"
                                        value={notificationMessage}
                                        onChange={(e) =>
                                            setNotificationMessage(e.target.value)
                                        }
                                    />
                                    <div className="flex justify-end">
                                        <Button
                                            disabled={isSubmitting}
                                            onClick={handleSendNotification}
                                        >
                                            {isSubmitting ? "Sending..." : "Send Notification"}
                                            <Send className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Contact Information</CardTitle>
                                <CardDescription>
                                    Parent/guardian contact details will be wired when we
                                    add a teacher-facing parent lookup endpoint.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Parent/Guardian:
                                        </p>
                                        <p>Not connected yet</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Email:
                                        </p>
                                        <p>—</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Phone:
                                        </p>
                                        <p>—</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default StudentDetailDialog;
