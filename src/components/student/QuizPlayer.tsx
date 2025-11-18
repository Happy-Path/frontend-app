// src/components/student/QuizPlayer.tsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { quizService, QuizDTO } from "@/services/quizService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import EmotionTracker from "@/components/EmotionTracker";

type Props = {
    lessonId: string;
    onDone?: (r: { scorePct: number; passed: boolean }) => void;
};

function speak(text: string) {
    try {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.9;
        utt.pitch = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
    } catch {}
}

type AnswerRecord = {
    selectedOptionId: string;
    timeTakenSec: number;
};

export default function QuizPlayer({ lessonId, onDone }: Props) {
    const navigate = useNavigate();

    const {
        data: quizzes = [],
        isLoading,
    } = useQuery<QuizDTO[]>({
        queryKey: ["quiz-by-lesson", lessonId],
        queryFn: () => quizService.getByLesson(lessonId),
        enabled: !!lessonId,
    });

    // Which quiz and which question we are on
    const [quizIdx, setQuizIdx] = useState(0);
    const [questionIdx, setQuestionIdx] = useState(0);

    // Collected answers for the *current* quiz, keyed by questionId
    const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});

    // Feedback popup state
    const [feedback, setFeedback] = useState<{ open: boolean; correct: boolean } | null>(null);
    const feedbackTimerRef = useRef<number | null>(null);

    // Track per-question start time for timeTakenSec
    const qTimeRef = useRef<number>(Date.now());

    // ── Emotion Tracker UI state (same pattern as LessonPlayer) ─────
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

    // Reset when lesson or quiz list changes
    useEffect(() => {
        setQuizIdx(0);
        setQuestionIdx(0);
        setAnswers({});
        setFeedback(null);
        qTimeRef.current = Date.now();
    }, [lessonId, quizzes.length]);

    const activeQuiz: QuizDTO | undefined = quizzes[quizIdx];
    const questions = activeQuiz?.questions ?? [];
    const currentQuestion = questions[questionIdx];

    // Total questions across all quizzes for global progress
    const totalQuestions = useMemo(
        () => quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0),
        [quizzes]
    );

    const currentFlatIndex = useMemo(() => {
        if (!quizzes.length) return 0;
        let offset = 0;
        for (let i = 0; i < quizIdx; i++) {
            offset += quizzes[i].questions?.length || 0;
        }
        return offset + questionIdx;
    }, [quizzes, quizIdx, questionIdx]);

    const pct = totalQuestions ? Math.round((currentFlatIndex / totalQuestions) * 100) : 0;

    // Speak question + options whenever we move to a new question
    useEffect(() => {
        if (!currentQuestion) return;
        qTimeRef.current = Date.now();
        const t = [
            currentQuestion.promptText,
            ...(currentQuestion.options?.map((o) => o.labelText || "") || []),
        ]
            .filter(Boolean)
            .join(". ");
        if (t) speak(t);
    }, [quizIdx, questionIdx, currentQuestion?._id]);

    // Submit current quiz attempt to backend
    const submitCurrentQuizAttempt = () => {
        const quiz = quizzes[quizIdx];
        if (!quiz) return;

        const payload = quiz.questions.map((qq) => {
            const a = answers[qq._id];
            return {
                questionId: qq._id,
                selectedOptionId: a?.selectedOptionId || "",
                timeTakenSec: a?.timeTakenSec ?? 0,
            };
        });

        quizService
            .submitAttempt(quiz._id, payload)
            .then((r) => {
                const isLastQuiz = quizIdx === quizzes.length - 1;
                if (isLastQuiz && onDone) {
                    onDone({ scorePct: r.scorePct, passed: r.passed });
                }
            })
            .catch((err) => {
                console.error("Failed to submit quiz attempt", err);
            });
    };

    const advanceFlow = () => {
        const quiz = quizzes[quizIdx];
        const qs = quiz?.questions ?? [];
        const isLastQuestionInQuiz = questionIdx === qs.length - 1;
        const isLastQuiz = quizIdx === quizzes.length - 1;

        if (isLastQuestionInQuiz) {
            // Submit attempt for this quiz
            submitCurrentQuizAttempt();
        }

        if (isLastQuestionInQuiz && isLastQuiz) {
            // All quizzes finished → go home
            navigate("/student");
            return;
        }

        if (isLastQuestionInQuiz) {
            // Move to next quiz
            setQuizIdx((prev) => prev + 1);
            setQuestionIdx(0);
            setAnswers({});
            qTimeRef.current = Date.now();
        } else {
            // Next question in current quiz
            setQuestionIdx((prev) => prev + 1);
        }
    };

    const closeFeedback = () => {
        if (feedbackTimerRef.current) {
            window.clearTimeout(feedbackTimerRef.current);
            feedbackTimerRef.current = null;
        }
        setFeedback(null);
        advanceFlow();
    };

    const select = (optId: string) => {
        if (!currentQuestion || !activeQuiz) return;
        // Ignore clicks while feedback visible
        if (feedback?.open) return;

        const now = Date.now();
        const timeTakenSec = Math.max(0, Math.round((now - qTimeRef.current) / 1000));

        // Store answer for this question
        setAnswers((prev) => ({
            ...prev,
            [currentQuestion._id]: {
                selectedOptionId: optId,
                timeTakenSec,
            },
        }));

        const isCorrect = optId === currentQuestion.correctOptionId;
        setFeedback({ open: true, correct: isCorrect });

        // Auto-close after 2.5s if not closed manually
        const timerId = window.setTimeout(() => {
            closeFeedback();
        }, 2500);
        feedbackTimerRef.current = timerId;
    };

    if (isLoading) return <Card className="p-4">Loading quiz…</Card>;

    if (!quizzes.length || !activeQuiz || !currentQuestion) {
        return <Card className="p-4">No quiz available for this lesson yet.</Card>;
    }

    return (
        <>
            <div className="space-y-4">
                {/* QUIZ CARD */}
                <Card className="p-4 bg-white rounded-2xl relative">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h3 className="text-xl font-semibold">{activeQuiz.title || "Quiz"}</h3>
                            <div className="text-xs text-gray-500 mt-1">
                                Quiz {quizIdx + 1} of {quizzes.length}
                            </div>
                        </div>
                        <div className="w-40">
                            <Progress value={pct} />
                            <div className="text-xs text-gray-600 mt-1">
                                Question {questionIdx + 1} of {questions.length}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Prompt */}
                        <div className="rounded-xl bg-happy-50 p-4">
                            {currentQuestion.promptImageUrl && (
                                <img
                                    src={currentQuestion.promptImageUrl}
                                    alt=""
                                    className="max-h-40 mx-auto mb-2 object-contain"
                                />
                            )}
                            <p className="text-lg text-center font-medium">
                                {currentQuestion.promptText}
                            </p>
                        </div>

                        {/* Options — large, high-contrast cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentQuestion.options.map((o) => (
                                <button
                                    key={o.id}
                                    onClick={() => select(o.id)}
                                    className={`rounded-2xl border-2 p-4 min-h-[96px] flex flex-col items-center justify-center gap-2 focus:outline-none
                    border-gray-300 bg-white hover:bg-gray-50
                  `}
                                >
                                    {o.imageUrl && (
                                        <img
                                            src={o.imageUrl}
                                            alt=""
                                            className="h-20 object-contain"
                                        />
                                    )}
                                    {o.labelText && (
                                        <span className="text-lg font-semibold">
                      {o.labelText}
                    </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* EMOTION TRACKER CARD (same feel as LessonPlayer) */}
                <Card className="p-4 bg-white rounded-2xl">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-3">
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

                    <div className="mt-3">
                        <EmotionTracker
                            onEmotionDetected={onEmotionDetected}
                            onTrackingChange={onTrackingChange}
                            autoStart
                            controlsLocked
                        />
                    </div>
                </Card>
            </div>

            {/* Feedback popup */}
            {feedback?.open && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <Card className="p-6 w-72 text-center">
                        <div
                            className={`text-xl font-bold ${
                                feedback.correct ? "text-green-600" : "text-red-600"
                            }`}
                        >
                            {feedback.correct ? "Correct! 🎉" : "Not quite right"}
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                            {feedback.correct
                                ? "Great job! Let’s move to the next one."
                                : "That answer was not correct. Let’s keep trying!"}
                        </p>
                        <Button className="mt-4 w-full" onClick={closeFeedback}>
                            OK
                        </Button>
                    </Card>
                </div>
            )}
        </>
    );
}
