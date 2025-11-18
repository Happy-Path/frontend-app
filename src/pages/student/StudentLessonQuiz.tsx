// src/pages/student/StudentLessonQuiz.tsx
import { useParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import QuizPlayer from "@/components/student/QuizPlayer";
import { ChevronLeft } from "lucide-react";

export default function StudentLessonQuiz() {
    const { lessonId } = useParams<{ lessonId: string }>();
    const navigate = useNavigate();

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

            <div className="max-w-4xl mx-auto w-full px-4 md:px-6 mt-4 mb-10">
                {/* Top bar */}
                <div className="mb-4 rounded-2xl bg-[#E7F0F0] px-4 py-3 flex items-center justify-between">
                    <button
                        className="inline-flex items-center gap-2 text-gray-700 hover:underline"
                        onClick={() => navigate(`/student/lesson/${lessonId}`)}
                    >
                        <ChevronLeft className="h-5 w-5" />
                        Back to Lesson
                    </button>
                </div>

                {/* Quiz card */}
                <QuizPlayer lessonId={lessonId} />
            </div>
        </div>
    );
}
