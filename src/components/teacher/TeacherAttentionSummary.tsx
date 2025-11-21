// src/components/teacher/TeacherAttentionSummary.tsx
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reportsService";
import { Card } from "@/components/ui/card";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    Legend,
    CartesianGrid,
} from "recharts";

type Props = {
    studentId: string | null;
    from: string;
    to: string;
    timezone: string;
};

// Softer palette: Low = soft red, Medium = soft amber, High = soft green, Avg = soft blue
const COLORS = {
    avg:  "#93C5FD", // soft blue
    low:  "#FCA5A5", // soft red
    med:  "#FCD34D", // soft yellow/amber
    high: "#6EE7B7", // soft green
};

export default function TeacherAttentionSummary({
                                                    studentId,
                                                    from,
                                                    to,
                                                    timezone,
                                                }: Props) {
    const { data, isLoading, error } = useQuery({
        queryKey: ["daily-attention", studentId, from, to, timezone],
        queryFn: () =>
            reportsService.learnerDaily(studentId!, { from, to, timezone }),
        enabled: !!studentId,
    });

    const rows = useMemo(
        () =>
            (data || []).map((d: any) => ({
                date: d.date,
                avg: Number((d.attention?.avg ?? 0).toFixed(3)),
                lowPct: Math.round((d.attention?.lowPct ?? 0) * 100),
                medPct: Math.round((d.attention?.medPct ?? 0) * 100),
                highPct: Math.round((d.attention?.highPct ?? 0) * 100),
            })),
        [data]
    );

    return (
        <Card className="p-4 space-y-6">
            <h2 className="text-xl font-semibold">Attention Summary (Daily)</h2>

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
                    Failed to load attention report.
                </div>
            )}
            {studentId && data && data.length === 0 && (
                <div className="text-sm text-gray-600">
                    No data for the selected range.
                </div>
            )}

            {studentId && data && data.length > 0 && (
                <>
                    {/* Average attention line (0–1) */}
                    <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={rows}
                                margin={{ top: 10, right: 20, left: 0, bottom: 6 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    stroke="#E5E7EB"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: "#6B7280", fontSize: 12 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 1]}
                                    tick={{ fill: "#6B7280", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "none",
                                        boxShadow:
                                            "0 4px 14px rgba(0,0,0,0.12)",
                                    }}
                                    formatter={(value, name) => [
                                        Number(value as number).toFixed(2),
                                        "Average attention",
                                    ]}
                                    labelFormatter={(label) => `${label}`}
                                />
                                <Legend
                                    formatter={() => "Average attention"}
                                    wrapperStyle={{
                                        paddingTop: 8,
                                        color: "#374151",
                                        fontSize: 12,
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="avg"
                                    stroke={COLORS.avg}
                                    strokeWidth={2.5}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bands stacked bar: Low / Medium / High % */}
                    <div className="h-[360px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={rows}
                                margin={{ top: 10, right: 20, left: 0, bottom: 6 }}
                            >
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    stroke="#E5E7EB"
                                />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fill: "#6B7280", fontSize: 12 }}
                                    tickLine={false}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tickFormatter={(v) => `${v}%`}
                                    tick={{ fill: "#6B7280", fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: "10px",
                                        border: "none",
                                        boxShadow:
                                            "0 4px 14px rgba(0,0,0,0.12)",
                                    }}
                                    formatter={(value, name) => {
                                        let label = name;
                                        if (name === "lowPct") label = "Low attention";
                                        if (name === "medPct") label = "Medium attention";
                                        if (name === "highPct") label = "High attention";
                                        return [`${value as number}%`, label];
                                    }}
                                    labelFormatter={(label) => `${label}`}
                                />
                                <Legend
                                    formatter={(value) => {
                                        if (value === "lowPct") return "Low attention";
                                        if (value === "medPct") return "Medium attention";
                                        if (value === "highPct") return "High attention";
                                        return value;
                                    }}
                                    wrapperStyle={{
                                        paddingTop: 8,
                                        color: "#374151",
                                        fontSize: 12,
                                    }}
                                />

                                <Bar
                                    dataKey="lowPct"
                                    name="Low attention"
                                    stackId="band"
                                    fill={COLORS.low}
                                    radius={[6, 6, 0, 0]}
                                />
                                <Bar
                                    dataKey="medPct"
                                    name="Medium attention"
                                    stackId="band"
                                    fill={COLORS.med}
                                    radius={[6, 6, 0, 0]}
                                />
                                <Bar
                                    dataKey="highPct"
                                    name="High attention"
                                    stackId="band"
                                    fill={COLORS.high}
                                    radius={[6, 6, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </Card>
    );
}
