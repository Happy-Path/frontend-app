// src/components/teacher/TeacherQuizzes.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { lessonService } from "@/services/lessonService";
import { quizService } from "@/services/quizService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

    // ---- Lessons ---------------------------------------------------

    const {
        data: lessonListRaw,
        isLoading: loadingLessons,
        error: lessonsError,
    } = useQuery({
        queryKey: ["lessons"],
        queryFn: lessonService.list,
    });

    const lessonOptions = useMemo(() => {
        const arr = toArray(lessonListRaw);
        return arr
            .map((l: any) => ({
                id: String(l.id ?? l._id ?? l.lessonId ?? ""),
                title: String(
                    l.title ?? l.name ?? l.goal ?? l.id ?? l._id ?? "Untitled lesson"
                ),
            }))
            .filter((o) => o.id);
    }, [lessonListRaw]);

    const [lessonSearch, setLessonSearch] = useState("");
    const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

    // Auto-select first lesson
    useEffect(() => {
        if (!selectedLessonId && lessonOptions.length > 0) {
            setSelectedLessonId(lessonOptions[0].id);
        }
    }, [lessonOptions, selectedLessonId]);

    const filteredLessons = useMemo(() => {
        const q = lessonSearch.trim().toLowerCase();
        if (!q) return lessonOptions;
        return lessonOptions.filter((l) =>
            l.title.toLowerCase().includes(q)
        );
    }, [lessonOptions, lessonSearch]);

    const activeLesson = useMemo(
        () => lessonOptions.find((l) => l.id === selectedLessonId) || null,
        [lessonOptions, selectedLessonId]
    );

    // ---- Quizzes for selected lesson -------------------------------

    const {
        data: quizzesRaw,
        isLoading: loadingQuizzes,
        error: quizzesError,
    } = useQuery({
        queryKey: ["quizzes", selectedLessonId ?? "none"],
        queryFn: () => quizService.list(selectedLessonId || undefined),
        enabled: !!selectedLessonId,
    });

    const quizzes = useMemo(() => toArray(quizzesRaw), [quizzesRaw]);

    // ---- Mutations: toggle + delete --------------------------------

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

    // ---- Dialog state for Add / Edit -------------------------------

    const [quizDialogOpen, setQuizDialogOpen] = useState(false);
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

    const openNewQuizDialog = () => {
        if (!selectedLessonId) return;
        setEditingQuizId(null);
        setQuizDialogOpen(true);
    };

    const openEditQuizDialog = (id: string) => {
        setEditingQuizId(id);
        setQuizDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setQuizDialogOpen(open);
        if (!open) {
            setEditingQuizId(null);
        }
    };

    const handleQuizSaved = () => {
        setQuizDialogOpen(false);
        setEditingQuizId(null);
        qc.invalidateQueries({ queryKey: ["quizzes"] });
    };

    // ---- UI --------------------------------------------------------

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold">Quizzes</h2>
                <p className="text-sm text-muted-foreground">
                    Select a lesson on the left to see its quizzes. You can add simple,
                    child-friendly quizzes that run after the video lesson.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-6">
                {/* LEFT: lessons list (search + scroll) */}
                <Card className="p-4 space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="text-base font-semibold">Lessons</h3>
                            {lessonOptions.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                  {lessonOptions.length} total
                </span>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Pick a lesson to manage its quizzes.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Input
                            value={lessonSearch}
                            onChange={(e) => setLessonSearch(e.target.value)}
                            placeholder="Search lessons…"
                            className="h-9 text-sm"
                        />

                        {lessonsError && (
                            <p className="text-xs text-red-600 mt-1">
                                Failed to load lessons.
                            </p>
                        )}

                        {loadingLessons ? (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-happy-600" />
                            </div>
                        ) : lessonOptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground mt-3">
                                No lessons found. Create a lesson first, then you can attach
                                quizzes here.
                            </p>
                        ) : (
                            <div className="mt-2 max-h-[420px] overflow-y-auto space-y-1 pr-1">
                                {filteredLessons.length === 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        No lessons match your search.
                                    </p>
                                )}

                                {filteredLessons.map((lesson) => {
                                    const selected = lesson.id === selectedLessonId;
                                    return (
                                        <button
                                            key={lesson.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedLessonId(lesson.id);
                                                setEditingQuizId(null);
                                                setQuizDialogOpen(false);
                                            }}
                                            className={[
                                                "w-full text-left rounded-md border px-3 py-2 text-sm transition-colors",
                                                selected
                                                    ? "border-happy-500 bg-happy-50 text-happy-900"
                                                    : "border-gray-200 hover:bg-gray-50",
                                            ].join(" ")}
                                        >
                                            <div className="font-medium line-clamp-1">
                                                {lesson.title}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground mt-0.5">
                                                Click to view quizzes for this lesson.
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Card>

                {/* RIGHT: quizzes for selected lesson */}
                <Card className="p-4 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <h3 className="text-base font-semibold">Quizzes</h3>
                            <p className="text-xs text-muted-foreground">
                                {activeLesson
                                    ? `Attached to: ${activeLesson.title}`
                                    : "Select a lesson on the left to see its quizzes."}
                            </p>
                        </div>

                        <Button
                            size="sm"
                            onClick={openNewQuizDialog}
                            disabled={!selectedLessonId}
                        >
                            + Add new quiz
                        </Button>
                    </div>

                    {!selectedLessonId ? (
                        <p className="text-sm text-muted-foreground mt-4">
                            Choose a lesson on the left to manage its quizzes.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {loadingQuizzes && (
                                <div className="flex justify-center py-6">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-happy-600" />
                                </div>
                            )}

                            {quizzesError && (
                                <p className="text-sm text-red-600">
                                    Failed to load quizzes for this lesson.
                                </p>
                            )}

                            {!loadingQuizzes &&
                                !quizzesError &&
                                quizzes.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No quizzes attached to this lesson yet. Click{" "}
                                        <span className="font-medium">“Add new quiz”</span> to
                                        create one.
                                    </p>
                                )}

                            {!loadingQuizzes &&
                                !quizzesError &&
                                quizzes.length > 0 && (
                                    <div className="max-h-[420px] overflow-y-auto space-y-2 pr-1">
                                        {quizzes.map((q: any) => {
                                            const id = String(q._id ?? q.id ?? "");
                                            if (!id) return null;
                                            const title = String(q.title ?? "Untitled quiz");
                                            const questionsCount = Number(
                                                q.questionsCount ?? q.questions?.length ?? 0
                                            );
                                            const active = !!q.isActive;

                                            return (
                                                <Card
                                                    key={id}
                                                    className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                                >
                                                    <div>
                                                        <div className="font-medium flex items-center gap-2">
                                                            {title}
                                                            {active ? (
                                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                                  Active
                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600 border border-gray-200">
                                  Inactive
                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            {questionsCount} question
                                                            {questionsCount === 1 ? "" : "s"}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <label className="flex items-center gap-2 text-xs md:text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={active}
                                                                onChange={(e) =>
                                                                    mToggle.mutate({
                                                                        id,
                                                                        isActive: e.target.checked,
                                                                    })
                                                                }
                                                            />
                                                            Show to students
                                                        </label>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openEditQuizDialog(id)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => mDelete.mutate(id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                    </div>
                                )}
                        </div>
                    )}
                </Card>
            </div>

            {/* Dialog with QuizBuilder for Add/Edit */}
            <Dialog open={quizDialogOpen} onOpenChange={handleDialogChange}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingQuizId ? "Edit quiz" : "Add new quiz"}
                        </DialogTitle>
                        {activeLesson && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Lesson: <span className="font-medium">{activeLesson.title}</span>
                            </p>
                        )}
                    </DialogHeader>

                    {selectedLessonId && (
                        <div className="mt-2">
                            <QuizBuilder
                                lessonId={selectedLessonId}
                                quizId={editingQuizId ?? undefined}
                                onSaved={handleQuizSaved}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
