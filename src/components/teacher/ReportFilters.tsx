// src/components/teacher/ReportFilters.tsx
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reportsService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type Props = {
    studentId: string | null;
    onStudentIdChange: (v: string | null) => void;
    from: string;
    to: string;
    timezone: string; // e.g. "+05:30"
    onFromChange: (v: string) => void;
    onToChange: (v: string) => void;
    onTimezoneChange: (v: string) => void;
    onRefresh?: () => void;
};

// Be tolerant of different shapes coming from the API
type TeacherStudentRow = {
    userId?: string;
    id?: string;
    name?: string;
    display?: string;
    studentName?: string;
    email?: string;
};

function getStudentId(row: TeacherStudentRow): string | null {
    return row.userId || row.id || null;
}

function getStudentLabel(row: TeacherStudentRow): string {
    return (
        row.display ||
        row.name ||
        row.studentName ||
        row.email ||
        row.userId ||
        row.id ||
        'Unnamed student'
    );
}

export default function ReportFilters(p: Props) {
    const { data: studentsRaw, isLoading } = useQuery<TeacherStudentRow[]>({
        queryKey: ['teacher-students'],
        queryFn: reportsService.teacherStudents,
    });

    const students: TeacherStudentRow[] = studentsRaw || [];

    // Auto-select first student if none is selected yet
    useEffect(() => {
        if (!students.length) return;
        if (p.studentId) return;

        const first = students[0];
        const firstId = getStudentId(first);
        if (firstId) {
            p.onStudentIdChange(firstId);
        }
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
                    ) : students.length > 0 ? (
                        <Select
                            value={p.studentId ?? undefined}
                            onValueChange={(v) => p.onStudentIdChange(v || null)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a student" />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map((s, idx) => {
                                    const id = getStudentId(s);
                                    if (!id) return null; // skip malformed rows
                                    const label = getStudentLabel(s);
                                    return (
                                        <SelectItem key={id ?? idx} value={id}>
                                            {label}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="text-xs text-gray-500">
                                No students found from the reports service. You can still type an
                                ID manually:
                            </div>
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
                    <Input
                        type="date"
                        value={p.from}
                        onChange={(e) => p.onFromChange(e.target.value)}
                    />
                </div>

                {/* To */}
                <div className="space-y-1">
                    <Label>To</Label>
                    <Input
                        type="date"
                        value={p.to}
                        onChange={(e) => p.onToChange(e.target.value)}
                    />
                </div>

                {/* Timezone */}
                <div className="space-y-1">
                    <Label>Timezone</Label>
                    <Select value={p.timezone} onValueChange={p.onTimezoneChange}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="+05:30">Asia/Colombo (+05:30)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex justify-end">
            </div>
        </Card>
    );
}
