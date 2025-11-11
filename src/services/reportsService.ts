// src/services/reportsService.ts
const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const join = (b: string, p: string) => `${b.replace(/\/+$/,'')}/${p.replace(/^\/+/, '')}`;
const auth = () => {
    const t = localStorage.getItem('token');
    return t ? { Authorization: `Bearer ${t}` } : {};
};

export const reportsService = {
    learnerDaily: async (userId: string, params: { from?: string; to?: string; timezone?: string } = {}) => {
        const qs = new URLSearchParams();
        if (params.from) qs.set('from', params.from);
        if (params.to) qs.set('to', params.to);
        if (params.timezone) qs.set('timezone', params.timezone);
        const res = await fetch(join(API_BASE, `/reports/learner/${userId}/daily?${qs.toString()}`), {
            headers: { 'Content-Type': 'application/json', ...auth() }
        });
        if (!res.ok) throw new Error('Failed to fetch daily report');
        return res.json();
    },

    sessionTrend: async (sessionId: string) => {
        const res = await fetch(join(API_BASE, `/reports/session/${sessionId}`), { headers: auth() });
        if (!res.ok) throw new Error('Failed to fetch session trend');
        return res.json();
    },

    progressByUser: async (userId: string) => {
        const res = await fetch(join(API_BASE, `/progress/user/${userId}`), { headers: auth() });
        if (!res.ok) throw new Error('Failed to fetch user progress');
        return res.json();
    },

    sessionsByUser: async (userId: string) => {
        const res = await fetch(join(API_BASE, `/sessions/user/${userId}`), { headers: auth() });
        if (!res.ok) throw new Error('Failed to fetch user sessions');
        return res.json();
    },

    teacherStudents: async () => {
        const res = await fetch(join(API_BASE, `/teacher/students`), { headers: auth() });
        if (!res.ok) throw new Error('Failed to fetch students');
        return res.json() as Promise<Array<{userId:string; display:string; lastSession:string}>>;
    }
};
