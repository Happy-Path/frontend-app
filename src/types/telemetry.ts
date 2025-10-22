// types/telemetry.ts
export type EmotionLabel = "happy"|"surprise"|"neutral"|"fear"|"angry"|"sad"|"disgust";

export interface InferResponse {
    emotion: { label: EmotionLabel; scores: Record<string, number> };
    attention: { score: number; signals?: Record<string, unknown> };
    serverTs: number;
}
