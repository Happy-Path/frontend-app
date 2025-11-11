import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reportsService';
import { Card } from '@/components/ui/card';
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
} from 'recharts';

type Props = { studentId: string | null; from: string; to: string; timezone: string };

// Palette: Low = red, Medium = amber, High = green, Avg line = sky
const COLORS = {
    avg:  '#0EA5E9', // sky-500
    low:  '#EF4444', // red-500
    med:  '#F59E0B', // amber-500
    high: '#10B981', // emerald-500
};

export default function TeacherAttentionSummary({ studentId, from, to, timezone }: Props) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['daily-attention', studentId, from, to, timezone],
        queryFn: () => reportsService.learnerDaily(studentId!, { from, to, timezone }),
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

            {!studentId && <div className="text-sm text-gray-500">Select a student to view.</div>}
            {studentId && isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {error && <div className="text-sm text-red-600">Failed to load report.</div>}
            {studentId && data && data.length === 0 && (
                <div className="text-sm text-gray-600">No data for the selected range.</div>
            )}

            {studentId && data && data.length > 0 && (
                <>
                    {/* Average attention line */}
                    <div className="h-[340px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 1]} />
                                <Tooltip
                                    formatter={(value, name) =>
                                        name === 'avg'
                                            ? [Number(value as number).toFixed(2), 'Average']
                                            : [value as number, name]
                                    }
                                    labelFormatter={(label) => `${label}`}
                                />
                                <Legend formatter={(v) => (v === 'avg' ? 'Average' : v)} />
                                <Line
                                    type="monotone"
                                    dataKey="avg"
                                    name="Average"
                                    stroke={COLORS.avg}
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bands stacked bar */}
                    <div className="h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                                <Tooltip
                                    formatter={(value, name) => [`${value as number}%`, name]}
                                    labelFormatter={(label) => `${label}`}
                                />
                                <Legend
                                    formatter={(value) => {
                                        if (value === 'lowPct') return 'Low %';
                                        if (value === 'medPct') return 'Medium %';
                                        if (value === 'highPct') return 'High %';
                                        return value;
                                    }}
                                />
                                <Bar dataKey="lowPct"  name="Low %"    stackId="band" fill={COLORS.low} />
                                <Bar dataKey="medPct"  name="Medium %" stackId="band" fill={COLORS.med} />
                                <Bar dataKey="highPct" name="High %"   stackId="band" fill={COLORS.high} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </Card>
    );
}
