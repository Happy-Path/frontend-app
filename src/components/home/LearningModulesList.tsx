// src/components/student/LearningModulesList.tsx
import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen } from "lucide-react";
import { listPublishedLessons } from "@/services/lessonService";
import type { Lesson } from "@/types/lesson";
import StudentLessonCard from "./StudentLessonCard";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const CATEGORIES = [
    "all",
    "numbers",
    "letters",
    "emotions",
    "colors",
    "shapes",
] as const;
type Cat = (typeof CATEGORIES)[number];

const LearningModulesList = () => {
    const [filter, setFilter] = useState<Cat>("all");
    const [showAll, setShowAll] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["student-lessons", "published"],
        queryFn: () => listPublishedLessons({ page: 1, limit: 50 }),
    });

    const lessons: Lesson[] = data?.items ?? [];

    const filtered = useMemo(
        () => lessons.filter((l) => (filter === "all" ? true : l.category === filter)),
        [lessons, filter]
    );

    const handleViewAllClick = () => {
        setFilter("all"); // ensure "All" is active
        setShowAll(true); // open popup
    };

    const renderGrid = (items: Lesson[]) => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="bg-slate-100/80 animate-pulse h-52 rounded-xl"
                    />
                ))
            ) : items.length === 0 ? (
                <p className="col-span-2 text-center py-10 text-slate-500">
                    No lessons found in this category.
                </p>
            ) : (
                items.map((lesson) => (
                    <StudentLessonCard key={lesson.id} lesson={lesson} />
                ))
            )}
        </div>
    );

    return (
        <>
            <div className="bg-white/90 border border-slate-100 p-6 rounded-2xl shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-happy-700">Learning Modules</h2>
                        <p className="text-sm text-slate-500">
                            Pick a topic and continue your learning journey.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-happy-200 text-happy-700 hover:bg-happy-50"
                        onClick={handleViewAllClick}
                    >
                        View all modules
                        <BookOpen className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                {/* Category tabs */}
                <Tabs value={filter} className="mb-4">
                    <TabsList className="grid grid-cols-3 sm:grid-cols-6 rounded-xl bg-happy-50/70 p-1">
                        {CATEGORIES.map((c) => (
                            <TabsTrigger
                                key={c}
                                value={c}
                                onClick={() => setFilter(c)}
                                className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-happy-700 data-[state=active]:shadow-sm"
                            >
                                {c[0].toUpperCase() + c.slice(1)}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <TabsContent value={filter} />
                </Tabs>

                {/* Scrollable area on the main card */}
                <div className="max-h-[420px] overflow-y-auto pr-1">
                    {renderGrid(filtered)}
                </div>
            </div>

            {/* View All popup – DialogContent now scrollable */}
            <Dialog open={showAll} onOpenChange={setShowAll}>
                <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-2">
                        <DialogTitle>All Learning Modules</DialogTitle>
                        <DialogDescription>
                            Browse every available module. Use categories to narrow down.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Tabs inside dialog (same filter state) */}
                    <div className="mt-3 space-y-4">
                        <Tabs value={filter}>
                            <TabsList className="grid grid-cols-3 sm:grid-cols-6 rounded-xl bg-happy-50/80 p-1">
                                {CATEGORIES.map((c) => (
                                    <TabsTrigger
                                        key={c}
                                        value={c}
                                        onClick={() => setFilter(c)}
                                        className="text-xs sm:text-sm rounded-lg data-[state=active]:bg-white data-[state=active]:text-happy-700 data-[state=active]:shadow-sm"
                                    >
                                        {c[0].toUpperCase() + c.slice(1)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <TabsContent value={filter} />
                        </Tabs>

                        {/* This region scrolls with the dialog since the wrapper is overflow-y-auto */}
                        <div className="pb-4">{renderGrid(filtered)}</div>

                        <div className="pt-2 flex justify-end">
                            <Button variant="outline" size="sm" onClick={() => setShowAll(false)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default LearningModulesList;
