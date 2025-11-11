import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { quizService, QuizDTO } from '@/services/quizService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Props = { lessonId: string; onDone?: (r:{scorePct:number; passed:boolean}) => void };

function speak(text: string) {
    try {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = 0.9; utt.pitch = 1.0;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utt);
    } catch {}
}

export default function QuizPlayer({ lessonId, onDone }: Props) {
    const { data: quiz, isLoading } = useQuery({
        queryKey: ['quiz-by-lesson', lessonId],
        queryFn: () => quizService.getByLesson(lessonId),
        enabled: !!lessonId
    });

    const [idx, setIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string,string>>({});
    const [timeStarted, setTimeStarted] = useState<number>(Date.now());
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{scorePct:number; passed:boolean}|null>(null);
    const qTimeRef = useRef<number>(Date.now());

    useEffect(() => { setIdx(0); setAnswers({}); setResult(null); setTimeStarted(Date.now()); }, [lessonId, quiz?._id]);

    const q = useMemo(() => quiz?.questions?.[idx] as QuizDTO["questions"][number] | undefined, [quiz, idx]);
    const total = quiz?.questions.length || 0;
    const pct = total ? Math.round(((idx) / total) * 100) : 0;

    useEffect(() => {
        if (!q) return;
        qTimeRef.current = Date.now();
        const t = [q.promptText, ...(q.options?.map(o => o.labelText || "") || [])]
            .filter(Boolean)
            .join(". ");
        if (t) speak(t);
    }, [q?._id]);

    if (isLoading) return <Card className="p-4">Loading quiz…</Card>;
    if (!quiz) return <Card className="p-4">No quiz available for this lesson yet.</Card>;

    const select = (optId: string) => {
        if (!q) return;
        setAnswers(prev => ({ ...prev, [q._id]: optId }));
    };

    const next = () => setIdx(i => Math.min(i+1, total-1));
    const prev = () => setIdx(i => Math.max(i-1, 0));

    const submit = async () => {
        if (!quiz) return;
        setSubmitting(true);
        try {
            const payload = quiz.questions.map(qq => ({
                questionId: qq._id,
                selectedOptionId: answers[qq._id],
                timeTakenSec: Math.max(0, Math.round((Date.now() - qTimeRef.current)/1000))
            }));
            const r = await quizService.submitAttempt(quiz._id, payload);
            setResult({ scorePct: r.scorePct, passed: r.passed });
            onDone?.({ scorePct: r.scorePct, passed: r.passed });
        } catch (e) {
            console.error(e);
            alert("Failed to submit attempt");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="p-4 bg-white rounded-2xl">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-semibold">{quiz.title}</h3>
                <div className="w-40">
                    <Progress value={pct} />
                    <div className="text-xs text-gray-600 mt-1">Question {idx+1} / {total}</div>
                </div>
            </div>

            {result ? (
                <div className="text-center py-8">
                    <div className="text-3xl font-bold">{result.scorePct}%</div>
                    <div className={`mt-2 text-lg ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                        {result.passed ? 'Great job! 🎉' : 'Nice try! You can try again.'}
                    </div>
                </div>
            ) : q ? (
                <div className="space-y-4">
                    {/* Prompt */}
                    <div className="rounded-xl bg-happy-50 p-4">
                        {q.promptImageUrl && (
                            <img src={q.promptImageUrl} alt="" className="max-h-40 mx-auto mb-2 object-contain" />
                        )}
                        <p className="text-lg text-center font-medium">{q.promptText}</p>
                    </div>

                    {/* Options — large, high-contrast cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {q.options.map(o => {
                            const selected = answers[q._id] === o.id;
                            return (
                                <button
                                    key={o.id}
                                    onClick={() => select(o.id)}
                                    className={`rounded-2xl border-2 p-4 min-h-[96px] flex flex-col items-center justify-center gap-2 focus:outline-none
                    ${selected ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white hover:bg-gray-50'}
                  `}
                                >
                                    {o.imageUrl && <img src={o.imageUrl} alt="" className="h-20 object-contain" />}
                                    {o.labelText && <span className="text-lg font-semibold">{o.labelText}</span>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Nav */}
                    <div className="flex gap-2 justify-between pt-2">
                        <Button variant="outline" onClick={prev} disabled={idx===0}>Back</Button>
                        {idx < total-1 ? (
                            <Button onClick={next} disabled={!answers[q._id]}>Next</Button>
                        ) : (
                            <Button onClick={submit} disabled={submitting || !answers[q._id]}>
                                {submitting ? 'Submitting…' : 'Submit'}
                            </Button>
                        )}
                    </div>
                </div>
            ) : null}
        </Card>
    );
}
