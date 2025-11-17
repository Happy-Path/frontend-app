// src/components/teacher/StudentPerformanceChart.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { reportsService } from "@/services/reportsService";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type Lesson = {
  _id: string;
  title: string;
  category?: string;
  level?: string;
};

type LessonListResponse = {
  items: Lesson[];
  total: number;
  page: number;
  pages: number;
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

interface Props {
  studentId: string;
}

export default function StudentPerformanceChart({ studentId }: Props) {
  // ----- Fetch all lessons (for titles) -----
  const {
    data: lessonsResp,
    isLoading: lessonsLoading,
    isError: lessonsError,
  } = useQuery<LessonListResponse>({
    queryKey: ["all-lessons"],
    queryFn: () => api.get<LessonListResponse>("/lessons"),
  });

  const lessons = lessonsResp?.items ?? [];

  const lessonsById = useMemo(() => {
    const map: Record<string, Lesson> = {};
    lessons.forEach((l) => {
      map[l._id] = l;
    });
    return map;
  }, [lessons]);

  // ----- Fetch progress for this student -----
  const {
    data: progress = [],
    isLoading: progressLoading,
    isError: progressError,
  } = useQuery<ProgressRow[]>({
    queryKey: ["student-performance", studentId],
    queryFn: () => reportsService.progressByUser(studentId),
    enabled: !!studentId,
  });

  // ----- Build chart rows: one per lesson with readable title -----
  const rows = useMemo(
      () =>
          (progress || []).map((p) => {
            const lesson = lessonsById[p.lessonId];
            const title = lesson?.title || "Lesson";
            const pct = Math.round(p.percent ?? 0);

            return {
              lessonId: p.lessonId,
              title,
              percent: Math.min(100, Math.max(0, pct)),
            };
          }),
      [progress, lessonsById]
  );

  // ----- UI states -----
  if (!studentId) {
    return (
        <p className="text-sm text-muted-foreground">
          Select a child to view module performance.
        </p>
    );
  }

  if (lessonsLoading || progressLoading) {
    return (
        <div className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-happy-600" />
        </div>
    );
  }

  if (lessonsError || progressError) {
    return (
        <p className="text-sm text-red-600">
          Failed to load module performance data.
        </p>
    );
  }

  if (!rows.length) {
    return (
        <p className="text-sm text-muted-foreground">
          No lessons have been started yet for this child.
        </p>
    );
  }

  // ----- Chart -----
  return (
      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
              data={rows}
              margin={{ top: 8, right: 16, bottom: 24, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
                dataKey="title"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-15}
                textAnchor="end"
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: number) => `${v}%`} />

            {/* ⭐ KEEP COLORS HERE */}
            <Bar
                dataKey="percent"
                name="Completion %"
                fill="#38BDF8"
                radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
  );
}
