import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsService } from "@/services/reportsService";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

export default function StudentEmotionChart({
                                              studentId,
                                            }: {
  studentId: string;
}) {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ["student-emotions", studentId],
    queryFn: async () => {
      const today = new Date();
      const fromDate = new Date();
      fromDate.setDate(today.getDate() - 6);

      const from = fromDate.toISOString().slice(0, 10);
      const to = today.toISOString().slice(0, 10);

      return reportsService.learnerDaily(studentId, {
        from,
        to,
        timezone: "+05:30",
      });
    },
    enabled: !!studentId,
  });

  const rows = useMemo(
      () =>
          data.map((d: any) => ({
            date: d.date,
            avg: Number((d.attention?.avg ?? 0).toFixed(2)),
            ...d.emotions,
          })),
      [data]
  );

  if (isLoading)
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error)
    return (
        <p className="text-sm text-red-600">Failed to load emotion data.</p>
    );
  if (!rows.length)
    return (
        <p className="text-sm text-muted-foreground">
          No tracking data available.
        </p>
    );

  return (
      <div className="space-y-6">
        {/* Average attention line */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(v: number) => v.toFixed(2)} />
              <Legend />
              <Line
                  dataKey="avg"
                  name="Avg Attention"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                  dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Emotion distribution */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />

              <Bar dataKey="happy" fill="#F59E0B" />
              <Bar dataKey="surprise" fill="#A78BFA" />
              <Bar dataKey="neutral" fill="#9CA3AF" />
              <Bar dataKey="fear" fill="#F97316" />
              <Bar dataKey="angry" fill="#EF4444" />
              <Bar dataKey="sad" fill="#3B82F6" />
              <Bar dataKey="disgust" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
  );
}
