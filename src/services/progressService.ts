// src/services/progressService.ts
const API_BASE =
    (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000/api";

function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const progressService = {
    async getUserProgress(userId: string) {
        const res = await fetch(
            `${API_BASE.replace(/\/+$/, "")}/progress/user/${userId}`,
            {
                headers: { ...authHeaders() },
            }
        );
        if (!res.ok) throw new Error("Failed to get user progress");
        return res.json();
    },

    // ✅ NEW: get progress for the logged-in student via /progress/me
    async getMyProgress() {
        const res = await fetch(
            `${API_BASE.replace(/\/+$/, "")}/progress/me`,
            {
                headers: { ...authHeaders() },
            }
        );
        if (!res.ok) throw new Error("Failed to get my progress");
        return res.json();
    },

    async ping(
        lessonId: string,
        positionSec: number,
        durationSec: number,
        completed = false
    ) {
        const res = await fetch(
            `${API_BASE.replace(/\/+$/, "")}/progress/ping`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", ...authHeaders() },
                body: JSON.stringify({ lessonId, positionSec, durationSec, completed }),
            }
        );
        if (!res.ok) throw new Error("Failed to ping progress");
        return res.json();
    },
};
