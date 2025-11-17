// src/components/home/ContinueLearning.tsx
import React, { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { api } from "@/services/api";
import { reportsService } from "@/services/reportsService";

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
    percent?: number;
    completed?: boolean;
    durationSec?: number;
    positionSec?: number;
    lastPingAt?: string;
};

const ContinueLearning: React.FC = () => {
    const { user } = useAuth();
    const scrollRef = useRef<HTMLDivElement | null>(null);

    // --- Load lessons (we only care about published) ---
    const {
        data: lessonsResp,
        isLoading: lessonsLoading,
        isError: lessonsError,
    } = useQuery<LessonListResponse>({
        queryKey: ["continue-lessons"],
        queryFn: () => api.get<LessonListResponse>("/lessons?status=published"),
    });

    const lessons = lessonsResp?.items ?? [];

    // --- Load progress for the current student ---
    const {
        data: progressRows = [],
        isLoading: progressLoading,
        isError: progressError,
    } = useQuery<ProgressRow[]>({
        queryKey: ["continue-progress", user?.id],
        queryFn: () => {
            if (!user?.id) return Promise.resolve([] as ProgressRow[]);
            return reportsService.progressByUser(user.id);
        },
        enabled: !!user?.id,
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

    // Decide which lessons are "uncompleted"
    const uncompletedLessons = useMemo(() => {
        if (!lessons.length) return [];

        return lessons
            .map((lesson) => {
                const prog = progressByLessonId[lesson._id];
                const pct = Math.round(prog?.percent ?? 0);

                const isCompleted = prog ? pct >= 100 || prog.completed === true : false;

                return {
                    lesson,
                    progress: prog,
                    percent: Math.min(100, Math.max(0, pct)),
                    isCompleted,
                };
            })
            .filter((row) => !row.isCompleted) // only not completed
            // Optional: show ones closest to completion first
            .sort((a, b) => b.percent - a.percent);
    }, [lessons, progressByLessonId]);

    const anyLoading = lessonsLoading || progressLoading;
    const anyError = lessonsError || progressError;

    // --- Carousel scroll handlers ---
    const scrollBy = (delta: number) => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({ left: delta, behavior: "smooth" });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-happy-700">
                        Continue Learning
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Lessons you&apos;ve started or not finished yet.
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
                                        <Button asChild className="w-full" size="sm">
                                            <Link to={`/lessons/${lesson._id}`}>Continue</Link>
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
