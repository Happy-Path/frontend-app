// src/pages/Profile.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { progressService } from '@/services';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { StatsCard } from '@/components/profile/StatsCard';
import { LearningStats, ProfileFormData, ProgressType } from '@/types/profile';

const Profile = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({ name: '', email: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [learningStats, setLearningStats] = useState<LearningStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({ 
        name: user.name || '', 
        email: user.email || '' 
      });
      
      const fetchLearningStats = async () => {
        try {
          setIsLoading(true);
          if (user.id) {
            const progress = await progressService.getUserProgress(user.id);
            
            const stats: LearningStats = {
              modulesCompleted: progress.filter(p => p.completed).length,
              totalModules: 0,
              averageScore: progress.length > 0 
                ? progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length 
                : 0,
              totalTimeSpent: progress.reduce((sum, p) => sum + (p.timeSpentMinutes || 0), 0),
            };
            
            setLearningStats(stats);
          }
        } catch (error) {
          console.error("Failed to fetch learning statistics:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchLearningStats();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Invalid name",
        description: "Please enter a valid name",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateUserProfile({ name: formData.name });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update your profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="stats">Learning Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <ProfileForm 
            formData={formData}
            isUpdating={isUpdating}
            onNameChange={(name) => setFormData(prev => ({ ...prev, name }))}
            onSubmit={handleUpdateProfile}
            onLogout={handleLogout}
          />
        </TabsContent>
        
        <TabsContent value="stats" className="mt-6">
          <StatsCard 
            isLoading={isLoading}
            stats={learningStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
