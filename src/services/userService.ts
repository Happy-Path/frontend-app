// src/services/userService.ts
const API_BASE_URL =
    (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';

type Role = 'teacher' | 'parent';
export type UserLite = { _id: string; name?: string; email?: string; role: Role };

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers || {}),
    };
    const res = await fetch(input, { ...init, headers });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    return res.json() as Promise<T>;
}

export const userService = {
    list: (opts: { role?: Role; q?: string; limit?: number }) => {
        const params = new URLSearchParams();
        if (opts.role) params.set('role', opts.role);
        if (opts.q) params.set('q', opts.q);
        if (opts.limit) params.set('limit', String(opts.limit));
        return http<UserLite[]>(`${API_BASE_URL}/users?${params.toString()}`);
    },
};
