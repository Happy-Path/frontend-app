// src/components/teacher/TeacherQuizzes.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonService } from "@/services/lessonService";
import { quizService } from "@/services/quizService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizBuilder from "./QuizBuilder";
import { toast } from "sonner";

// Normalize arbitrary API shapes to arrays
function toArray<T = any>(v: any): T[] {
    if (Array.isArray(v)) return v as T[];
    if (Array.isArray(v?.items)) return v.items as T[];
    if (Array.isArray(v?.data)) return v.data as T[];
    if (Array.isArray(v?.results)) return v.results as T[];
    return [];
}

export default function TeacherQuizzes() {
    const qc = useQueryClient();

    // Lessons
    const {
        data: lessonListRaw,
        isLoading: loadingLessons,
        error: lessonsError,
    } = useQuery({ queryKey: ["lessons"], queryFn: lessonService.list });

    const lessonOptions = useMemo(() => {
        const arr = toArray(lessonListRaw);
        return arr
            .map((l: any) => ({
                id: String(l.id ?? l._id ?? l.lessonId ?? ""),
                title: String(l.title ?? l.name ?? l.goal ?? l.id ?? l._id ?? "Untitled Lesson"),
            }))
            .filter((o) => o.id);
    }, [lessonListRaw]);

    // UI state
    const [lessonId, setLessonId] = useState<string>("");
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

    // Default lesson
    useEffect(() => {
        if (!lessonId && lessonOptions.length > 0) {
            setLessonId(lessonOptions[0].id);
        }
    }, [lessonId, lessonOptions]);

    // Quizzes (optionally filtered by lesson)
    const {
        data: quizzesRaw,
        isLoading: loadingQuizzes,
        error: quizzesError,
    } = useQuery({
        queryKey: ["quizzes", lessonId || "all"],
        queryFn: () => quizService.list(lessonId || undefined),
    });

    const quizzes = useMemo(() => toArray(quizzesRaw), [quizzesRaw]);

    // Mutations
    const mToggle = useMutation({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            quizService.setActive(id, isActive),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["quizzes"] });
            toast.success("Quiz status updated");
        },
        onError: () => toast.error("Failed to update status"),
    });

    const mDelete = useMutation({
        mutationFn: (id: string) => quizService.remove(id),
        onSuccess: () => {
            toast.success("Quiz deleted");
            qc.invalidateQueries({ queryKey: ["quizzes"] });
        },
        onError: () => toast.error("Failed to delete quiz"),
    });

    const canBuild = !!lessonId && lessonOptions.length > 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Quizzes</h2>
            </div>

            <Card className="p-4 space-y-4">
                {/* Filters (native controls to avoid portal/hook issues) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">Filter by Lesson</label>
                        <select
                            className="w-full rounded-md border border-gray-300 p-2 text-sm bg-white"
                            value={lessonId}
                            onChange={(e) => setLessonId(e.target.value)}
                        >
                            <option value="">{loadingLessons ? "Loading lessons…" : "All lessons"}</option>
                            {lessonOptions.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.title}
                                </option>
                            ))}
                        </select>
                        {lessonsError && (
                            <div className="text-xs text-red-600 mt-1">Failed to load lessons</div>
                        )}
                    </div>

                    <div className="flex items-end">
                        <Button onClick={() => setEditingQuizId(null)}>Create Quiz</Button>
                    </div>
                </div>

                {/* Quizzes list */}
                <div className="space-y-3 mt-4">
                    {loadingQuizzes && <div className="text-sm text-gray-500">Loading…</div>}
                    {quizzesError && <div className="text-sm text-red-600">Failed to load quizzes.</div>}
                    {!loadingQuizzes && !quizzesError && quizzes.length === 0 && (
                        <div className="text-sm text-gray-600">No quizzes yet.</div>
                    )}

                    {quizzes.map((q: any) => {
                        const id = String(q._id ?? q.id ?? "");
                        if (!id) return null;
                        const title = String(q.title ?? "Untitled Quiz");
                        const lesson = String(q.lessonId ?? "");
                        const questionsCount = Number(q.questionsCount ?? q.questions?.length ?? 0);
                        const active = !!q.isActive;

                        return (
                            <Card key={id} className="p-3 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{title}</div>
                                    <div className="text-xs text-gray-500">
                                        Lesson: {lesson || "—"} • {questionsCount} question(s)
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={active}
                                            onChange={(e) => mToggle.mutate({ id, isActive: e.target.checked })}
                                        />
                                        Active
                                    </label>
                                    <Button variant="outline" onClick={() => setEditingQuizId(id)}>
                                        Edit
                                    </Button>
                                    <Button variant="destructive" onClick={() => mDelete.mutate(id)}>
                                        Delete
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </Card>

            {/* Builder — mount only when we have a selected lesson */}
            {canBuild ? (
                <QuizBuilder
                    lessonId={lessonId}
                    quizId={editingQuizId ?? undefined}
                    onSaved={() => {
                        setEditingQuizId(null);
                        qc.invalidateQueries({ queryKey: ["quizzes"] });
                    }}
                />
            ) : (
                <Card className="p-4 text-sm text-gray-600">
                    Select a lesson to start creating a quiz.
                </Card>
            )}
        </div>
    );
}
