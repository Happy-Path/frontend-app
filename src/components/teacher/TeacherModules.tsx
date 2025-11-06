// src/components/teacher/TeacherModules.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash, Eye } from 'lucide-react';
import CreateModuleDialog from './CreateModuleDialog';
import { toast } from 'sonner';
import type { Lesson } from '@/types/lesson';
import { listLessons, deleteLesson } from '@/services/lessonService';

const TeacherModules = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['lessons'],
    queryFn: () => listLessons({ /* status: 'published' */ page: 1, limit: 24 }),
  });

  const lessons: Lesson[] = data?.items ?? [];

  const handleCreateSuccess = () => {
    toast.success('Lesson created successfully');
    setIsCreateDialogOpen(false);
    refetch();
  };

  const handleEditSuccess = () => {
    toast.success('Lesson updated successfully');
    setEditingLesson(null);
    refetch();
  };

  const handleCreate = () => setIsCreateDialogOpen(true);
  const handleEdit = (lesson: Lesson) => setEditingLesson(lesson);

  const handleDelete = async (id: string) => {
    try {
      await deleteLesson(id);
      toast.success('Lesson deleted');
      refetch();
    } catch (e: any) {
      toast.error(e.message || 'Delete failed');
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Lessons</h2>
          <Button onClick={handleCreate}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Lesson
          </Button>
        </div>

        {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600" />
            </div>
        ) : lessons.length === 0 ? (
            <div className="text-center p-8 border rounded-lg">
              <p className="text-sm text-muted-foreground">No lessons yet.</p>
              <Button className="mt-3" onClick={handleCreate}>Create your first lesson</Button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                  <Card key={lesson.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        {lesson.thumbnail_url ? (
                            <img
                                src={lesson.thumbnail_url}
                                alt={lesson.title}
                                className="w-10 h-10 rounded object-cover border"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded bg-muted border" />
                        )}
                        <span className="line-clamp-1">{lesson.title}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center justify-between">
                        <span>{lesson.category} • {lesson.level}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                            lesson.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                    {lesson.status}
                  </span>
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{lesson.description}</p>
                      {lesson.video_url && (
                          <a
                              href={lesson.video_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm mt-3 hover:underline"
                          >
                            <Eye className="h-4 w-4" /> Preview on YouTube
                          </a>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2 flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(lesson)}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(lesson.id)}>
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
              ))}
            </div>
        )}

        <CreateModuleDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
            onSuccess={handleCreateSuccess}
        />

        {editingLesson && (
            <CreateModuleDialog
                open={!!editingLesson}
                onOpenChange={() => setEditingLesson(null)}
                onSuccess={handleEditSuccess}
                module={{
                  id: editingLesson.id,
                  title: editingLesson.title,
                  description: editingLesson.description,
                  category: editingLesson.category,
                  level: editingLesson.level,
                  // dialog uses goal + video_url + status in defaults
                  goal: editingLesson.goal,
                  video_url: editingLesson.video_url,
                  status: editingLesson.status,
                  // optional
                  video_id: editingLesson.video_id,
                  thumbnail_url: editingLesson.thumbnail_url,
                } as any}
            />
        )}
      </div>
  );
};

export default TeacherModules;
