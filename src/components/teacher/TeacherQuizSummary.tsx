// src/components/teacher/TeacherQuizSummary.tsx
import { useQuery } from "@tanstack/react-query";
import { reportsService, QuizSummaryRow } from "@/services/reportsService";
import { Card } from "@/components/ui/card";

type Props = {
    studentId: string | null;
    from: string;
    to: string;
};

export default function TeacherQuizSummary({ studentId, from, to }: Props) {
    const {
        data,
        isLoading,
        error,
    } = useQuery<QuizSummaryRow[]>({
        queryKey: ["quiz-summary", studentId, from, to],
        queryFn: () => reportsService.learnerQuizzes(studentId!, { from, to }),
        enabled: !!studentId,
    });

    return (
        <Card className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Quiz Results</h2>

            {!studentId && (
                <div className="text-sm text-gray-500">
                    Select a student to view quiz results.
                </div>
            )}
            {studentId && isLoading && (
                <div className="text-sm text-gray-500">Loading quiz summary…</div>
            )}
            {error && (
                <div className="text-sm text-red-600">
                    Failed to load quiz summary.
                </div>
            )}
            {studentId && data && data.length === 0 && (
                <div className="text-sm text-gray-600">
                    No quiz attempts for this student in the selected date range.
                </div>
            )}

            {studentId && data && data.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse">
                        <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="text-left px-3 py-2 font-medium text-gray-700">
                                Quiz
                            </th>
                            <th className="text-center px-3 py-2 font-medium text-gray-700">
                                Attempts
                            </th>
                            <th className="text-center px-3 py-2 font-medium text-gray-700">
                                Best
                            </th>
                            <th className="text-center px-3 py-2 font-medium text-gray-700">
                                Average
                            </th>
                            <th className="text-center px-3 py-2 font-medium text-gray-700">
                                Last score
                            </th>
                            <th className="text-center px-3 py-2 font-medium text-gray-700">
                                Passed attempts
                            </th>
                            <th className="text-center px-3 py-2 font-medium text-gray-700">
                                First attempt
                            </th>
                            <th className="text-center px-3 py-2 font-medium text-gray-700">
                                Last attempt
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {data.map((row) => {
                            const passedOnce = row.passedAttempts > 0;
                            return (
                                <tr
                                    key={row.quizId}
                                    className="border-b last:border-0 hover:bg-gray-50/60"
                                >
                                    <td className="px-3 py-2 align-top">
                                        <div className="font-medium text-gray-800">
                                            {row.quizTitle}
                                        </div>
                                        {row.lessonId && (
                                            <div className="text-[11px] text-gray-500">
                                                Lesson ID:{" "}
                                                <span className="font-mono">
                                                        {row.lessonId}
                                                    </span>
                                            </div>
                                        )}
                                        <div className="text-[11px] text-gray-500 mt-0.5">
                                            Passing score: {row.passingScore}%
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center align-middle">
                                        <div>{row.attempts}</div>
                                        <div className="text-[11px] text-gray-500">
                                            {row.completedAttempts} completed /{" "}
                                            {row.abandonedAttempts} abandoned
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center align-middle">
                                        {row.bestScore}%
                                    </td>
                                    <td className="px-3 py-2 text-center align-middle">
                                        {row.avgScore}%
                                    </td>
                                    <td className="px-3 py-2 text-center align-middle">
                                        {row.lastScore}%
                                    </td>
                                    <td className="px-3 py-2 text-center align-middle">
                                        <div
                                            className={
                                                passedOnce
                                                    ? "inline-flex items-center rounded-full px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium"
                                                    : "inline-flex items-center rounded-full px-2 py-0.5 bg-red-50 text-red-600 text-xs font-medium"
                                            }
                                        >
                                            {row.passedAttempts} attempt
                                            {row.passedAttempts === 1 ? "" : "s"}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center align-middle text-[11px] text-gray-600">
                                        {row.firstAttemptAt
                                            ? new Date(
                                                row.firstAttemptAt
                                            ).toLocaleString()
                                            : "—"}
                                    </td>
                                    <td className="px-3 py-2 text-center align-middle text-[11px] text-gray-600">
                                        {row.lastAttemptAt
                                            ? new Date(
                                                row.lastAttemptAt
                                            ).toLocaleString()
                                            : "—"}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
    );
}
