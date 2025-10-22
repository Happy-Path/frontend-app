import { useEffect, useRef } from 'react';
import { apiClient } from '@/services/api';

export function useTelemetry(sessionId: string) {
    const timer = useRef<number>();

    useEffect(() => {
        const tick = async () => {
            const v = document.querySelector<HTMLVideoElement>('video');
            if (!v) return;

            const c = document.createElement('canvas');
            c.width = 224; c.height = 224;
            c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
            const frameBase64 = c.toDataURL('image/jpeg', 0.6);

            const res = await apiClient.infer(frameBase64, sessionId);

            await apiClient.logEvent(sessionId, {
                type: 'attention',
                attention: { score: res.attention.score, signals: res.attention.signals },
                metadata: { latencyMs: Date.now() - res.serverTs }
            });

            await apiClient.logEvent(sessionId, {
                type: 'emotion',
                emotion: { label: res.emotion.label, scores: res.emotion.scores }
            });
        };

        timer.current = window.setInterval(tick, 1500) as unknown as number;
        return () => clearInterval(timer.current);
    }, [sessionId]);
}
