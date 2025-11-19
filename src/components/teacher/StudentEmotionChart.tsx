// src/components/teacher/StudentEmotionChart.tsx
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface EmotionPoint {
    date: string;
    avgAttention: number;
    lowPct?: number;
    medPct?: number;
    highPct?: number;
}

interface StudentEmotionChartProps {
    data: EmotionPoint[];
    loading?: boolean;
}

const StudentEmotionChart = ({
                                 data,
                                 loading,
                             }: StudentEmotionChartProps) => {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-happy-600" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-sm text-muted-foreground py-4">
                No attention data available yet.
            </div>
        );
    }

    // Format date as short label
    const chartData = data.map((d) => ({
        ...d,
        label: new Date(d.date).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        }),
    }));

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 1]}
                        tickFormatter={(v) => v.toFixed(1)}
                    />
                    <Tooltip
                        formatter={(value: any, name: any) => {
                            if (name === "avgAttention") {
                                return [value.toFixed(2), "Average attention"];
                            }
                            return value;
                        }}
                        labelStyle={{ fontSize: 12 }}
                    />
                    <Area
                        type="monotone"
                        dataKey="avgAttention"
                        strokeWidth={2}
                        fillOpacity={0.15}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StudentEmotionChart;
