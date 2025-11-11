import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reportsService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Props = {
    studentId: string | null;
    onStudentIdChange: (v: string | null) => void;
    from: string;
    to: string;
    timezone: string;         // e.g., "+05:30"
    onFromChange: (v: string) => void;
    onToChange: (v: string) => void;
    onTimezoneChange: (v: string) => void;
    // Optional: external refresh (not strictly needed with react-query keys)
    onRefresh?: () => void;
};

export default function ReportFilters(p: Props) {
    const { data: students, isLoading } = useQuery({
        queryKey: ['teacher-students'],
        queryFn: reportsService.teacherStudents,
    });

    useEffect(() => {
        if (!p.studentId && students?.length) p.onStudentIdChange(students[0].userId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [students]);

    return (
        <Card className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Student selector */}
                <div className="space-y-1">
                    <Label>Student</Label>
                    {isLoading ? (
                        <div className="text-sm text-gray-500">Loading students…</div>
                    ) : students && students.length > 0 ? (
                        <Select
                            value={p.studentId ?? undefined}
                            onValueChange={(v) => p.onStudentIdChange(v || null)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(s => (
                                    <SelectItem key={s.userId} value={s.userId}>
                                        {s.display}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Enter Student ID"
                                value={p.studentId ?? ''}
                                onChange={(e) => p.onStudentIdChange(e.target.value || null)}
                            />
                        </div>
                    )}
                </div>

                {/* From */}
                <div className="space-y-1">
                    <Label>From</Label>
                    <Input type="date" value={p.from} onChange={(e) => p.onFromChange(e.target.value)} />
                </div>

                {/* To */}
                <div className="space-y-1">
                    <Label>To</Label>
                    <Input type="date" value={p.to} onChange={(e) => p.onToChange(e.target.value)} />
                </div>

                {/* Timezone */}
                <div className="space-y-1">
                    <Label>Timezone</Label>
                    <Select value={p.timezone} onValueChange={p.onTimezoneChange}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="+05:30">Asia/Colombo (+05:30)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end">
                <Button variant="outline" onClick={() => p.onRefresh?.()}>Refresh</Button>
            </div>
        </Card>
    );
}
