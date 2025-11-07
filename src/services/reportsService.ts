// src/services/reportsService.ts
const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000/api";
function authHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export const reportsService = {
    async sessionTrend(sessionId: string) {
        const res = await fetch(`${API_BASE.replace(/\/+$/,'')}/reports/session/${sessionId}`, {
            headers: { ...authHeaders() }
        });
        if (!res.ok) throw new Error("Failed to fetch session trend");
        return res.json();
    },
    async learnerDaily(userId: string, from?: string, to?: string) {
        const url = new URL(`${API_BASE.replace(/\/+$/,'')}/reports/learner/${userId}/daily`);
        if (from) url.searchParams.set("from", from);
        if (to) url.searchParams.set("to", to);
        const res = await fetch(url.toString(), { headers: { ...authHeaders() } });
        if (!res.ok) throw new Error("Failed to fetch daily report");
        return res.json();
    }
};
