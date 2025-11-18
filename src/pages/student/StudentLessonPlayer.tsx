// src/pages/student/StudentLessonPlayer.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EmotionTracker from '@/components/EmotionTracker';
import { sessionService } from '@/services/sessionService';
import { ChevronLeft, ChevronRight, GraduationCap, MoreHorizontal } from 'lucide-react';
import { progressService } from '@/services/progressService';
import QuizPlayer from "@/components/student/QuizPlayer";

type Lesson = {
    id: string;
    title: string;
    goal: string;
    description: string;
    category: string;
    level: string;
    video_id: string;
    status: 'draft' | 'published';
};

const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const join = (b: string, p: string) => `${b.replace(/\/+$/,'')}/${p.replace(/^\/+/, '')}`;

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function StudentLessonPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // ── Fetch lesson ───────────────────────────────────────────────
    const { data, isLoading, error } = useQuery({
        queryKey: ['lesson-by-id', id],
        queryFn: async (): Promise<Lesson> => {
            const res = await fetch(join(API_BASE, `/lessons/${id}`), {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Failed to load lesson');
            const json = await res.json();
            const l = json.lesson;
            return { id: l._id, ...l };
        },
        enabled: !!id,
    });

    // ── YouTube Player ─────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<any>(null);
    const [duration, setDuration] = useState(0);
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        if (window.YT?.Player) return;
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(s);
    }, []);

    useEffect(() => {
        if (!data?.video_id || !containerRef.current) return;

        const create = () => {
            if (playerRef.current) {
                try { playerRef.current.destroy(); } catch {}
                playerRef.current = null;
            }
            playerRef.current = new window.YT.Player(containerRef.current, {
                width: '100%',
                videoId: data.video_id,
                playerVars: { modestbranding: 1, rel: 0, playsinline: 1, autoplay: 1 },
                events: {
                    onReady: (e: any) => {
                        const d = Math.floor(e.target.getDuration?.() || 0);
                        setDuration(d);
                        e.target.playVideo?.();
                    },
                    onStateChange: (e: any) => {
                        const YT = window.YT;
                        if (e.data === YT.PlayerState.PLAYING) setIsPlaying(true);
                        if (e.data === YT.PlayerState.PAUSED || e.data === YT.PlayerState.ENDED) setIsPlaying(false);
                    },
                },
            });
        };

        if (window.YT?.Player) {
            create();
        } else {
            window.onYouTubeIframeAPIReady = () => create();
        }

        return () => {
            try { playerRef.current?.destroy?.(); } catch {}
            playerRef.current = null;
        };
    }, [data?.video_id]);

    useEffect(() => {
        const t = setInterval(() => {
            if (!playerRef.current) return;
            try {
                const ct = playerRef.current.getCurrentTime?.() || 0;
                const d = playerRef.current.getDuration?.() || duration;
                setCurrent(Math.floor(ct));
                if (!duration && d) setDuration(Math.floor(d));
            } catch {}
        }, 500);
        return () => clearInterval(t);
    }, [duration]);

    const percent = duration ? Math.min(100, Math.round((current / duration) * 100)) : 0;

    // ── Session + Telemetry (emotion & attention) ──────────────────
    const sessionIdRef = useRef<string | null>(null);
    const queueRef = useRef<any[]>([]);
    const flushTimerRef = useRef<number | null>(null);

    // Start session when lesson loads
    useEffect(() => {
        let mounted = true;
        const start = async () => {
            if (!data?.id) return;
            try {
                const s = await sessionService.start(data.id, {
                    ua: navigator.userAgent,
                    platform: navigator.platform,
                    lang: navigator.language
                });
                if (mounted) sessionIdRef.current = s._id;
            } catch (e) {
                console.error("Failed to start session:", e);
            }
        };
        start();
        return () => { mounted = false; };
    }, [data?.id]);

    // Flush queue to backend
    const flushEvents = useCallback(async (force = false) => {
        if (!sessionIdRef.current || (!queueRef.current.length && !force)) return;
        const toSend = queueRef.current.splice(0, queueRef.current.length);
        try {
            await sessionService.sendEvents(sessionIdRef.current, toSend);
        } catch (e) {
            // If send fails, push back to queue for next attempt
            queueRef.current.unshift(...toSend);
            console.error("Failed to send events:", e);
        }
    }, []);

    // Periodic flush (every 5s)
    useEffect(() => {
        flushTimerRef.current = window.setInterval(() => flushEvents(), 5000);
        const vis = () => { if (document.hidden) flushEvents(true); };
        document.addEventListener("visibilitychange", vis);
        window.addEventListener("beforeunload", () => { flushEvents(true); });

        return () => {
            if (flushTimerRef.current) window.clearInterval(flushTimerRef.current);
            document.removeEventListener("visibilitychange", vis);
        };
    }, [flushEvents]);

    // End session on unmount (and final flush)
    useEffect(() => {
        return () => {
            (async () => {
                await flushEvents(true);
                if (sessionIdRef.current) {
                    try { await sessionService.end(sessionIdRef.current); } catch (e) { /* ignore */ }
                }
            })();
        };
    }, [flushEvents]);

    // ── PROGRESS PING: send every 10s + on unmount/end ─────────────
    const pingTimerRef = useRef<number | null>(null);
    const lastPingRef = useRef<number>(0);

    const getPlayerTimes = useCallback(() => {
        if (!playerRef.current) return { pos: 0, dur: duration || 0 };
        try {
            const pos = Math.floor(playerRef.current.getCurrentTime?.() || 0);
            const dur = Math.floor(playerRef.current.getDuration?.() || duration || 0);
            return { pos, dur };
        } catch {
            return { pos: 0, dur: duration || 0 };
        }
    }, [duration]);

    const sendProgressPing = useCallback(async (forceComplete = false) => {
        if (!data?.id) return;
        const { pos, dur } = getPlayerTimes();
        const isComplete = forceComplete || (dur ? (pos / dur) >= 0.95 : false);
        try {
            await progressService.ping(data.id, pos, dur, isComplete);
        } catch (e) {
            console.error("progress ping failed", e);
        }
    }, [data?.id, getPlayerTimes]);

    useEffect(() => {
        const kick = window.setTimeout(() => sendProgressPing(), 1500);
        pingTimerRef.current = window.setInterval(() => {
            const now = Date.now();
            if (now - lastPingRef.current >= 10000) { // 10s
                lastPingRef.current = now;
                sendProgressPing();
            }
        }, 1000);

        const vis = () => { if (document.hidden) sendProgressPing(); };
        document.addEventListener("visibilitychange", vis);

        return () => {
            window.clearTimeout(kick);
            if (pingTimerRef.current) window.clearInterval(pingTimerRef.current);
            document.removeEventListener("visibilitychange", vis);
        };
    }, [sendProgressPing]);

    // ❗ FIXED: only one final ping, no forced completion
    useEffect(() => {
        return () => {
            // Final ping; completion is decided by pos/dur >= 95% inside sendProgressPing
            sendProgressPing();
        };
    }, [sendProgressPing]);

    // ── Emotion status UI state + simple low-attention cue ─────────
    const [emotionLabel, setEmotionLabel] = useState<string>('—');
    const [trackingActive, setTrackingActive] = useState(false);
    const [lowAttention, setLowAttention] = useState(false);
    const lowStartRef = useRef<number | null>(null);

    const getEmotionEmoji = (emotion: string) => {
        const e = (emotion || '').toLowerCase();
        const map: Record<string, string> = {
            happy: '😊', surprise: '😮', neutral: '😐', fear: '😨', angry: '😠', sad: '😢', disgust: '🤢',
        };
        return map[e] ?? '😊';
    };

    // Receive samples from EmotionTracker
    const onEmotionDetected = useCallback((emotion: string, _confidence?: number, attentionScore?: number) => {
        setEmotionLabel(emotion || 'neutral');

        // Queue emotion event
        queueRef.current.push({
            type: "emotion",
            emotion: { label: emotion || 'neutral' },
            ts: new Date().toISOString()
        });

        // Queue attention event if provided (0..1)
        if (typeof attentionScore === "number") {
            const clamp = Math.max(0, Math.min(1, attentionScore));
            queueRef.current.push({
                type: "attention",
                attention: { score: clamp },
                ts: new Date().toISOString()
            });

            // Low-attention streak: <0.4 for 15s
            const now = Date.now();
            if (clamp < 0.4) {
                if (lowStartRef.current == null) lowStartRef.current = now;
                const elapsed = (now - lowStartRef.current) / 1000;
                setLowAttention(elapsed >= 15);
            } else {
                lowStartRef.current = null;
                setLowAttention(false);
            }
        }
    }, []);

    // Track when the child starts/stops tracking (to show/hide status line)
    const onTrackingChange = useCallback((running: boolean) => {
        setTrackingActive(running);
        if (running) {
            setEmotionLabel('neutral'); // default status immediately on start
        } else {
            setEmotionLabel(''); // hide on pause/stop
            lowStartRef.current = null;
            setLowAttention(false);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="p-6">Loading…</div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="p-6">Lesson not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            {/* Top bar */}
            <div className="max-w-6xl mx-auto w-full px-4 md:px-6 mt-4">
                <div className="mb-4 rounded-2xl bg-[#E7F0F0] px-4 py-3 flex items-center justify-between">
                    <button
                        className="inline-flex items-center gap-2 text-gray-700 hover:underline"
                        onClick={() => navigate('/student')}
                    >
                        <GraduationCap className="h-5 w-5" />
                        Back to Lessons
                    </button>
                    <button
                        className="h-9 w-9 rounded-full bg-white shadow flex items-center justify-center"
                        aria-label="More"
                    >
                        <MoreHorizontal className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
            </div>

            {/* Main grid */}
            <div className="max-w-6xl mx-auto w-full px-4 md:px-6 mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                    {/* LEFT: video & controls */}
                    <div className="bg-[#FBF3DB] rounded-3xl p-4 md:p-6">
                        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">{data.title}</h1>

                        <div className="rounded-3xl overflow-hidden bg-black border border-black/10">
                            <div id="yt-player" ref={containerRef} className="w-full aspect-video" />
                        </div>

                        {/* Progress */}
                        <div className="mt-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Lesson Progress</div>
                            <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-green-300"
                                    style={{ width: `${percent}%`, transition: 'width .25s linear' }}
                                />
                            </div>
                            <div className="mt-1 text-xs text-gray-600">{percent}%</div>
                        </div>

                        {/* Navigation */}
                        <div className="mt-6 flex flex-col sm:flex-row gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => navigate('/student')}>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back to Lessons
                            </Button>
                            <Button className="flex-1" onClick={() => navigate('/student')}>
                                Next Lesson
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* RIGHT: emotion tracker (wider, 420px) */}
                    <div className="bg-[#B9DBFF] rounded-3xl p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">How you’re doing!</h2>

                        {/* Optional in-session cue */}
                        {lowAttention && (
                            <div className="mb-3 text-sm bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md px-3 py-2">
                                Noticing low attention. Let’s take a tiny break or try a different activity. ✨
                            </div>
                        )}

                        {/* Status shown ONLY when tracking; defaults to neutral on start */}
                        {trackingActive && (
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{getEmotionEmoji(emotionLabel || 'neutral')}</span>
                                <div>
                                    <div className="text-sm text-gray-700">
                                        You seem {emotionLabel || 'neutral'}!
                                    </div>
                                    <div className="text-xs text-gray-600">Live from camera</div>
                                </div>
                            </div>
                        )}

                        <Card className="mt-6 p-3">
                            <EmotionTracker
                                onEmotionDetected={onEmotionDetected}
                                onTrackingChange={onTrackingChange}
                                autoStart
                                controlsLocked
                            />
                        </Card>

                        <Card className="mt-6 p-3">
                            <h3 className="text-lg font-semibold mb-2">Lesson Quiz</h3>
                            <QuizPlayer lessonId={data.id} />
                        </Card>

                    </div>
                </div>
            </div>
        </div>
    );
}
