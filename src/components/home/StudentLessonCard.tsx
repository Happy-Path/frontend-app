// src/components/student/StudentLessonCard.tsx
import { Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Lesson } from '@/types/lesson';
import { Link } from 'react-router-dom';

export default function StudentLessonCard({ lesson }: { lesson: Lesson }) {
    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            {lesson.thumbnail_url ? (
                <img
                    src={lesson.thumbnail_url}
                    alt={lesson.title}
                    className="w-full h-40 object-cover"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-40 bg-muted" />
            )}
            <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{lesson.title}</CardTitle>
                <CardDescription>{lesson.category} • {lesson.level}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{lesson.description}</p>
            </CardContent>
            <CardFooter className="flex justify-end">
                <Button asChild className="gap-2">
                    <Link to={`/student/lesson/${lesson.id}`}>
                        <Play className="h-4 w-4" /> Play
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
