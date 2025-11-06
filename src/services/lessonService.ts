// src/services/lessonService.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function joinUrl(base: string, path: string) {
    return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

function getAuthToken() {
    return localStorage.getItem('token');
}

export type CreateLessonPayload = {
    title: string;
    description: string;
    goal: string;
    category: 'numbers' | 'letters' | 'colors' | 'shapes' | 'emotions';
    level: 'beginner' | 'intermediate' | 'advanced';
    video_url: string;
    status: 'draft' | 'published';
};

export async function listLessons(params?: { status?: string; page?: number; limit?: number }) {
    const token = getAuthToken();
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));

    const res = await fetch(joinUrl(API_BASE_URL, `/lessons?${q.toString()}`), {
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load lessons');

    const json = await res.json(); // { items, total, page, pages }
    const items = (json.items || []).map((l: any) => ({ id: l._id, ...l }));
    return { ...json, items };
}

export async function createLesson(payload: CreateLessonPayload) {
    const token = getAuthToken();
    const res = await fetch(joinUrl(API_BASE_URL, '/lessons'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to create lesson');
    const { lesson } = await res.json();
    return { lesson: { id: lesson._id, ...lesson } };
}

export async function updateLesson(id: string, payload: CreateLessonPayload) {
    const token = getAuthToken();
    const res = await fetch(joinUrl(API_BASE_URL, `/lessons/${id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to update lesson');
    const { lesson } = await res.json();
    return { lesson: { id: lesson._id, ...lesson } };
}

// List only published lessons (for students/children)
export async function listPublishedLessons(params?: { category?: string; page?: number; limit?: number }) {
    const token = localStorage.getItem('token'); // child's or parent's JWT
    const q = new URLSearchParams();
    q.set('status', 'published'); // only published lessons
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    // category can be filtered client-side (simpler, fewer backend changes)

    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const url = `${base.replace(/\/+$/, '')}/lessons?${q.toString()}`;

    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to load lessons');

    const json = await res.json(); // { items, total, page, pages }
    const items = (json.items || []).map((l: any) => ({ id: l._id, ...l }));
    return { ...json, items };
}

// (needs backend DELETE /api/lessons/:id)
export async function deleteLesson(id: string) {
    const token = getAuthToken();
    const res = await fetch(joinUrl(API_BASE_URL, `/lessons/${id}`), {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to delete lesson');
    return true;
}
