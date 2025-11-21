// src/components/teacher/TeacherEmotionSummary.tsx
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reportsService";
import { Card } from "@/components/ui/card";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";

// Modern, soft, emotion-matching palette
const EMOTION_COLORS: Record<string, string> = {
    happy:   "#6EE7B7", // soft green
    surprise:"#C4B5FD", // soft purple
    neutral: "#D1D5DB", // soft gray
    fear:    "#FCD34D", // soft yellow
    angry:   "#FCA5A5", // soft red
    sad:     "#93C5FD", // soft blue
    disgust: "#86EFAC", // soft teal
};

const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

export default function TeacherEmotionSummary({
                                                  studentId,
                                                  from,
                                                  to,
                                                  timezone,
                                              }: {
    studentId: string | null;
    from: string;
    to: string;
    timezone: string;
}) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["daily-emotions", studentId, from, to, timezone],
        queryFn: () =>
            reportsService.learnerDaily(studentId!, { from, to, timezone }),
        enabled: !!studentId,
    });

    const rows = (data || []).map((d: any) => ({
        date: d.date,
        ...d.emotions,
    }));

    return (
        <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Emotion Summary (Daily)</h2>

            {!studentId && (
                <div className="text-sm text-gray-500">
                    Select a student to view.
                </div>
            )}
            {studentId && isLoading && (
                <div className="text-sm text-gray-500">Loading…</div>
            )}
            {error && (
                <div className="text-sm text-red-600">
                    Failed to load emotion report.
                </div>
            )}
            {studentId && data && data.length === 0 && (
                <div className="text-sm text-gray-600">
                    No data for the selected range.
                </div>
            )}

            {studentId && data && data.length > 0 && (
                <div className="h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={rows}
                            margin={{ top: 10, right: 20, left: 0, bottom: 6 }}
                        >
                            {/* Softer grid */}
                            <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />

                            <XAxis
                                dataKey="date"
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                tickLine={false}
                            />

                            <YAxis
                                allowDecimals={false}
                                tick={{ fill: "#6B7280", fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />

                            {/* Modern minimal tooltip */}
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "10px",
                                    border: "none",
                                    boxShadow:
                                        "0 4px 14px rgba(0,0,0,0.12)",
                                }}
                                formatter={(value, name) => [
                                    value,
                                    cap(name as string),
                                ]}
                            />

                            {/* Cleaner legend */}
                            <Legend
                                formatter={(value) => cap(value as string)}
                                wrapperStyle={{
                                    paddingTop: "10px",
                                    color: "#374151",
                                }}
                            />

                            {/* Softer, rounded bars */}
                            <Bar dataKey="happy"    fill={EMOTION_COLORS.happy}    stackId="em" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="surprise" fill={EMOTION_COLORS.surprise} stackId="em" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="neutral"  fill={EMOTION_COLORS.neutral}  stackId="em" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="fear"     fill={EMOTION_COLORS.fear}     stackId="em" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="angry"    fill={EMOTION_COLORS.angry}    stackId="em" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="sad"      fill={EMOTION_COLORS.sad}      stackId="em" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="disgust"  fill={EMOTION_COLORS.disgust}  stackId="em" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
}
