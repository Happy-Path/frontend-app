import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import { reportsService } from "@/services/reportsService";

type DailyRow = {
    date: string;
    attention: {
        avg: number; min: number; max: number; samples: number;
        lowPct: number; medPct: number; highPct: number;
    };
    emotions: Record<string, number>;
};

export default function ParentReports() {
    const [params] = useSearchParams();
    const [data, setData] = useState<DailyRow[]>([]);
    const [from, setFrom] = useState(params.get("from") || "");
    const [to, setTo] = useState(params.get("to") || "");
    // Pass ?userId=<childId> in the URL. If you store a default child on the parent profile,
    // you can fallback to that here instead.
    const userId = params.get("userId") || "";

    const load = async () => {
        if (!userId) return;
        const rows = await reportsService.learnerDaily(userId, from || undefined, to || undefined);
        setData(rows);
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

    const emotionKeys = ["happy","surprise","neutral","fear","angry","sad","disgust"];

    return (
        <div className="max-w-6xl mx-auto p-0 space-y-6">
            <h2 className="text-2xl font-bold">Learner Daily Report</h2>

            <Card className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1">
                        <label className="text-xs text-gray-600">From (YYYY-MM-DD)</label>
                        <Input value={from} onChange={e => setFrom(e.target.value)} placeholder="2025-11-01" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-600">To (YYYY-MM-DD)</label>
                        <Input value={to} onChange={e => setTo(e.target.value)} placeholder="2025-11-07" />
                    </div>
                    <Button onClick={load} disabled={!userId}>Refresh</Button>
                </div>
                {!userId && (
                    <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                        Add <span className="font-mono">?userId=&lt;childId&gt;</span> to the URL to load reports.
                    </div>
                )}
            </Card>

            <Card className="p-4">
                <h3 className="font-semibold mb-2">Attention Bands (%) by Day</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <BarChart data={data.map(r => ({
                            date: r.date,
                            low: Math.round((r.attention.lowPct || 0) * 100),
                            med: Math.round((r.attention.medPct || 0) * 100),
                            high: Math.round((r.attention.highPct || 0) * 100)
                        }))}>
                            <XAxis dataKey="date" />
                            <YAxis domain={[0,100]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="low" stackId="a" />
                            <Bar dataKey="med" stackId="a" />
                            <Bar dataKey="high" stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-4">
                <h3 className="font-semibold mb-2">Average Attention (0–1)</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer>
                        <LineChart data={data}>
                            <XAxis dataKey="date" />
                            <YAxis domain={[0,1]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="attention.avg" dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="p-4">
                <h3 className="font-semibold mb-2">Emotion Counts by Day</h3>
                <div className="w-full h-64 overflow-x-auto">
                    <ResponsiveContainer width="100%">
                        <BarChart
                            data={data.map(r => ({
                                date: r.date,
                                ...emotionKeys.reduce((acc, k) => ({ ...acc, [k]: r.emotions?.[k] || 0 }), {})
                            }))}
                        >
                            <XAxis dataKey="date" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            {emotionKeys.map((k) => (
                                <Bar key={k} dataKey={k} stackId="e" />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
