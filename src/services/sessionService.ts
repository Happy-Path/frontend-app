// src/services/sessionService.ts
const API_BASE =
    (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000/api";

function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

const base = API_BASE.replace(/\/+$/, "");

export const sessionService = {
    async start(lessonId: string, deviceInfo?: Record<string, any>) {
        const res = await fetch(`${base}/sessions`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ lessonId, deviceInfo }),
        });
        if (!res.ok) throw new Error("Failed to start session");
        return res.json(); // { _id, ... }
    },

    async end(sessionId: string) {
        const res = await fetch(`${base}/sessions/${sessionId}/end`, {
            method: "POST",
            headers: { ...authHeaders() },
        });
        if (!res.ok) throw new Error("Failed to end session");
        return res.json();
    },

    async sendEvents(sessionId: string, events: any[]) {
        if (!events.length) return { inserted: 0 };
        const res = await fetch(`${base}/sessions/${sessionId}/events`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify(events),
        });
        if (!res.ok) throw new Error("Failed to send events");
        return res.json(); // { inserted }
    },

    async raiseAttentionAlert(
        sessionId: string,
        reason: "multiple_episodes" | "long_episode" | "student_break"
    ) {
        const res = await fetch(`${base}/sessions/${sessionId}/low-attention-alert`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...authHeaders() },
            body: JSON.stringify({ reason }),
        });
        if (!res.ok) throw new Error("Failed to send attention alert");
        return res.json();
    },
};
