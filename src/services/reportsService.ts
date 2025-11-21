// src/services/reportsService.ts
const API_BASE =
    (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000/api";
const join = (b: string, p: string) =>
    `${b.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;
const auth = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
};

export type TeacherStudentSummary = {
    userId: string;
    name: string;
    email: string;
    lastActive: string;
    progressPercent: number;
    completedModules: number;
    totalModules: number;
};

export type QuizSummaryRow = {
    quizId: string;
    quizTitle: string;
    lessonId: string | null;
    attempts: number;
    completedAttempts: number;
    abandonedAttempts: number;
    bestScore: number;
    avgScore: number;
    lastScore: number;
    firstAttemptAt: string;
    lastAttemptAt: string;
    passedAttempts: number;
    passingScore: number;
};

export const reportsService = {
    learnerDaily: async (
        userId: string,
        params: { from?: string; to?: string; timezone?: string } = {}
    ) => {
        const qs = new URLSearchParams();
        if (params.from) qs.set("from", params.from);
        if (params.to) qs.set("to", params.to);
        if (params.timezone) qs.set("timezone", params.timezone);
        const res = await fetch(
            join(API_BASE, `/reports/learner/${userId}/daily?${qs.toString()}`),
            {
                headers: { "Content-Type": "application/json", ...auth() },
            }
        );
        if (!res.ok) throw new Error("Failed to fetch daily report");
        return res.json();
    },

    sessionTrend: async (sessionId: string) => {
        const res = await fetch(join(API_BASE, `/reports/session/${sessionId}`), {
            headers: auth(),
        });
        if (!res.ok) throw new Error("Failed to fetch session trend");
        return res.json();
    },

    progressByUser: async (userId: string) => {
        const res = await fetch(join(API_BASE, `/progress/user/${userId}`), {
            headers: auth(),
        });
        if (!res.ok) throw new Error("Failed to fetch user progress");
        return res.json();
    },

    sessionsByUser: async (userId: string) => {
        const res = await fetch(join(API_BASE, `/sessions/user/${userId}`), {
            headers: auth(),
        });
        if (!res.ok) throw new Error("Failed to fetch user sessions");
        return res.json();
    },

    // 🔹 Teacher view: list students with summary stats
    teacherStudents: async (): Promise<TeacherStudentSummary[]> => {
        const res = await fetch(join(API_BASE, `/teacher/students`), {
            headers: auth(),
        });
        if (!res.ok) throw new Error("Failed to fetch students");
        return res.json() as Promise<TeacherStudentSummary[]>;
    },

    // 🔹 Quiz summary for learner (teacher/parent)
    learnerQuizzes: async (
        userId: string,
        params: { from?: string; to?: string } = {}
    ): Promise<QuizSummaryRow[]> => {
        const qs = new URLSearchParams();
        if (params.from) qs.set("from", params.from);
        if (params.to) qs.set("to", params.to);
        const res = await fetch(
            join(API_BASE, `/reports/learner/${userId}/quizzes?${qs.toString()}`),
            {
                headers: { "Content-Type": "application/json", ...auth() },
            }
        );
        if (!res.ok) throw new Error("Failed to fetch quiz summary");
        return res.json() as Promise<QuizSummaryRow[]>;
    },
};
