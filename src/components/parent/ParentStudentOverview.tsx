// src/components/parent/ParentStudentOverview.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Brain, Calendar, Clock, Heart } from "lucide-react";
import { parentService } from "@/services/parentService";
import { progressService } from "@/services/progressService";
import { reportsService } from "@/services/reportsService";
import StudentPerformanceChart from "../teacher/StudentPerformanceChart";
import StudentEmotionChart from "../teacher/StudentEmotionChart";

type ParentChild = {
  id: string;        // assignment id
  studentId: string; // child user id
  name: string;
  email: string;
};

type DailyRow = {
  date: string;
  attention?: {
    avg?: number;
    min?: number;
    max?: number;
    samples?: number;
    lowPct?: number;
    medPct?: number;
    highPct?: number;
  };
  emotions?: Record<string, number>;
};

type SessionRow = {
  _id: string;
  userId: string;
  lessonId?: string;
  startedAt: string;
  endedAt?: string;
};

type ProgressRow = {
  _id?: string;
  userId: string;
  lessonId: string;
  percent?: number;
  completed?: boolean;
  durationSec?: number;
  positionSec?: number;
  lastPingAt?: string;
};

const getAttentionLabel = (score: number) => {
  if (score >= 0.8) return { label: "Excellent", color: "text-green-600" };
  if (score >= 0.6) return { label: "Good", color: "text-amber-600" };
  if (score > 0) return { label: "Needs improvement", color: "text-red-600" };
  return { label: "Not enough data yet", color: "text-gray-500" };
};

