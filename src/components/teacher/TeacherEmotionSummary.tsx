import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reportsService';
import { Card } from '@/components/ui/card';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
} from 'recharts';

type Props = { studentId: string | null; from: string; to: string; timezone: string };

// Accessible, emotion-consistent palette
const EMOTION_COLORS: Record<string, string> = {
    happy:   '#F59E0B', // amber-500
    surprise:'#A78BFA', // violet-400/500
    neutral: '#9CA3AF', // gray-400
    fear:    '#F97316', // orange-500
    angry:   '#EF4444', // red-500
    sad:     '#3B82F6', // blue-500
    disgust: '#10B981', // emerald-500
};

const cap = (s: string) => (s?.length ? s[0].toUpperCase() + s.slice(1) : s);

export default function TeacherEmotionSummary({ studentId, from, to, timezone }: Props) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['daily-emotions', studentId, from, to, timezone],
        queryFn: () => reportsService.learnerDaily(studentId!, { from, to, timezone }),
        enabled: !!studentId,
    });

    // Recharts rows
    const rows = (data || []).map((d: any) => ({
        date: d.date,
        ...d.emotions,
    }));

    return (
        <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Emotion Summary (Daily)</h2>

            {!studentId && <div className="text-sm text-gray-500">Select a student to view.</div>}
            {studentId && isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {error && <div className="text-sm text-red-600">Failed to load report.</div>}
            {studentId && data && data.length === 0 && (
                <div className="text-sm text-gray-600">No data for the selected range.</div>
            )}

            {studentId && data && data.length > 0 && (
                // ⬆️ a bit taller than before
                <div className="h-[420px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={rows} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip
                                formatter={(value, name) => [value as number, cap(name as string)]}
                                labelFormatter={(label) => `${label}`}
                            />
                            <Legend formatter={(value) => cap(value as string)} />

                            {/* Colored, named bars (stacked) */}
                            <Bar dataKey="happy"    name="Happy"    stackId="em" fill={EMOTION_COLORS.happy} />
                            <Bar dataKey="surprise" name="Surprise" stackId="em" fill={EMOTION_COLORS.surprise} />
                            <Bar dataKey="neutral"  name="Neutral"  stackId="em" fill={EMOTION_COLORS.neutral} />
                            <Bar dataKey="fear"     name="Fear"     stackId="em" fill={EMOTION_COLORS.fear} />
                            <Bar dataKey="angry"    name="Angry"    stackId="em" fill={EMOTION_COLORS.angry} />
                            <Bar dataKey="sad"      name="Sad"      stackId="em" fill={EMOTION_COLORS.sad} />
                            <Bar dataKey="disgust"  name="Disgust"  stackId="em" fill={EMOTION_COLORS.disgust} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </Card>
    );
}
