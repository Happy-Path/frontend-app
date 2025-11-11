import { useEffect, useState } from 'react';
import { quizService } from '@/services/quizService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { safeId } from '@/utils/safeId';

type Opt = { id: string; labelText?: string; imageUrl?: string };
type Q = {
    _id?: string;
    type: "single" | "image";
    promptText?: string;
    promptImageUrl?: string;
    promptAudioUrl?: string;
    options: Opt[];
    correctOptionId: string;
    order: number;
};

export default function QuizBuilder({ lessonId, quizId, onSaved }: { lessonId: string; quizId?: string; onSaved?: () => void }) {
    const [title, setTitle] = useState("Quick Quiz");
    const [questions, setQuestions] = useState<Q[]>([]);
    const [loading, setLoading] = useState<boolean>(!!quizId);

    // seed or load
    useEffect(() => {
        let ignore = false;
        (async () => {
            if (!quizId) {
                setQuestions([{
                    type: "single",
                    promptText: "What color is the sky?",
                    options: [{ id: safeId(), labelText: "Blue" }, { id: safeId(), labelText: "Green" }],
                    correctOptionId: "",
                    order: 0
                }]);
                return;
            }
            try {
                setLoading(true);
                const q = await quizService.getTeacher(quizId);
                if (ignore) return;
                setTitle(q.title);
                setQuestions(
                    (q.questions || []).map((qq: any, idx: number) => ({
                        _id: qq._id,
                        type: qq.type,
                        promptText: qq.promptText,
                        promptImageUrl: qq.promptImageUrl,
                        promptAudioUrl: qq.promptAudioUrl,
                        options: (qq.options || []).map((o: any) => ({ id: o.id, labelText: o.labelText, imageUrl: o.imageUrl })),
                        correctOptionId: qq.correctOptionId,
                        order: qq.order ?? idx
                    }))
                );
            } catch {
                toast.error("Failed to load quiz");
            } finally {
                setLoading(false);
            }
        })();
        return () => { ignore = true; };
    }, [quizId]);

    const addQuestion = () => setQuestions(qs => [...qs, {
        type: "single",
        promptText: "",
        options: [{ id: safeId(), labelText: "Option A" }, { id: safeId(), labelText: "Option B" }],
        correctOptionId: "",
        order: qs.length
    }]);

    const updateQ = (i: number, patch: Partial<Q>) => setQuestions(qs => qs.map((q,idx) => idx===i ? { ...q, ...patch } : q));
    const updateOpt = (qi:number, oi:number, patch: Partial<Opt>) =>
        setQuestions(qs => qs.map((q,idx) => idx!==qi ? q : { ...q, options: q.options.map((o,j)=> j===oi ? { ...o, ...patch } : o) }));

    const addOpt = (qi:number) =>
        setQuestions(qs => qs.map((q,idx) => idx!==qi ? q : (q.options.length>=4 ? q : { ...q, options: [...q.options, { id: safeId(), labelText: "New option" }] })));

    const save = async () => {
        if (!lessonId) {
            toast.error("Please select a lesson before saving the quiz.");
            return;
        }
        const payload = {
            title,
            lessonId,
            isActive: true,
            settings: { allowRetry: true, maxAttempts: 3, shuffleOptions: true, passingScore: 60 },
            questions: questions.map((q, i) => ({
                _id: q._id,
                type: q.type,
                promptText: q.promptText,
                promptImageUrl: q.promptImageUrl,
                promptAudioUrl: q.promptAudioUrl,
                correctOptionId: q.correctOptionId || q.options[0]?.id,
                order: q.order ?? i,
                options: q.options.map(o => ({ id: o.id, labelText: o.labelText, imageUrl: o.imageUrl }))
            }))
        };
        try {
            if (quizId) await quizService.update(quizId, payload);
            else await quizService.create(payload);
            toast.success("Quiz saved");
            onSaved?.();
        } catch {
            toast.error("Failed to save quiz");
        }
    };

    if (loading) return <Card className="p-4">Loading…</Card>;

    return (
        <Card className="p-4 space-y-4">
            <div className="space-y-1">
                <Label>Quiz title</Label>
                <Input value={title} onChange={e=>setTitle(e.target.value)} />
            </div>

            {questions.map((q, i) => (
                <Card key={i} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="font-semibold">Question {i+1}</div>
                        <div className="text-xs text-gray-500">{q.type === 'image' ? 'Image choices' : 'Single choice'}</div>
                    </div>

                    <div className="space-y-1">
                        <Label>Prompt text</Label>
                        <Input value={q.promptText || ""} onChange={e=>updateQ(i,{ promptText: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {q.options.map((o, oi) => (
                            <div key={o.id} className="border rounded-lg p-3 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Option {oi+1}</Label>
                                    <label className="text-xs flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name={`correct-${i}`}
                                            checked={(q.correctOptionId || "") === o.id}
                                            onChange={()=>updateQ(i,{ correctOptionId: o.id })}
                                        />
                                        Correct
                                    </label>
                                </div>
                                <Input placeholder="Label" value={o.labelText || ""} onChange={e=>updateOpt(i,oi,{ labelText: e.target.value })}/>
                                <Input placeholder="Image URL (optional)" value={o.imageUrl || ""} onChange={e=>updateOpt(i,oi,{ imageUrl: e.target.value })}/>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={()=>addOpt(i)} disabled={q.options.length>=4}>Add Option</Button>
                    </div>
                </Card>
            ))}

            <div className="flex gap-2">
                <Button variant="outline" onClick={addQuestion}>Add Question</Button>
                <Button onClick={save}>{quizId ? 'Update Quiz' : 'Save Quiz'}</Button>
            </div>
        </Card>
    );
}
