// src/services/notificationService.ts
import { api } from "./authService";

export type NotificationType =
    | "attention_alert"
    | "progress_update"
    | "quiz_result"
    | "general"
    | "system";

export interface NotificationSender {
    id: string;
    name: string;
    role: "admin" | "teacher" | "parent";
}

export interface NotificationRecipient {
    id: string;
    name: string;
    role: "parent" | "teacher";
}

export interface NotificationDto {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    purpose: "system" | "learning";
    isRead: boolean;
    sentAt: string;
    sender?: NotificationSender | null;
    recipient?: NotificationRecipient | null;
    recipientRole?: "parent" | "teacher";
}

export interface SendNotificationPayload {
    recipientIds: string[];
    recipientRole: "parent" | "teacher";
    type: NotificationType;
    title: string;
    message: string;
}

export interface NotificationRecipientDto {
    id: string;
    name: string;
    role: "parent" | "teacher";
}

export const notificationService = {
    async getReceived(): Promise<NotificationDto[]> {
        const res = await api.get("/notifications");
        return res.data;
    },

    async getSent(): Promise<NotificationDto[]> {
        const res = await api.get("/notifications/sent");
        return res.data;
    },

    async send(payload: SendNotificationPayload) {
        const res = await api.post("/notifications", payload);
        return res.data;
    },

    async markRead(id: string) {
        const res = await api.patch(`/notifications/${id}/read`, {});
        return res.data;
    },

    async markAllRead() {
        const res = await api.post("/notifications/mark-all-read", {});
        return res.data;
    },

    async getRecipients(role: "parent" | "teacher"): Promise<NotificationRecipientDto[]> {
        const res = await api.get("/notifications/recipients", {
            params: { role },
        });
        return res.data;
    },
};
