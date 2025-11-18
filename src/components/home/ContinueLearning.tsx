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
        enabled: hasToken, // ensures API is called after login
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

                // Derive percent:
                // 1) Prefer backend 'percent' if present
                // 2) Fallback to positionSec/durationSec if needed
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
            // ✅ Only show lessons:
            // - with some progress (percent > 0)
            // - and not completed (percent < 98 and !completed)
            .filter((row) => row.isStarted && !row.isCompleted)
            // Show those closest to completion first
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
        // ✅ Use the correct route: /student/lesson/:id
        navigate(`/student/lesson/${lessonId}`);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-happy-700">
                        Continue Learning
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Lessons you&apos;ve started but not finished yet.
                    </p>
                </div>
            </div>

            {anyLoading ? (
                <div className="flex justify-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-happy-600" />
                </div>
            ) : anyError ? (
                <p className="text-sm text-red-600">
                    Could not load your lessons right now.
                </p>
            ) : !user ? (
                <p className="text-sm text-muted-foreground">
                    Login as a student to see your lessons.
                </p>
            ) : !uncompletedLessons.length ? (
                <p className="text-sm text-muted-foreground">
                    Great job! There are no uncompleted lessons right now.
                </p>
            ) : (
                <div className="relative">
                    {/* Left/right buttons (desktop) */}
                    {uncompletedLessons.length > 2 && (
                        <>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-sm bg-white/90"
                                onClick={() => scrollBy(-280)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full shadow-sm bg-white/90"
                                onClick={() => scrollBy(280)}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </>
                    )}

                    {/* Scrollable row */}
                    <div
                        ref={scrollRef}
                        className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                    >
                        {uncompletedLessons.map(({ lesson, percent }) => (
                            <div
                                key={lesson._id}
                                className="min-w-[260px] max-w-[280px] flex-shrink-0"
                            >
                                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg line-clamp-2">
                                            {lesson.title}
                                        </CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {lesson.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col gap-2 pb-2">
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="capitalize">
                        {lesson.category} • {lesson.level}
                      </span>
                                            <Badge variant="outline" className="text-[10px] px-2">
                                                {percent}% done
                                            </Badge>
                                        </div>
                                        <Progress value={percent} className="h-1.5" />
                                    </CardContent>
                                    <div className="px-4 pb-4 mt-auto">
                                        <Button
                                            className="w-full"
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
