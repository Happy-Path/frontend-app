// src/components/student/LearningModulesList.tsx
import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';
import { listPublishedLessons } from '@/services/lessonService';
import type { Lesson } from '@/types/lesson';
import StudentLessonCard from './StudentLessonCard';

const CATEGORIES = ['all','numbers','letters','emotions','colors','shapes'] as const;
type Cat = typeof CATEGORIES[number];

const LearningModulesList = () => {
  const [filter, setFilter] = useState<Cat>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['student-lessons', 'published'],
    queryFn: () => listPublishedLessons({ page: 1, limit: 50 }),
  });

  const lessons: Lesson[] = data?.items ?? [];

  const filtered = useMemo(
      () => lessons.filter(l => (filter === 'all' ? true : l.category === filter)),
      [lessons, filter]
  );

  return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-happy-700">Learning Modules</h2>
          <Button variant="ghost" className="text-happy-600 hover:text-happy-800 hover:bg-happy-100">
            View All <BookOpen className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Tabs value={filter} className="mb-6">
          <TabsList className="grid grid-cols-5 md:grid-cols-6 h-14 rounded-xl bg-happy-50">
            {CATEGORIES.map(c => (
                <TabsTrigger
                    key={c}
                    value={c}
                    onClick={() => setFilter(c)}
                    className="text-base data-[state=active]:bg-white data-[state=active]:text-happy-700"
                >
                  {c[0].toUpperCase() + c.slice(1)}
                </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={filter} />
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-gray-100 animate-pulse h-52 rounded-xl" />
              ))
          ) : filtered.length === 0 ? (
              <p className="col-span-2 text-center py-10 text-gray-500">
                No lessons found in this category.
              </p>
          ) : (
              filtered.map(lesson => (
                  <StudentLessonCard key={lesson.id} lesson={lesson} />
              ))
          )}
        </div>
      </div>
  );
};

export default LearningModulesList;
