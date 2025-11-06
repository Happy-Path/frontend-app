import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import EmotionTracker from '@/components/EmotionTracker';
import { ArrowLeft, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

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
    const { id } = useParams();     // Mongo _id
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // ── Fetch lesson by id ───────────────────────────────────────────────
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

    // ── YouTube Player state / progress ──────────────────────────────────
    const containerRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<any>(null);
    const [duration, setDuration] = useState(0);
    const [current, setCurrent] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // load YT script once
    useEffect(() => {
        if (window.YT?.Player) return;
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(s);
    }, []);

    // create player when lesson is ready
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
                playerVars: {
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                    autoplay: 1,
                },
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
                    }
                }
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

    // tick current time while playing
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

    // ── Emotion / attention (from your existing component) ───────────────
    const [emotionLabel, setEmotionLabel] = useState<string>('—');
    const [attentionStars, setAttentionStars] = useState<number>(0); // 0..3

    const onEmotionDetected = useCallback((emotion: string, confidence: number, attentionScore: number) => {
        setEmotionLabel(emotion);
        // map attentionScore 0..100 to 0..3 stars
        const stars = Math.max(0, Math.min(3, Math.round((attentionScore / 100) * 3)));
        setAttentionStars(stars);
        // TODO: optionally POST progress/emotion events to your backend here
    }, []);

    if (isLoading) return <div className="p-6">Loading…</div>;
    if (error || !data) return <div className="p-6">Lesson not found</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6">
            {/* Top bar */}
            <div className="mb-4 rounded-2xl bg-[#E7F0F0] px-4 py-3 flex items-center justify-between">
                <Link to="/student" className="inline-flex items-center gap-2 text-gray-700 hover:underline">
                    <GraduationCap className="h-5 w-5" />
                    Back to Lessons
                </Link>
                <button
                    className="h-9 w-9 rounded-full bg-white shadow flex items-center justify-center"
                    onClick={() => {/* put menu/actions here */}}
                    aria-label="More"
                >
                    •••
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
                {/* LEFT: video + controls */}
                <div className="bg-[#FBF3DB] rounded-3xl p-4 md:p-6">
                    <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
                        {data.title}
                    </h1>

                    <div className="rounded-3xl overflow-hidden bg-black border border-black/10">
                        {/* YouTube player mounts into this div */}
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

                    {/* Nav buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Previous Lesson
                        </Button>
                        <Button className="flex-1" onClick={() => navigate('/student')}>
                            Next Lesson
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* RIGHT: emotion/attention card */}
                <div className="bg-[#B9DBFF] rounded-3xl p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">How you’re doing!</h2>

                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">😊</span>
                        <div>
                            <div className="text-sm text-gray-700">You seem {emotionLabel || '—'}!</div>
                            <div className="text-xs text-gray-600">Live from camera</div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-sm font-semibold text-gray-800 mb-2">Your Attention</div>
                        <div className="flex items-center gap-2 text-xl">
                            <span className={attentionStars >= 1 ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                            <span className={attentionStars >= 2 ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                            <span className={attentionStars >= 3 ? 'text-yellow-500' : 'text-gray-300'}>★</span>
                        </div>
                    </div>

                    {/* Emotion tracker component (camera, face/emotion detection) */}
                    <Card className="mt-6 p-3">
                        <EmotionTracker onEmotionDetected={onEmotionDetected} />
                    </Card>
                </div>
            </div>
        </div>
    );
}
