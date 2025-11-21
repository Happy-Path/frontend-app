// src/components/parent/ParentProgress.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress as ProgressBar } from "@/components/ui/progress";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Check,
    X,
    Clock,
    Calendar,
    FileText,
    CheckCircle2,
    AlertTriangle,
} from "lucide-react";
import { reportsService } from "@/services/reportsService";
import {
    parentService,
    ParentChildSummary,
    ParentQuizResult,
} from "@/services/parentService";
import { api } from "@/services/api";

// --- Local types -----------------------------

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

type Lesson = {
    _id: string;
    title: string;
    category: string;
    level: string;
};

type ModuleView = {
    lessonId: string;
    title: string;
    progressPct: number;
    statusLabel: "Not started" | "In progress" | "Completed";
    category: string;
};

// --- Helpers ---------------------------------

const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
};

const getStatusBadgeClasses = (status: ModuleView["statusLabel"]) => {
    if (status === "Completed") {
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (status === "In progress") {
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-gray-50 text-gray-600 border-gray-200";
};

// Reusable green/ash progress bar
const GreenProgressBar = ({ value }: { value: number }) => (
    <ProgressBar
        value={value}
        className="h-1.5 bg-gray-200 [&>div]:bg-emerald-500 rounded-full"
    />
);

// ---------------------------------------------
// Component
// ---------------------------------------------

const ParentProgress = () => {
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string>("all");

    // 1) Children assigned to this parent
    const {
        data: children = [],
        isLoading: childrenLoading,
        isError: childrenError,
    } = useQuery<ParentChildSummary[]>({
        queryKey: ["parent-children"],
        queryFn: parentService.myChildren,
    });

    // Auto-select first child once list is loaded
    useEffect(() => {
        if (!selectedChildId && children.length > 0) {
            setSelectedChildId(children[0].studentId);
        }
    }, [children, selectedChildId]);

    const activeChild = useMemo(
        () => children.find((c) => c.studentId === selectedChildId) || null,
        [children, selectedChildId]
    );

    // 2) Progress for selected child
    const {
        data: progress = [],
        isLoading: progressLoading,
        isError: progressError,
    } = useQuery<ProgressRow[]>({
        queryKey: ["parent-child-progress", selectedChildId],
        queryFn: () => reportsService.progressByUser(selectedChildId as string),
        enabled: !!selectedChildId,
    });

    // 3) All lessons (to resolve lessonId → title/category)
    const {
        data: lessonResponse,
        isLoading: lessonsLoading,
        isError: lessonsError,
    } = useQuery<{ items: Lesson[] }>({
        queryKey: ["all-lessons"],
        queryFn: () => api.get<{ items: Lesson[] }>("/lessons"),
    });

    const lessons: Lesson[] = lessonResponse?.items ?? [];

    const lessonMap = useMemo(() => {
        const map: Record<string, Lesson> = {};
        lessons.forEach((l) => {
            map[l._id] = l;
        });
        return map;
    }, [lessons]);

    // 4) Quiz results for selected child
    const {
        data: quizResults = [],
        isLoading: quizLoading,
        isError: quizError,
    } = useQuery<ParentQuizResult[]>({
        queryKey: ["parent-child-quiz-results", selectedChildId],
        queryFn: () => parentService.childQuizResults(selectedChildId as string),
        enabled: !!selectedChildId,
    });

    // 5) Build module view from progress + lessons
    const modules: ModuleView[] = useMemo(() => {
        const rows = progress as ProgressRow[];
        if (!rows?.length) return [];

        return rows.map((p) => {
            const pct = Math.round(p.percent ?? 0);
            let statusLabel: ModuleView["statusLabel"] = "Not started";
            if (p.completed) statusLabel = "Completed";
            else if (pct > 0) statusLabel = "In progress";

            const lesson = lessonMap[p.lessonId];

            return {
                lessonId: p.lessonId,
                title: lesson?.title || "Lesson",
                category: lesson?.category || "Lesson",
                progressPct: pct,
                statusLabel,
            };
        });
    }, [progress, lessonMap]);

    // Aggregate for header chips
    const totalModules = modules.length;
    const completedModules = modules.filter(
        (m) => m.statusLabel === "Completed"
    ).length;

    // Module filter for quiz results (by lessonId)
    const filteredResults =
        selectedModule === "all"
            ? quizResults
            : quizResults.filter((r) => r.moduleId === selectedModule);

    // ------------------ Guards / top-level states ------------------

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
                            We couldn&apos;t load your child profiles. Please try again or
                            contact the administrator.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (!childrenLoading && children.length === 0) {
        return (
            <div className="p-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Learning Progress</CardTitle>
                        <CardDescription>
                            No children are linked to your account yet. Please contact the
                            school or administrator.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    // ------------------ UI ------------------

    return (
        <div className="space-y-6">
            {/* Header: child + module filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Learning Progress
                        </h2>
                        {activeChild && (
                            <span className="inline-flex items-center rounded-full bg-happy-50 px-3 py-1 text-xs font-medium text-happy-800">
                Child: <span className="ml-1 font-semibold">{activeChild.name}</span>
              </span>
                        )}
                    </div>
                    {totalModules > 0 && (
                        <p className="text-xs text-muted-foreground">
                            {completedModules} of {totalModules} modules completed
                        </p>
                    )}
                </div>

                <div className="flex gap-2 flex-wrap">
                    {/* Child selector */}
                    <Select
                        value={selectedChildId ?? undefined}
                        onValueChange={(v) => {
                            setSelectedChildId(v || null);
                            setSelectedModule("all");
                        }}
                    >
                        <SelectTrigger className="w-[200px] bg-white">
                            <SelectValue placeholder="Select child" />
                        </SelectTrigger>
                        <SelectContent>
                            {children.map((c) => (
                                <SelectItem key={c.studentId} value={c.studentId}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Module filter (uses actual lesson titles) */}
                    <Select value={selectedModule} onValueChange={setSelectedModule}>
                        <SelectTrigger className="w-[220px] bg-white">
                            <SelectValue placeholder="Filter by module" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Modules</SelectItem>
                            {modules.map((m) => (
                                <SelectItem key={m.lessonId} value={m.lessonId}>
                                    {m.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* MODULES OVERVIEW (scrollable, modernized) */}
                <Card className="flex flex-col shadow-sm border border-gray-100 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            Modules Overview
                        </CardTitle>
                        <CardDescription className="text-xs">
                            Track how far your child has gone in each lesson.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto max-h-[420px] pr-2">
                        {(progressLoading || lessonsLoading) && (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-happy-600" />
                            </div>
                        )}

                        {!progressLoading && !lessonsLoading && modules.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                                No lessons attempted yet for this child.
                            </p>
                        )}

                        {!progressLoading && !lessonsLoading && modules.length > 0 && (
                            <div className="space-y-4">
                                {modules.map((module) => (
                                    <div
                                        key={module.lessonId}
                                        className="space-y-2 pb-3 border-b last:border-0"
                                    >
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {module.title}
                        </span>
                                                <span className="text-[11px] text-muted-foreground">
                          {module.category}
                        </span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`text-[11px] px-2 py-0.5 border ${getStatusBadgeClasses(
                                                    module.statusLabel
                                                )}`}
                                            >
                                                {module.statusLabel}
                                            </Badge>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center text-[11px] text-muted-foreground mb-1">
                                                <span>Progress</span>
                                                <span className="font-medium">
                          {module.progressPct}%
                        </span>
                                            </div>
                                            <GreenProgressBar value={module.progressPct} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {(progressError || lessonsError) && (
                            <p className="mt-2 text-xs text-red-600">
                                Failed to load progress or lesson data.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* QUIZ RESULTS (scrollable, modernized) */}
                <Card className="md:col-span-2 flex flex-col shadow-sm border border-gray-100 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-happy-700" />
                            <span>Quiz Results</span>
                        </CardTitle>
                        <CardDescription>
                            Recent quiz performance for the selected child.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <Tabs
                            defaultValue="list"
                            className="flex-1 flex flex-col space-y-4"
                        >
                            <TabsList className="w-fit bg-happy-50/60">
                                <TabsTrigger value="list">List View</TabsTrigger>
                                <TabsTrigger value="detail">Detailed View</TabsTrigger>
                            </TabsList>

                            {/* LIST VIEW */}
                            <TabsContent
                                value="list"
                                className="flex-1 overflow-y-auto max-h-[420px]"
                            >
                                {quizLoading ? (
                                    <div className="flex justify-center p-6">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-happy-600" />
                                    </div>
                                ) : quizError ? (
                                    <div className="text-center py-6">
                                        <p className="text-red-600 text-sm">
                                            Failed to load quiz results.
                                        </p>
                                    </div>
                                ) : filteredResults.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-muted-foreground">
                                            No quiz results found for this module.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pr-1">
                                        {filteredResults.map((result) => (
                                            <div
                                                key={result.id}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow"
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="rounded-full bg-happy-100 p-2">
                                                        <FileText className="h-5 w-5 text-happy-700" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-sm">
                                                            {result.moduleName || "Quiz"}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {new Date(result.date).toLocaleDateString()}
                              </span>
                                                            {result.timeSpent != null && (
                                                                <span className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                                                    {result.timeSpent} mins
                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div
                                                        className={`text-xl font-bold ${getScoreColor(
                                                            result.score
                                                        )}`}
                                                    >
                                                        {result.score}%
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {result.correctAnswers}/{result.totalQuestions}{" "}
                                                        correct
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* DETAIL VIEW */}
                            <TabsContent
                                value="detail"
                                className="flex-1 overflow-y-auto max-h-[420px]"
                            >
                                {quizLoading ? (
                                    <div className="flex justify-center p-6">
                                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-happy-600" />
                                    </div>
                                ) : quizError ? (
                                    <div className="text-center py-6">
                                        <p className="text-red-600 text-sm">
                                            Failed to load quiz results.
                                        </p>
                                    </div>
                                ) : filteredResults.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-muted-foreground">
                                            No quiz results found for this module.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6 pr-1">
                                        {filteredResults.map((result) => (
                                            <Card
                                                key={result.id}
                                                className="border border-gray-100 shadow-sm"
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div>
                                                            <CardTitle className="text-base">
                                                                {result.moduleName || "Quiz"}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                Taken on{" "}
                                                                {new Date(result.date).toLocaleDateString()}
                                                            </CardDescription>
                                                        </div>
                                                        <div
                                                            className={`text-xl font-bold ${getScoreColor(
                                                                result.score
                                                            )}`}
                                                        >
                                                            {result.score}%
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {result.questions.map((question) => (
                                                            <div
                                                                key={question.id}
                                                                className="flex items-start gap-2 border-b pb-3 last:border-0"
                                                            >
                                                                {question.correct ? (
                                                                    <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                                                ) : (
                                                                    <X className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                                                )}
                                                                <div>
                                                                    <p className="font-medium text-sm">
                                                                        {question.question}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        Answer: {question.answer}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ParentProgress;
