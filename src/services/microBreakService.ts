// src/services/microBreakService.ts
const API_BASE =
    (import.meta as any).env.VITE_API_BASE_URL || "http://localhost:5000/api";

const join = (b: string, p: string) =>
    `${b.replace(/\/+$/, "")}/${p.replace(/^\/+/, "")}`;

const auth = () => {
    const t = localStorage.getItem("token");
    return t ? { Authorization: `Bearer ${t}` } : {};
};

export type MicroBreakItem = {
    id: string;
    title: string;
    youtubeUrl: string;
    boosterText: string;
    isActive?: boolean;
};

export const microBreakService = {
    // For students – public active items
    async getPublic(): Promise<MicroBreakItem[]> {
        const res = await fetch(join(API_BASE, "/micro-breaks/public"), {
            headers: auth(),
        });
        if (!res.ok) throw new Error("Failed to load micro-break content");
        return res.json();
    },

    // For teachers – full list
    async list(): Promise<MicroBreakItem[]> {
        const res = await fetch(join(API_BASE, "/micro-breaks"), {
            headers: auth(),
        });
        if (!res.ok) throw new Error("Failed to load micro-break content");
        return res.json();
    },

    async create(payload: { title: string; youtubeUrl: string; boosterText: string }) {
        const res = await fetch(join(API_BASE, "/micro-breaks"), {
            method: "POST",
            headers: { "Content-Type": "application/json", ...auth() },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async update(id: string, payload: Partial<MicroBreakItem>) {
        const res = await fetch(join(API_BASE, `/micro-breaks/${id}`), {
            method: "PUT",
            headers: { "Content-Type": "application/json", ...auth() },
            body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },

    async remove(id: string) {
        const res = await fetch(join(API_BASE, `/micro-breaks/${id}`), {
            method: "DELETE",
            headers: auth(),
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
};
