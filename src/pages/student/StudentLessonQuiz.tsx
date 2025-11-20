import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizPlayer from "@/components/student/QuizPlayer";
import EmotionTracker from "@/components/EmotionTracker";
import { ChevronLeft } from "lucide-react";

import { sessionService } from "@/services/sessionService";
import {
    microBreakService,
    MicroBreakItem,
} from "@/services/microBreakService";
import MicroBreakOverlay, {
    MicroBreakContentLite,
} from "@/components/student/MicroBreakOverlay";

const NEGATIVE_EMOTIONS = ["sad", "angry", "fear", "disgust"];

export default function StudentLessonQuiz() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();

    // ── Emotion tracker UI state ────────────────────────────────────
    const [emotionLabel, setEmotionLabel] = useState<string>("—");
    const [trackingActive, setTrackingActive] = useState(false);
    const [lowAttention, setLowAttention] = useState(false);
    const badStreakRef = useRef(0);

    const getEmotionEmoji = (emotion: string) => {
        const e = (emotion || "").toLowerCase();
        const map: Record<string, string> = {
            happy: "😊",
            surprise: "😮",
            neutral: "😐",
            fear: "😨",
            angry: "😠",
            sad: "😢",
            disgust: "🤢",
        };
        return map[e] ?? "😊";
    };

    // ── Load micro-break content (public library) ───────────────────
    const { data: microBreakItems = [] } = useQuery<MicroBreakItem[]>({
        queryKey: ["micro-breaks", "public"],
        queryFn: microBreakService.getPublic,
    });

    // ── Session + telemetry for quiz ────────────────────────────────
    const sessionIdRef = useRef<string | null>(null);
    const queueRef = useRef<any[]>([]);
    const flushTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (!lessonId) return;
        let mounted = true;
        (async () => {
            try {
                const s = await sessionService.start(lessonId, {
                    ua: navigator.userAgent,
                    platform: navigator.platform,
                    lang: navigator.language,
                    context: "quiz",
                });
                if (mounted) sessionIdRef.current = s._id;
            } catch (err) {
                console.error("Failed to start quiz session:", err);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [lessonId]);

    const flushEvents = useCallback(async (force = false) => {
        if (!sessionIdRef.current || (!queueRef.current.length && !force)) return;
        const toSend = queueRef.current.splice(0, queueRef.current.length);
        try {
            await sessionService.sendEvents(sessionIdRef.current, toSend);
        } catch (err) {
            console.error("Failed to send quiz events:", err);
            queueRef.current.unshift(...toSend);
        }
    }, []);

    useEffect(() => {
        flushTimerRef.current = window.setInterval(() => flushEvents(), 5000);
        const vis = () => {
            if (document.hidden) flushEvents(true);
        };
        document.addEventListener("visibilitychange", vis);
        window.addEventListener("beforeunload", () => {
            flushEvents(true);
        });

        return () => {
            if (flushTimerRef.current) window.clearInterval(flushTimerRef.current);
            document.removeEventListener("visibilitychange", vis);
        };
    }, [flushEvents]);

    useEffect(() => {
        return () => {
            (async () => {
                await flushEvents(true);
                if (sessionIdRef.current) {
                    try {
                        await sessionService.end(sessionIdRef.current);
                    } catch {
                        /* ignore */
                    }
                }
            })();
        };
    }, [flushEvents]);

    // ── Micro-break overlay state ───────────────────────────────────
    const [microBreakOpen, setMicroBreakOpen] = useState(false);
    const [microBreakContent, setMicroBreakContent] =
        useState<MicroBreakContentLite | null>(null);
    const microBreakCountRef = useRef(0);
    const microBreakStartRef = useRef<number | null>(null);
    const alertFlagsRef = useRef<{ multiple: boolean; long: boolean }>({
        multiple: false,
        long: false,
    });
    const lastStudentBreakAlertRef = useRef<number | null>(null);
    const microBreakActiveRef = useRef(false); // hard lock to avoid re-triggering


    const triggerMicroBreak = useCallback(() => {
        if (microBreakActiveRef.current) return; // 🔒 already active
        microBreakActiveRef.current = true;

        let chosenContent: MicroBreakContentLite;
        if (microBreakItems.length) {
            const chosen =
                microBreakItems[
                    Math.floor(Math.random() * Math.max(microBreakItems.length, 1))
                    ];
            chosenContent = {
                id: chosen.id,
                title: chosen.title,
                youtubeUrl: chosen.youtubeUrl,
                boosterText: chosen.boosterText,
            };
        } else {
            chosenContent = {
                id: "default",
                title: "Let’s take a tiny break",
                youtubeUrl: "",
                boosterText:
                    "You’re doing really well. Let’s breathe and then try the next part together.",
            };
        }

        setMicroBreakContent(chosenContent);
        setMicroBreakOpen(true);
        microBreakCountRef.current += 1;
        microBreakStartRef.current = Date.now();

        if (
            sessionIdRef.current &&
            microBreakCountRef.current >= 3 &&
            !alertFlagsRef.current.multiple
        ) {
            alertFlagsRef.current.multiple = true;
            sessionService
                .raiseAttentionAlert(sessionIdRef.current, "multiple_episodes")
                .catch((err: any) =>
                    console.error("quiz alert multiple_episodes failed", err)
                );
        }
    }, [microBreakItems]);

    const closeMicroBreak = useCallback(() => {
        setMicroBreakOpen(false);
        setMicroBreakContent(null);
        microBreakStartRef.current = null;
        microBreakActiveRef.current = false; // 🔓 unlock
    }, []);


    // Long-episode alert while overlay is open
    useEffect(() => {
        if (!microBreakOpen) return;
        const timer = window.setInterval(() => {
            if (
                !sessionIdRef.current ||
                !microBreakStartRef.current ||
                alertFlagsRef.current.long
            )
                return;
            const elapsed = (Date.now() - microBreakStartRef.current) / 1000;
            if (elapsed >= 60) {
                alertFlagsRef.current.long = true;
                sessionService
                    .raiseAttentionAlert(sessionIdRef.current, "long_episode")
                    .catch((err: any) =>
                        console.error("quiz alert long_episode failed", err)
                    );
            }
        }, 5000);
        return () => window.clearInterval(timer);
    }, [microBreakOpen]);

    // ── Emotion callbacks from tracker (same rules as lesson) ───────
    const onEmotionDetected = useCallback(
        (emotion: string, _confidence?: number, attentionScore?: number) => {
            const label = emotion || "neutral";
            setEmotionLabel(label);

            // queue emotion event
            queueRef.current.push({
                type: "emotion",
                emotion: { label },
                ts: new Date().toISOString(),
            });

            if (typeof attentionScore === "number") {
                const clamp = Math.max(0, Math.min(1, attentionScore));
                queueRef.current.push({
                    type: "attention",
                    attention: { score: clamp },
                    ts: new Date().toISOString(),
                });

                const isLowAttention = clamp <= 0.5;
                const isBadEmotion = NEGATIVE_EMOTIONS.includes(label.toLowerCase());
                const isBad = isLowAttention || isBadEmotion;

                if (isBad) {
                    badStreakRef.current += 1;
                } else {
                    badStreakRef.current = 0;
                }

                setLowAttention(badStreakRef.current >= 2);

                if (badStreakRef.current >= 3 && !microBreakOpen) {
                    triggerMicroBreak();
                }
            }
        },
        [microBreakOpen, triggerMicroBreak]
    );

    const onTrackingChange = useCallback((running: boolean) => {
        setTrackingActive(running);
        if (running) {
            setEmotionLabel("neutral");
        } else {
            setEmotionLabel("");
            badStreakRef.current = 0;
            setLowAttention(false);
        }
    }, []);

    if (!lessonId) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="p-6 max-w-3xl mx-auto">
                    <Card className="p-6">
                        <p className="text-red-600 text-sm">Missing lesson ID for quiz.</p>
                        <Button className="mt-4" onClick={() => navigate("/student")}>
                            Go back to My Lessons
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <div className="max-w-6xl mx-auto w-full px-4 md:px-6 mt-4 mb-10">
                {/* Top bar – same style as lesson player */}
                <div className="mb-4 rounded-2xl bg-[#E7F0F0] px-4 py-3 flex items-center justify-between">
                    <button
                        className="inline-flex items-center gap-2 text-gray-700 hover:underline"
                        onClick={() => navigate(`/student/lesson/${lessonId}`)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                        Back to Lesson
                    </button>
                </div>

                {/* Main grid – quiz left, emotion panel right */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
                    {/* LEFT: Quiz content */}
                    <div className="bg-white rounded-3xl p-4 md:p-6">
                        <QuizPlayer lessonId={lessonId} />
                    </div>

                    {/* RIGHT: Emotion tracker panel – same feel as lesson player */}
                    <div className="bg-[#B9DBFF] rounded-3xl p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4">
                            How you’re doing!
                        </h2>

                        {lowAttention && (
                            <div className="mb-3 text-sm bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md px-3 py-2">
                                Noticing low attention. Let’s take a tiny break or try a
                                different activity. ✨
                            </div>
                        )}

                        {trackingActive && (
                            <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">
                  {getEmotionEmoji(emotionLabel || "neutral")}
                </span>
                                <div>
                                    <div className="text-sm text-gray-700">
                                        You seem {emotionLabel || "neutral"}!
                                    </div>
                                    <div className="text-xs text-gray-600">Live from camera</div>
                                </div>
                            </div>
                        )}

                        <Card className="mt-3 p-3">
                            <EmotionTracker
                                onEmotionDetected={onEmotionDetected}
                                onTrackingChange={onTrackingChange}
                                autoStart
                                controlsLocked
                            />
                        </Card>
                    </div>
                </div>
            </div>

            {/* Micro-break overlay for quiz */}
            <MicroBreakOverlay
                open={microBreakOpen}
                content={microBreakContent || undefined}
                onContinue={() => {
                    closeMicroBreak();
                }}
                onSmallBreak={() => {
                    if (sessionIdRef.current) {
                        const now = Date.now();
                        if (
                            !lastStudentBreakAlertRef.current ||
                            now - lastStudentBreakAlertRef.current > 60_000
                        ) {
                            lastStudentBreakAlertRef.current = now;
                            sessionService
                                .raiseAttentionAlert(sessionIdRef.current, "student_break")
                                .catch((err: any) =>
                                    console.error("quiz alert student_break failed", err)
                                );
                        }
                    }
                    // overlay stays open; child can press “Okay, continue” later
                }}
            />
        </div>
    );
}
