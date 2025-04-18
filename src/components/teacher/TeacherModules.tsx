
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Edit, Trash, BookPlus, FileText } from 'lucide-react';
import CreateModuleDialog from './CreateModuleDialog';
import { toast } from 'sonner';
import { moduleService } from '@/services/moduleService';
import { LearningModule } from '@/types';

const TeacherModules = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LearningModule | null>(null);
  
  // Fetch modules
  const { data: modules, isLoading, refetch } = useQuery({
    queryKey: ['modules'],
    queryFn: moduleService.getModules,
  });
  
  const handleCreateSuccess = () => {
    toast.success("Module created successfully");
    setIsCreateDialogOpen(false);
    refetch();
  };
  
  const handleEditSuccess = () => {
    toast.success("Module updated successfully");
    setEditingModule(null);
    refetch();
  };
  
  const handleCreateModule = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleEditModule = (module: LearningModule) => {
    setEditingModule(module);
  };
  
  const handleDeleteModule = async (moduleId: string) => {
    // In a real app, this would call an API
    toast.success("Module deleted successfully");
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Learning Modules</h2>
        <Button onClick={handleCreateModule}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Module
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules?.map((module) => (
            <Card key={module.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <span className="text-xl mr-2">{module.icon}</span>
                  {module.title}
                </CardTitle>
                <CardDescription>{module.category} • {module.level}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{module.description}</p>
                <div className="mt-4">
                  <p className="text-sm font-medium">Exercises: {module.exercises?.length || 0}</p>
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEditModule(module)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDeleteModule(module.id)}>
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
      
      {editingModule && (
        <CreateModuleDialog 
          open={!!editingModule} 
          onOpenChange={() => setEditingModule(null)}
          onSuccess={handleEditSuccess}
          module={editingModule}
        />
      )}
    </div>
  );
};

export default TeacherModules;
