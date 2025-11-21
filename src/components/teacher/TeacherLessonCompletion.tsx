// src/components/teacher/TeacherLessonCompletion.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reportsService";
import { lessonService } from "@/services/lessonService";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type LessonLike = {
    id?: string;
    _id?: string;
    lessonId?: string;
    title?: string;
    name?: string;
    goal?: string;
};

function normalizeLessons(raw: any): LessonLike[] {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.items)) return raw.items;
    if (Array.isArray(raw?.data)) return raw.data;
    if (Array.isArray(raw?.results)) return raw.results;
    return [];
}

export default function TeacherLessonCompletion({
                                                    studentId,
                                                }: {
    studentId: string | null;
}) {
    // Progress per lesson for this learner
    const {
        data: progress,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["progress-by-user", studentId],
        queryFn: () => reportsService.progressByUser(studentId!),
        enabled: !!studentId,
    });

    // All lessons – used to resolve lessonId → human friendly title
    const {
        data: lessonsRaw,
        isLoading: lessonsLoading,
        error: lessonsError,
    } = useQuery({
        queryKey: ["lessons", "for-progress"],
        queryFn: lessonService.list,
    });

    const lessonTitleMap = useMemo(() => {
        const map: Record<string, string> = {};
        const lessons = normalizeLessons(lessonsRaw);
        lessons.forEach((l: LessonLike) => {
            const id = String(l.id ?? l._id ?? l.lessonId ?? "").trim();
            if (!id) return;
            const title = String(l.title ?? l.name ?? l.goal ?? "Lesson").trim();
            map[id] = title;
        });
        return map;
    }, [lessonsRaw]);

    return (
        <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Lesson Completion Status</h2>

            {!studentId && (
                <div className="text-sm text-gray-500">Select a student to view.</div>
            )}

            {studentId && (isLoading || lessonsLoading) && (
                <div className="text-sm text-gray-500">Loading…</div>
            )}

            {(error || lessonsError) && (
                <div className="text-sm text-red-600">
                    Failed to load progress or lesson details.
                </div>
            )}

            {studentId &&
                !isLoading &&
                !lessonsLoading &&
                progress &&
                progress.length === 0 && (
                    <div className="text-sm text-gray-600">No lessons started yet.</div>
                )}

            {studentId &&
                !isLoading &&
                !lessonsLoading &&
                progress &&
                progress.length > 0 && (
                    <div className="space-y-3">
                        {progress.map((p: any) => {
                            const pct = Math.min(
                                100,
                                Math.max(0, Math.round(p.percent || 0))
                            );
                            const status = p.completed
                                ? "Completed"
                                : pct > 0
                                    ? "In progress"
                                    : "Not started";

                            const titleFromMap = lessonTitleMap[p.lessonId];
                            const displayTitle = titleFromMap || p.lessonId;

                            return (
                                <div
                                    key={p._id || `${p.lessonId}`}
                                    className="border rounded-md p-3 bg-white"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">
                                                Lesson:{" "}
                                                <span className="font-semibold">
                          {displayTitle}
                        </span>
                                                {!titleFromMap && (
                                                    <span className="ml-1 text-xs text-gray-400">
                            ({p.lessonId})
                          </span>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Last ping:{" "}
                                                {p.lastPingAt
                                                    ? new Date(p.lastPingAt).toLocaleString()
                                                    : "—"}
                                            </div>
                                        </div>
                                        <div className="text-sm">{status}</div>
                                    </div>

                                    <div className="mt-2">
                                        {/* Green filled part, gray remainder */}
                                        <Progress
                                            value={pct}
                                            className="h-2 bg-gray-200 [&>div]:bg-green-500"
                                        />
                                        <div className="text-xs text-gray-600 mt-1">
                                            {pct}% ({p.positionSec || 0}s / {p.durationSec || 0}s)
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
        </Card>
    );
}
