import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reportsService';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function TeacherLessonCompletion({ studentId }: { studentId: string | null }) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['progress-by-user', studentId],
        queryFn: () => reportsService.progressByUser(studentId!),
        enabled: !!studentId
    });

    return (
        <Card className="p-4">
            <h2 className="text-xl font-semibold mb-4">Lesson Completion Status</h2>
            {!studentId && <div className="text-sm text-gray-500">Select a student to view.</div>}
            {studentId && isLoading && <div className="text-sm text-gray-500">Loading…</div>}
            {error && <div className="text-sm text-red-600">Failed to load progress.</div>}
            {studentId && data && data.length === 0 && (
                <div className="text-sm text-gray-600">No lessons started yet.</div>
            )}

            {studentId && data && data.length > 0 && (
                <div className="space-y-3">
                    {data.map((p: any) => {
                        const pct = Math.min(100, Math.max(0, Math.round(p.percent || 0)));
                        const status = p.completed ? 'Completed' : (pct > 0 ? 'In progress' : 'Not started');
                        return (
                            <div key={p._id || `${p.lessonId}`} className="border rounded-md p-3 bg-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">Lesson: <span className="font-mono">{p.lessonId}</span></div>
                                        <div className="text-xs text-gray-500">Last ping: {p.lastPingAt ? new Date(p.lastPingAt).toLocaleString() : '—'}</div>
                                    </div>
                                    <div className="text-sm">{status}</div>
                                </div>
                                <div className="mt-2">
                                    <Progress value={pct} />
                                    <div className="text-xs text-gray-600 mt-1">{pct}% ({p.positionSec || 0}s / {p.durationSec || 0}s)</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Card>
    );
}
