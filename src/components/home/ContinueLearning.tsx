// src/components/home/ContinueLearning.tsx
import React, { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { progressService } from "@/services/progressService";

type Lesson = {
    _id: string;
    title: string;
    description: string;
    category: string;
    level: string;
    thumbnail_url?: string;
    status: "draft" | "published";
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
    percent?: number; // 0..100 from backend
    completed?: boolean;
    durationSec?: number;
    positionSec?: number;
    lastPingAt?: string;
};

const ContinueLearning: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // --- Load lessons (published only) ---
    const {
        data: lessonsResp,
        isLoading: lessonsLoading,
        isError: lessonsError,
    } = useQuery<LessonListResponse>({
        queryKey: ["continue-lessons"],
        queryFn: () => api.get<LessonListResponse>("/lessons?status=published"),
    });

    const lessons = lessonsResp?.items ?? [];

    const hasToken =
        typeof window !== "undefined" && !!localStorage.getItem("token");

    // --- Load progress for the current student from /progress/me ---
    const {
        data: progressRows = [],
        isLoading: progressLoading,
        isError: progressError,
    } = useQuery<ProgressRow[]>({
        queryKey: ["continue-progress-me"],
        queryFn: () => progressService.getMyProgress(),
        enabled: hasToken,
    });

    // Index progress by lessonId
    const progressByLessonId = useMemo(() => {
        const map: Record<string, ProgressRow> = {};
        (progressRows || []).forEach((p) => {
            if (!p.lessonId) return;
            map[p.lessonId] = p;
        });
        return map;
    }, [progressRows]);

    // Compute list of "started but not completed" lessons
    const uncompletedLessons = useMemo(() => {
        if (!lessons.length) return [];

        return lessons
            .map((lesson) => {
                const prog = progressByLessonId[lesson._id];

                let rawPercent = 0;

                if (prog && typeof prog.percent === "number") {
                    rawPercent = prog.percent;
                } else if (
                    prog &&
                    typeof prog.positionSec === "number" &&
                    typeof prog.durationSec === "number" &&
                    prog.durationSec > 0
                ) {
                    rawPercent = Math.round(
                        (prog.positionSec / prog.durationSec) * 100
                    );
                }

                const percent = Math.min(100, Math.max(0, Math.round(rawPercent)));

                const isStarted = !!prog && percent > 0;
                const isCompleted = !!prog && (percent >= 98 || prog.completed === true);

                return {
                    lesson,
                    progress: prog,
                    percent,
                    isStarted,
                    isCompleted,
                };
            })
            .filter((row) => row.isStarted && !row.isCompleted)
            .sort((a, b) => b.percent - a.percent);
    }, [lessons, progressByLessonId]);

    const anyLoading = lessonsLoading || progressLoading;
    const anyError = lessonsError || progressError;

    // --- Carousel scroll handlers ---
    const scrollBy = (delta: number) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
    };

    const handleContinueClick = (lessonId: string) => {
        navigate(`/student/lesson/${lessonId}`);
    };

    return (
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Continue Learning
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Lessons you&apos;ve started but not finished yet.
                    </p>
                </div>
            </div>

            {anyLoading ? (
                <div className="flex justify-center py-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-emerald-500" />
                </div>
            ) : anyError ? (
                <Card className="border-rose-100 bg-rose-50">
                    <CardContent className="py-4 text-sm text-rose-700">
                        Could not load your lessons right now. Please try again in a
                        little while.
                    </CardContent>
                </Card>
            ) : !user ? (
                <p className="text-sm text-muted-foreground">
                    Log in as a student to see your lessons.
                </p>
            ) : !uncompletedLessons.length ? (
                <Card className="border-emerald-100 bg-emerald-50/70">
                    <CardContent className="py-4 text-sm text-emerald-800">
                        🎉 Great job! There are no uncompleted lessons right now.
                    </CardContent>
                </Card>
            ) : (
                <div className="relative mt-2">
                    {/* Left/right buttons (desktop) */}
                    {uncompletedLessons.length > 2 && (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute left-0 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 shadow-sm md:flex"
                                onClick={() => scrollBy(-280)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute right-0 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 shadow-sm md:flex"
                                onClick={() => scrollBy(280)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {/* Scrollable row */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto pb-2 pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300"
                    >
                        {uncompletedLessons.map(({ lesson, percent }) => (
                            <div
                                key={lesson._id}
                                className="flex-shrink-0 min-w-[260px] max-w-[280px]"
                            >
                                <Card className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_6px_16px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(15,23,42,0.10)]">
                                    <CardHeader className="pb-2 pt-4">
                                        <CardTitle className="line-clamp-2 text-lg font-semibold text-slate-900">
                                            {lesson.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2 text-xs text-slate-600">
                                            {lesson.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-1 flex-col gap-2 pb-2">
                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="capitalize">
                        {lesson.category} • {lesson.level}
                      </span>
                                            <Badge
                                                variant="outline"
                                                className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700"
                                            >
                                                {percent}% done
                                            </Badge>
                                        </div>

                                        {/* Green progress bar (completed part green, rest ash) */}
                                        <Progress
                                            value={percent}
                                            className="h-2 rounded-full bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500"
                                        />
                                    </CardContent>
                                    <div className="mt-auto px-4 pb-4">
                                        <Button
                                            className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
                                            size="sm"
                                            type="button"
                                            onClick={() => handleContinueClick(lesson._id)}
                                        >
                                            Continue
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContinueLearning;
