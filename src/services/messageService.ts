// src/services/messageService.ts
const API_BASE_URL =
    (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';

type Conversation = {
    _id: string;
    participants: Array<{ userId: string; role: 'teacher' | 'parent' }>;
    childId?: string;
    lastMessageAt: string;
    lastMessagePreview?: string;
};

type Message = {
    _id: string;
    conversationId: string;
    senderId: string;
    senderRole: 'teacher' | 'parent';
    text: string;
    readBy: string[];
    createdAt: string;
    updatedAt: string;
};

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    // If you already attach the JWT elsewhere, swap this for your helper.
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

export const messageService = {
    listConversations: () =>
        http<Conversation[]>(`${API_BASE_URL}/messages/conversations`),

    createConversation: (peerUserId: string, childId?: string) =>
        http<Conversation>(`${API_BASE_URL}/messages/conversations`, {
            method: 'POST',
            body: JSON.stringify({ peerUserId, childId }),
        }),

    getMessages: (conversationId: string, page = 1, limit = 30) =>
        http<{ items: Message[] }>(
            `${API_BASE_URL}/messages/${conversationId}?page=${page}&limit=${limit}`
        ),

    sendMessage: (conversationId: string, text: string) =>
        http<Message>(`${API_BASE_URL}/messages/${conversationId}`, {
            method: 'POST',
            body: JSON.stringify({ text }),
        }),

    markRead: (conversationId: string) =>
        http<{ ok: true }>(`${API_BASE_URL}/messages/${conversationId}/read`, {
            method: 'POST',
        }),

    unreadCount: () =>
        http<{ count: number }>(`${API_BASE_URL}/messages/unread/count`),
};
