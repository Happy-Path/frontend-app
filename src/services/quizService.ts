const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const join = (b: string, p: string) => `${b.replace(/\/+$/,'')}/${p.replace(/^\/+/, '')}`;
const auth = () => {
    const t = localStorage.getItem('token');
    return t ? { Authorization: `Bearer ${t}` } : {};
};

export type QuizDTO = {
    _id: string;
    title: string;
    lessonId: string;
    settings?: { allowRetry?: boolean; maxAttempts?: number; shuffleOptions?: boolean; passingScore?: number };
    questions: Array<{
        _id: string;
        type: "single" | "image";
        promptText?: string;
        promptImageUrl?: string;
        promptAudioUrl?: string;
        order: number;
        options: Array<{ id: string; labelText?: string; imageUrl?: string }>;
    }>;
};

export const quizService = {
    getByLesson: async (lessonId: string) => {
        const res = await fetch(join(API_BASE, `/quizzes/by-lesson/${lessonId}`), { headers: auth() });
        if (!res.ok) throw new Error('Failed to load quiz');
        return res.json() as Promise<QuizDTO | null>;
    },

    submitAttempt: async (quizId: string, answers: Array<{questionId:string; selectedOptionId:string; timeTakenSec?:number}>) => {
        const res = await fetch(join(API_BASE, `/quizzes/${quizId}/attempts`), {
            method: 'POST',
            headers: { 'Content-Type':'application/json', ...auth() },
            body: JSON.stringify({ answers })
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<{ attemptId:string; correct:number; total:number; scorePct:number; passed:boolean; allowRetry:boolean; maxAttempts:number; remainingAttempts:number }>;
    },

    // Teacher
    create: async (payload: any) => {
        const res = await fetch(join(API_BASE, `/quizzes`), { method:'POST', headers:{'Content-Type':'application/json', ...auth()}, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('Create failed'); return res.json();
    },
    update: async (id: string, payload: any) => {
        const res = await fetch(join(API_BASE, `/quizzes/${id}`), { method:'PUT', headers:{'Content-Type':'application/json', ...auth()}, body: JSON.stringify(payload) });
        if (!res.ok) throw new Error('Update failed'); return res.json();
    },
    getTeacher: async (id: string) => {
        const res = await fetch(join(API_BASE, `/quizzes/${id}`), { headers: auth() });
        if (!res.ok) throw new Error('Load failed'); return res.json();
    },

    // ADD these functions to the exported quizService object
    list: async (lessonId?: string) => {
        const qs = new URLSearchParams();
        if (lessonId) qs.set('lessonId', lessonId);
        const res = await fetch(join(API_BASE, `/quizzes?${qs.toString()}`), { headers: auth() });
        if (!res.ok) throw new Error('Failed to load quizzes'); return res.json();
    },
    remove: async (id: string) => {
        const res = await fetch(join(API_BASE, `/quizzes/${id}`), { method: 'DELETE', headers: auth() });
        if (!res.ok) throw new Error('Delete failed'); return res.json();
    },
    setActive: async (id: string, isActive: boolean) => {
        const res = await fetch(join(API_BASE, `/quizzes/${id}/active`), {
            method: 'PATCH',
            headers: { 'Content-Type':'application/json', ...auth() },
            body: JSON.stringify({ isActive })
        });
        if (!res.ok) throw new Error('Update failed'); return res.json();
    },

};

