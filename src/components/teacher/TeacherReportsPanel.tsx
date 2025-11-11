// src/components/teacher/TeacherReportsPanel.tsx
import { useMemo, useState } from 'react';
import ReportFilters from '@/components/teacher/ReportFilters';
import TeacherLessonCompletion from '@/components/teacher/TeacherLessonCompletion';
import TeacherEmotionSummary from '@/components/teacher/TeacherEmotionSummary';
import TeacherAttentionSummary from '@/components/teacher/TeacherAttentionSummary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function TeacherReportsPanel() {
    const navigate = useNavigate();

    // Shared filters (student/date/tz)
    const today = useMemo(() => new Date().toISOString().slice(0,10), []);
    const weekAgo = useMemo(() => {
        const d = new Date(); d.setDate(d.getDate()-7);
        return d.toISOString().slice(0,10);
    }, []);
    const [studentId, setStudentId] = useState<string|null>(null);
    const [from, setFrom] = useState<string>(weekAgo);
    const [to, setTo] = useState<string>(today);
    const [timezone, setTimezone] = useState<string>("+05:30");
    const [tab, setTab] = useState('lesson-completion');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">Reports</h2>
                {/* Optional: full-screen page */}
                <Button variant="outline" onClick={() => navigate('/teacher/reports')}>
                    Open full page
                </Button>
            </div>

            <ReportFilters
                studentId={studentId}
                onStudentIdChange={setStudentId}
                from={from}
                to={to}
                timezone={timezone}
                onFromChange={setFrom}
                onToChange={setTo}
                onTimezoneChange={setTimezone}
            />

            <Tabs value={tab} onValueChange={setTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 rounded-lg bg-happy-50">
                    <TabsTrigger value="lesson-completion">Lesson Completion</TabsTrigger>
                    <TabsTrigger value="emotion-summary">Emotion Summary</TabsTrigger>
                    <TabsTrigger value="attention-summary">Attention Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="lesson-completion" className="space-y-6">
                    <TeacherLessonCompletion studentId={studentId} />
                </TabsContent>

                <TabsContent value="emotion-summary" className="space-y-6">
                    <TeacherEmotionSummary studentId={studentId} from={from} to={to} timezone={timezone} />
                </TabsContent>

                <TabsContent value="attention-summary" className="space-y-6">
                    <TeacherAttentionSummary studentId={studentId} from={from} to={to} timezone={timezone} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
