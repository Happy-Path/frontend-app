// src/services/parentService.ts
import { api } from "./api";

export type ParentChildSummary = {
    id: string;        // assignment id
    studentId: string; // child user id
    name: string;
    email: string;
};

export type ParentQuizQuestion = {
    id: string;
    question: string;
    answer: string;
    correct: boolean;
};

export type ParentQuizResult = {
    id: string;               // attempt id
    moduleId: string;         // lessonId / moduleId
    moduleName: string;       // human-friendly name if backend provides it
    date: string;             // ISO
    score: number;            // 0–100
    totalQuestions: number;
    correctAnswers: number;
    timeSpent: number | null; // minutes (optional)
    questions: ParentQuizQuestion[];
};

export const parentService = {
    // children assigned to logged-in parent
    async myChildren(): Promise<ParentChildSummary[]> {
        return api.get<ParentChildSummary[]>("/parent/children");
    },

    // quiz history for a specific child (backend: GET /parent/children/:studentId/quizzes)
    async childQuizResults(studentId: string): Promise<ParentQuizResult[]> {
        return api.get<ParentQuizResult[]>(
            `/parent/children/${studentId}/quizzes`
        );
    },
};
