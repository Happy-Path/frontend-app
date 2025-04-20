
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { moduleService } from '@/services/moduleService';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { BookOpen, ClipboardCheck } from 'lucide-react';
import { LearningModule } from '@/types';

const StudentResources = () => {
  const { data: modules = [] as LearningModule[], isLoading } = useQuery<LearningModule[]>({
    queryKey: ['modules'],
    queryFn: moduleService.getModules,
  });

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Learning Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card key={module.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {module.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-gray-600">{module.description}</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  {module.exercises?.length || 0} exercises available
                </p>
                <Button asChild className="w-full">
                  <Link to={`/modules/${module.id}`}>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Start Learning
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentResources;
