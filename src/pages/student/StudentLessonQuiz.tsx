// src/pages/student/StudentLessonQuiz.tsx
import { useCallback, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizPlayer from "@/components/student/QuizPlayer";
import EmotionTracker from "@/components/EmotionTracker";
import { ChevronLeft } from "lucide-react";

export default function StudentLessonQuiz() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();

    // ── Emotion tracker UI state (same feel as StudentLessonPlayer) ──
    const [emotionLabel, setEmotionLabel] = useState<string>("—");
    const [trackingActive, setTrackingActive] = useState(false);
    const [lowAttention, setLowAttention] = useState(false);
    const lowStartRef = useRef<number | null>(null);

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

    const onEmotionDetected = useCallback(
        (emotion: string, _confidence?: number, attentionScore?: number) => {
            setEmotionLabel(emotion || "neutral");

            if (typeof attentionScore === "number") {
                const clamp = Math.max(0, Math.min(1, attentionScore));
                const now = Date.now();

                // Low-attention streak: <0.4 for 15s
                if (clamp < 0.4) {
                    if (lowStartRef.current == null) lowStartRef.current = now;
                    const elapsed = (now - lowStartRef.current) / 1000;
                    setLowAttention(elapsed >= 15);
                } else {
                    lowStartRef.current = null;
                    setLowAttention(false);
                }
            }
        },
        []
    );

    const onTrackingChange = useCallback((running: boolean) => {
        setTrackingActive(running);
        if (running) {
            setEmotionLabel("neutral");
        } else {
            setEmotionLabel("");
            lowStartRef.current = null;
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
                                Noticing low attention. Let’s take a tiny break or try a different activity. ✨
                            </div>
                        )}

                        {trackingActive && (
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-3xl">{getEmotionEmoji(emotionLabel || "neutral")}</span>
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
        </div>
    );
}
