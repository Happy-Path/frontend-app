// src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { moduleService } from '@/services/moduleService';
import { progressService } from '@/services/progressService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import EmotionTracker from '@/components/EmotionTracker';
import { LearningModule } from '@/types';

interface ProgressType {
    completed: boolean;
    lastAccessed: Date;
    score?: number;
}

const Dashboard = () => {
    const [modules, setModules] = useState<LearningModule[]>([]);
    const [userProgress, setUserProgress] = useState<{ [moduleId: string]: ProgressType }>({});
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch all learning modules
                const modulesData = await moduleService.getModules();
                setModules(modulesData);

                // Fetch user progress if logged in
                if (user?.id) {
                    const progressData = await progressService.getUserProgress(user.id);
                    const progressByModule: { [moduleId: string]: ProgressType } = {};

                    progressData.forEach(item => {
                        progressByModule[item.moduleId] = {
                            completed: item.completed,
                            lastAccessed: new Date(item.lastAccessed),
                            score: item.score
                        };
                    });

                    setUserProgress(progressByModule);
                }
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
                toast({
                    title: "Error loading content",
                    description: "Failed to load your dashboard. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, toast]);

    const handleEmotionDetected = (emotion: string, confidence: number, attentionScore: number) => {
        // In a real app, you might want to record this or use it somehow
        console.log(`User emotion detected: ${emotion} (${confidence}), attention: ${attentionScore}`);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <h1 className="text-3xl font-bold mb-6">Your Learning Dashboard</h1>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold mb-4">Recommended Modules</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                {modules.slice(0, 4).map(module => (
                                    <Card key={module.id} className="hover:shadow-lg transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-lg">{module.title}</CardTitle>
                                                {userProgress[module.id]?.completed && (
                                                    <Badge className="bg-green-500">Completed</Badge>
                                                )}
                                            </div>
                                            <CardDescription>
                                                {module.description.substring(0, 80)}...
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-2">
                                            <div className="flex items-center text-sm text-muted-foreground">
                                                <span>{module.exercises?.length || 0} exercises</span>
                                                <span className="mx-2">•</span>
                                                <span>{module.estimatedTime} min</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild variant="outline" className="w-full">
                                                <Link to={`/modules/${module.id}`}>
                                                    {userProgress[module.id] ? 'Continue Learning' : 'Start Learning'}
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            <h2 className="text-xl font-semibold mb-4">Your Recent Progress</h2>
                            {Object.keys(userProgress).length > 0 ? (
                                <div className="space-y-4">
                                    {Object.entries(userProgress)
                                        .sort((a, b) => {
                                            const dateA = a[1].lastAccessed.getTime();
                                            const dateB = b[1].lastAccessed.getTime();
                                            return dateB - dateA;
                                        })
                                        .slice(0, 3)
                                        .map(([moduleId, progress]) => {
                                            const module = modules.find(m => m.id.toString() === moduleId);
                                            if (!module) return null;

                                            return (
                                                <Card key={moduleId} className="flex flex-col sm:flex-row items-center">
                                                    <div className="p-4 flex-1">
                                                        <h3 className="font-medium">{module.title}</h3>
                                                        <div className="text-sm text-muted-foreground mt-1">
                                                            Last accessed: {progress.lastAccessed.toLocaleDateString()}
                                                        </div>
                                                        {progress.score !== undefined && (
                                                            <div className="mt-1">
                                                                Score: <span className="font-medium">{progress.score}%</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        <Button asChild size="sm">
                                                            <Link to={`/modules/${moduleId}`}>Continue</Link>
                                                        </Button>
                                                    </div>
                                                </Card>
                                            );
                                        })}
                                </div>
                            ) : (
                                <Card className="p-6 text-center text-muted-foreground">
                                    <p>You haven't started any modules yet.</p>
                                    <Button asChild className="mt-4">
                                        <Link to="/">Browse Modules</Link>
                                    </Button>
                                </Card>
                            )}
                        </>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="sticky top-6">
                        {user && (
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Welcome, {user.name || user.email}!</CardTitle>
                                    <CardDescription>Track your learning progress</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium mb-1">Modules completed</div>
                                            <div className="text-2xl font-bold">
                                                {Object.values(userProgress).filter(p => p.completed).length} / {modules.length}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button asChild variant="outline" className="w-full">
                                        <Link to="/profile">View Profile</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        )}

                        {/* Dashboard: manual start/stop (no autoStart, no lock) */}
                        <EmotionTracker onEmotionDetected={handleEmotionDetected} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
