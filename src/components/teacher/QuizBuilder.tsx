// src/components/teacher/QuizBuilder.tsx
import { useEffect, useState } from "react";
import { quizService } from "@/services/quizService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { safeId } from "@/utils/safeId";
import { Plus, CheckCircle2 } from "lucide-react";

type Opt = { id: string; labelText?: string; imageUrl?: string };
type Q = {
    _id?: string;
    type: "single" | "image";
    promptText?: string;
    promptImageUrl?: string;
    promptAudioUrl?: string;
    options: Opt[];
    correctOptionId: string;
    order: number;
};

interface Props {
    lessonId: string;
    quizId?: string;
    onSaved?: () => void;
}

export default function QuizBuilder({ lessonId, quizId, onSaved }: Props) {
    const [title, setTitle] = useState<string>("");
    const [questions, setQuestions] = useState<Q[]>([]);
    const [loading, setLoading] = useState<boolean>(!!quizId);
    const [saving, setSaving] = useState<boolean>(false);

    // seed or load
    useEffect(() => {
        let ignore = false;
        (async () => {
            // New quiz → no defaults, just an empty list with an “Add question” CTA
            if (!quizId) {
                setTitle("");
                setQuestions([]);
                return;
            }

            try {
                setLoading(true);
                const q = await quizService.getTeacher(quizId);
                if (ignore) return;

                setTitle(q.title ?? "");
                setQuestions(
                    (q.questions || []).map((qq: any, idx: number) => ({
                        _id: qq._id,
                        type: qq.type,
                        promptText: qq.promptText,
                        promptImageUrl: qq.promptImageUrl,
                        promptAudioUrl: qq.promptAudioUrl,
                        options: (qq.options || []).map((o: any) => ({
                            id: o.id,
                            labelText: o.labelText,
                            imageUrl: o.imageUrl,
                        })),
                        correctOptionId: qq.correctOptionId,
                        order: qq.order ?? idx,
                    }))
                );
            } catch {
                toast.error("Failed to load quiz");
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            ignore = true;
        };
    }, [quizId]);

    const addQuestion = () =>
        setQuestions((qs) => [
            ...qs,
            {
                type: "single",
                promptText: "",
                options: [
                    { id: safeId(), labelText: "" },
                    { id: safeId(), labelText: "" },
                ],
                correctOptionId: "",
                order: qs.length,
            },
        ]);

    const updateQ = (i: number, patch: Partial<Q>) =>
        setQuestions((qs) =>
            qs.map((q, idx) => (idx === i ? { ...q, ...patch } : q))
        );

    const updateOpt = (qi: number, oi: number, patch: Partial<Opt>) =>
        setQuestions((qs) =>
            qs.map((q, idx) =>
                idx !== qi
                    ? q
                    : {
                        ...q,
                        options: q.options.map((o, j) =>
                            j === oi ? { ...o, ...patch } : o
                        ),
                    }
            )
        );

    const addOpt = (qi: number) =>
        setQuestions((qs) =>
            qs.map((q, idx) =>
                idx !== qi
                    ? q
                    : q.options.length >= 4
                        ? q
                        : {
                            ...q,
                            options: [
                                ...q.options,
                                { id: safeId(), labelText: "" },
                            ],
                        }
            )
        );

    const save = async () => {
        if (!lessonId) {
            toast.error("Please select a lesson before saving the quiz.");
            return;
        }
        if (!title.trim()) {
            toast.error("Please give the quiz a title.");
            return;
        }
        if (!questions.length) {
            toast.error("Add at least one question.");
            return;
        }

        // Basic soft validation: each question should have at least 2 options
        for (const [idx, q] of questions.entries()) {
            if (!q.promptText?.trim()) {
                toast.error(`Question ${idx + 1} needs a prompt.`);
                return;
            }
            if (!q.options || q.options.length < 2) {
                toast.error(`Question ${idx + 1} needs at least 2 options.`);
                return;
            }
        }

        const payload = {
            title: title.trim(),
            lessonId,
            isActive: true,
            settings: {
                allowRetry: true,
                maxAttempts: 3,
                shuffleOptions: true,
                passingScore: 60,
            },
            questions: questions.map((q, i) => ({
                _id: q._id,
                type: q.type,
                promptText: q.promptText,
                promptImageUrl: q.promptImageUrl,
                promptAudioUrl: q.promptAudioUrl,
                correctOptionId: q.correctOptionId || q.options[0]?.id,
                order: q.order ?? i,
                options: q.options.map((o) => ({
                    id: o.id,
                    labelText: o.labelText,
                    imageUrl: o.imageUrl,
                })),
            })),
        };

        try {
            setSaving(true);
            if (quizId) await quizService.update(quizId, payload);
            else await quizService.create(payload);

            toast.success("Quiz saved");
            onSaved?.();
        } catch {
            toast.error("Failed to save quiz");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Card className="p-4">Loading…</Card>;

    return (
        <Card className="p-4 md:p-5 space-y-5 bg-[#F7FAFF]">
            {/* HEADER: title */}
            <div className="space-y-2">
                <div className="inline-flex items-center rounded-full bg-happy-50 px-3 py-1 text-xs font-medium text-happy-800 border border-happy-100">
                    Step 1 · Quiz details
                </div>
                <div className="space-y-1">
                    <Label className="text-sm">Quiz title</Label>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Eg: Colours Check-in, Shapes Quick Quiz…"
                    />
                    <p className="text-xs text-muted-foreground">
                        Use a short, friendly name that parents and children will recognise.
                    </p>
                </div>
            </div>

            {/* QUESTIONS */}
            <div className="space-y-3">
                <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800 border border-blue-100">
                    Step 2 · Questions & answers
                </div>

                {questions.length === 0 && (
                    <div className="rounded-xl border border-dashed border-blue-200 bg-white/70 p-4 text-center space-y-2">
                        <p className="text-sm font-medium text-gray-700">
                            No questions yet
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Add a simple question with 2–4 answer choices. Mark the correct
                            answer so the system can score it.
                        </p>
                        <Button
                            size="sm"
                            className="mt-1"
                            onClick={addQuestion}
                        >
                            <Plus className="h-4 w-4 mr-1" />
                            Add first question
                        </Button>
                    </div>
                )}

                {questions.map((q, i) => {
                    const correctId = q.correctOptionId;

                    return (
                        <Card
                            key={i}
                            className="p-4 space-y-3 rounded-2xl border-blue-100 bg-white shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-happy-100 text-xs font-semibold text-happy-900">
                    {i + 1}
                  </span>
                                    <span className="text-sm font-semibold">
                    Question {i + 1}
                  </span>
                                </div>
                                <span className="text-[11px] text-muted-foreground">
                  Single choice
                </span>
                            </div>

                            {/* Prompt */}
                            <div className="space-y-1">
                                <Label className="text-xs">Question prompt</Label>
                                <Input
                                    value={q.promptText || ""}
                                    onChange={(e) =>
                                        updateQ(i, { promptText: e.target.value })
                                    }
                                    placeholder="Eg: Which picture shows a circle?"
                                />
                            </div>

                            {/* Options */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Answer options</Label>
                                    <p className="text-[11px] text-muted-foreground">
                                        Tap the{" "}
                                        <span className="font-semibold">“Correct answer”</span>{" "}
                                        label to choose the right one.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {q.options.map((o, oi) => {
                                        const isCorrect = o.id === correctId;
                                        return (
                                            <div
                                                key={o.id}
                                                className={[
                                                    "border rounded-xl p-3 space-y-2 transition-all",
                                                    isCorrect
                                                        ? "border-emerald-400 bg-emerald-50/60 shadow-sm"
                                                        : "border-gray-200 bg-white",
                                                ].join(" ")}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs">
                                                        Option {oi + 1}
                                                    </Label>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateQ(i, { correctOptionId: o.id })
                                                        }
                                                        className={[
                                                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] border transition-colors",
                                                            isCorrect
                                                                ? "bg-emerald-500 text-white border-emerald-500"
                                                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100",
                                                        ].join(" ")}
                                                    >
                                                        {isCorrect ? (
                                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                                        ) : (
                                                            <span className="h-3 w-3 rounded-full border border-gray-400" />
                                                        )}
                                                        Correct answer
                                                    </button>
                                                </div>

                                                <Input
                                                    placeholder="Answer text (eg: Circle)"
                                                    value={o.labelText || ""}
                                                    onChange={(e) =>
                                                        updateOpt(i, oi, {
                                                            labelText: e.target.value,
                                                        })
                                                    }
                                                />
                                                <Input
                                                    placeholder="Image URL (optional)"
                                                    value={o.imageUrl || ""}
                                                    onChange={(e) =>
                                                        updateOpt(i, oi, {
                                                            imageUrl: e.target.value,
                                                        })
                                                    }
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => addOpt(i)}
                                        disabled={q.options.length >= 4}
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add option
                                    </Button>
                                    <p className="text-[11px] text-muted-foreground">
                                        {q.options.length}/4 options used
                                    </p>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <p className="text-xs text-muted-foreground">
                    Children will see one question at a time with large buttons for the
                    options.
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addQuestion}
                    >
                        <Plus className="h-4 w-4 mr-1" />
                        Add question
                    </Button>
                    <Button
                        size="sm"
                        onClick={save}
                        disabled={saving}
                    >
                        {saving ? "Saving…" : quizId ? "Update quiz" : "Save quiz"}
                    </Button>
                </div>
            </div>
        </Card>
    );
}
