// src/pages/teacher/Reports.tsx
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportFilters from '@/components/teacher/ReportFilters';
import TeacherLessonCompletion from '@/components/teacher/TeacherLessonCompletion';
import TeacherEmotionSummary from '@/components/teacher/TeacherEmotionSummary';
import TeacherAttentionSummary from '@/components/teacher/TeacherAttentionSummary';
import { useAuth } from '@/contexts/AuthContext';

export default function TeacherReportsPage() {
    const { user } = useAuth();
    if (user?.role !== 'teacher') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
                <p className="mt-2">You need teacher access to view this page.</p>
            </div>
        );
    }

    // Shared filter state for all reports
    const today = useMemo(() => new Date().toISOString().slice(0,10), []);
    const weekAgo = useMemo(() => {
        const d = new Date(); d.setDate(d.getDate()-7);
        return d.toISOString().slice(0,10);
    }, []);
    const [studentId, setStudentId] = useState<string|null>(null);
    const [from, setFrom] = useState<string>(weekAgo);
    const [to, setTo] = useState<string>(today);
    const [timezone, setTimezone] = useState<string>("+05:30");
    const [activeTab, setActiveTab] = useState('lesson-completion');

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} />
            <main className="container px-4 py-6 max-w-7xl space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Teacher Reports</h1>

                <ReportFilters
                    studentId={studentId}
                    onStudentIdChange={setStudentId}
                    from={from} to={to} timezone={timezone}
                    onFromChange={setFrom} onToChange={setTo} onTimezoneChange={setTimezone}
                />

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4 rounded-lg bg-happy-50">
                        <TabsTrigger value="lesson-completion">Lesson Completion</TabsTrigger>
                        <TabsTrigger value="emotion-summary">Emotion Summary</TabsTrigger>
                        <TabsTrigger value="attention-summary">Attention Summary</TabsTrigger>
                        <TabsTrigger value="quizzes" disabled>Quizzes (coming soon)</TabsTrigger>
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

                    <TabsContent value="quizzes">
                        {/* Placeholder only */}
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