const ParentStudentOverview = () => {
  const [selectedChildId, setSelectedChildId] =
      useState<string | null>(null);

  // 1) Fetch children for this parent
  const {
    data: children = [],
    isLoading: childrenLoading,
    isError: childrenError,
  } = useQuery({
    queryKey: ["parent-children"],
    queryFn: parentService.myChildren,
  });

  // Auto-select first child when list is ready
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].studentId);
    }
  }, [children, selectedChildId]);

  const activeChild: ParentChild | undefined = useMemo(
      () =>
          children.find((c: ParentChild) => c.studentId === selectedChildId),
      [children, selectedChildId]
  );

  // 2) Progress for selected child
  const {
    data: progress = [],
    isLoading: progressLoading,
  } = useQuery({
    queryKey: ["parent-child-progress", selectedChildId],
    queryFn: () =>
        progressService.getUserProgress(selectedChildId as string),
    enabled: !!selectedChildId,
  });

  // 3) Sessions for selected child
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
  } = useQuery({
    queryKey: ["parent-child-sessions", selectedChildId],
    queryFn: () =>
        reportsService.sessionsByUser(selectedChildId as string),
    enabled: !!selectedChildId,
  });

  // 4) Daily attention/emotions for last 7 days
  const {
    data: daily = [],
    isLoading: dailyLoading,
  } = useQuery({
    queryKey: ["parent-child-daily", selectedChildId],
    queryFn: async () => {
      const today = new Date();
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - 6);
      const from = fromDate.toISOString().slice(0, 10);
      const to = today.toISOString().slice(0, 10);
      return reportsService.learnerDaily(selectedChildId as string, {
        from,
        to,
        timezone: "+05:30",
      });
    },
    enabled: !!selectedChildId,
  });

  // ---- Derive overview metrics ----
  const overview = useMemo(() => {
    if (!activeChild) return null;

    const progressRows = progress as ProgressRow[];
    const dailyRows = daily as DailyRow[];
    const sessionRows = sessions as SessionRow[];

    const totalModules = progressRows.length;
    const totalModulesCompleted = progressRows.filter(
        (p) => p.completed
    ).length;
    const overallProgress = totalModules
        ? Math.round(
            progressRows.reduce(
                (sum, p) => sum + (p.percent ?? 0),
                0
            ) / totalModules
        )
        : 0;

    // Average attention from daily rollups
    let attentionScore = 0;
    if (dailyRows.length > 0) {
      const values = dailyRows
          .map((d) => d.attention?.avg ?? 0)
          .filter((n) => typeof n === "number" && !Number.isNaN(n));
      if (values.length > 0) {
        attentionScore =
            values.reduce((a, b) => a + b, 0) / values.length;
      }
    }

    // Latest session
    let lastSessionDate: Date | null = null;
    let lastSessionDurationMin: number | null = null;
    if (sessionRows.length > 0) {
      // sessions route already sorts by startedAt desc
      const s = sessionRows[0];
      const started = new Date(s.startedAt);
      lastSessionDate = started;
      if (s.endedAt) {
        const ended = new Date(s.endedAt);
        const diffMs = ended.getTime() - started.getTime();
        if (diffMs > 0) {
          lastSessionDurationMin = Math.round(diffMs / 60000);
        }
      }
    }

    // Soft suggestions based on stats
    const strengths: string[] = [];
    const areasToImprove: string[] = [];

    if (totalModulesCompleted > 0) {
      strengths.push("Completes learning modules regularly");
    }
    if (overallProgress >= 60) {
      strengths.push("Good overall lesson progress");
    }
    if (attentionScore >= 0.7) {
      strengths.push("Maintains attention during lessons");
    }
    if (strengths.length === 0) {
      strengths.push("Building early learning habits");
    }

    if (overallProgress < 70 && totalModules > 0) {
      areasToImprove.push("Increase lesson completion over time");
    }
    if (attentionScore > 0 && attentionScore < 0.6) {
      areasToImprove.push(
          "Support focus with shorter, frequent sessions"
      );
    }
    if (areasToImprove.length === 0) {
      areasToImprove.push(
          "Maintain current routine and celebrate progress"
      );
    }

    // Upcoming activities: can be filled later from a real scheduler;
    // for now, we keep it empty so the UI can show a friendly message.
    const upcomingActivities: { name: string; date: string }[] = [];

    return {
      child: activeChild,
      totalModules,
      totalModulesCompleted,
      overallProgress,
      attentionScore,
      lastSessionDate,
      lastSessionDurationMin,
      strengths,
      areasToImprove,
      upcomingActivities,
    };
  }, [activeChild, progress, daily, sessions]);

  const loading =
      childrenLoading ||
      progressLoading ||
      sessionsLoading ||
      dailyLoading;

  // ---- Render ----

  if (childrenError) {
    return (
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                Error loading children
              </CardTitle>
              <CardDescription className="text-red-700">
                We couldn&apos;t load your child profiles. Please
                try again or contact the administrator.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
    );
  }

  if (childrenLoading && !overview) {
    return (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600"></div>
        </div>
    );
  }

  if (!childrenLoading && children.length === 0) {
    return (
        <div className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>No children linked yet</CardTitle>
              <CardDescription>
                Your account does not have any children assigned.
                Please contact the school or administrator to link
                your child to Happy Path.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
    );
  }

  if (!overview) {
    return null;
  }

  const attentionInfo = getAttentionLabel(overview.attentionScore);

  return (
      <div className="space-y-6">
        {/* Top: student selector & overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>Student Overview</CardTitle>
                  <CardDescription>
                    Quick view of your child&apos;s learning journey
                  </CardDescription>
                </div>

                {/* Simple child selector */}
                <div className="hidden md:block">
                  <label className="text-xs text-gray-600">
                    Switch child
                  </label>
                  <select
                      className="mt-1 block rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                      value={overview.child.studentId}
                      onChange={(e) =>
                          setSelectedChildId(e.target.value || null)
                      }
                  >
                    {children.map((c: ParentChild) => (
                        <option
                            key={c.studentId}
                            value={c.studentId}
                        >
                          {c.name}
                        </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarImage src={undefined} />
                    <AvatarFallback className="bg-happy-100 text-happy-700 text-xl">
                      {overview.child.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold">
                    {overview.child.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {overview.child.email}
                  </p>
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">
                      Overall Progress
                    </span>
                      <span className="text-sm font-medium">
                      {overview.overallProgress}%
                    </span>
                    </div>
                    <ProgressBar
                        value={overview.overallProgress}
                        className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-happy-100 p-1.5">
                        <Heart className="h-4 w-4 text-happy-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Modules Completed
                        </p>
                        <p className="text-xl font-bold">
                          {overview.totalModulesCompleted}{" "}
                          <span className="text-sm font-normal text-muted-foreground">
                          of {overview.totalModules}
                        </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-happy-100 p-1.5">
                        <Brain className="h-4 w-4 text-happy-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Attention Level
                        </p>
                        <p className="text-xl font-bold">
                        <span className={attentionInfo.color}>
                          {attentionInfo.label}
                        </span>
                        </p>
                        {overview.attentionScore > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Average score:{" "}
                              {overview.attentionScore.toFixed(2)}
                            </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-happy-100 p-1.5">
                        <Calendar className="h-4 w-4 text-happy-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Last Session
                        </p>
                        <p className="text-base font-medium">
                          {overview.lastSessionDate
                              ? overview.lastSessionDate.toLocaleDateString()
                              : "Not started yet"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <div className="rounded-full bg-happy-100 p-1.5">
                        <Clock className="h-4 w-4 text-happy-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Session Duration
                        </p>
                        <p className="text-base font-medium">
                          {overview.lastSessionDurationMin != null
                              ? `${overview.lastSessionDurationMin} minutes`
                              : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {loading && (
                  <p className="mt-4 text-xs text-gray-500">
                    Updating latest stats…
                  </p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming activities (placeholder for future real schedule) */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Activities</CardTitle>
            </CardHeader>
            <CardContent>
              {overview.upcomingActivities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No specific activities scheduled yet. Encourage your
                    child to continue with their next lesson.
                  </p>
              ) : (
                  <div className="space-y-4">
                    {overview.upcomingActivities.map((activity, index) => (
                        <div
                            key={index}
                            className="flex items-start gap-2 pb-2 border-b last:border-0"
                        >
                          <Calendar className="h-4 w-4 mt-0.5 text-happy-500" />
                          <div>
                            <p className="font-medium">{activity.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(activity.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Strengths / Areas to improve */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Learning Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overview.strengths.map((strength, index) => (
                    <Badge
                        key={index}
                        className="mr-2 mb-2 bg-green-100 text-green-800 hover:bg-green-200"
                    >
                      {strength}
                    </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Areas to Improve</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overview.areasToImprove.map((area, index) => (
                    <Badge
                        key={index}
                        className="mr-2 mb-2 bg-amber-100 text-amber-800 hover:bg-amber-200"
                    >
                      {area}
                    </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts for selected child */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Module Performance</CardTitle>
              <CardDescription>Progress across different learning modules</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentPerformanceChart studentId={selectedChildId!} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attention & Emotion Trend</CardTitle>
              <CardDescription>Last 7 days attention tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <StudentEmotionChart studentId={selectedChildId!} />
            </CardContent>
          </Card>
        </div>

      </div>
  );
};

export default ParentStudentOverview;
