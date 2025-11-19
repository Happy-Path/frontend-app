// src/components/teacher/StudentPerformanceChart.tsx
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

interface StudentPerformanceChartProps {
    data: { name: string; percent: number }[];
    loading?: boolean;
}

const StudentPerformanceChart = ({
                                     data,
                                     loading,
                                 }: StudentPerformanceChartProps) => {
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
                No progress data available yet.
            </div>
        );
    }

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip
                        formatter={(value: any) => `${value}%`}
                        labelStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="percent" radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StudentPerformanceChart;
