
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LearningModule, User } from '@/types';
import { api } from '@/services/api';
import Header from '@/components/Header';
import EmotionTracker from '@/components/EmotionTracker';
import { toast } from '@/components/ui/use-toast';
import Welcome from '@/components/home/Welcome';
import ContinueLearning from '@/components/home/ContinueLearning';
import LearningModulesList from '@/components/home/LearningModulesList';
import AchievementsPanel from '@/components/home/AchievementsPanel';
import BreakActivities from '@/components/home/BreakActivities';

const Index = () => {
  const [user, setUser] = useState<User | undefined>(undefined);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    
    fetchUser();
  }, []);

  // Fetch learning modules
  const { data: modules, isLoading } = useQuery<LearningModule[]>({
    queryKey: ['modules'],
    queryFn: api.getModules,
  });

  const handleEmotionDetected = (emotion: string, confidence: number, attentionScore: number) => {
    console.log(`Emotion detected: ${emotion} (${confidence}), attention: ${attentionScore}`);
    
    // Show toast for low attention (only sometimes to avoid spamming)
    if (attentionScore < 0.4 && Math.random() > 0.7) {
      toast({
        title: "Let's focus!",
        description: "Try to concentrate on the activities.",
        variant: "default",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="container px-4 py-6 max-w-6xl">
        <Welcome />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <ContinueLearning modules={modules} isLoading={isLoading} />
            <LearningModulesList modules={modules} isLoading={isLoading} />
          </div>
          
          <div className="space-y-6">
            <EmotionTracker onEmotionDetected={handleEmotionDetected} />
            <AchievementsPanel user={user} />
            <BreakActivities />
          </div>
        </div>
      </main>
      
      <footer className="bg-happy-50 text-gray-600 py-8 border-t border-happy-100">
        <div className="container mx-auto text-center">
          <p className="mb-4">
            HappyPath - A learning system for children with Down Syndrome
          </p>
          <p className="text-sm">
            © Happy Path Project
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
