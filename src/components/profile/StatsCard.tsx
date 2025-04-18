
import { LearningStats } from '@/types/profile';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface StatsCardProps {
  isLoading: boolean;
  stats: LearningStats | null;
}

export const StatsCard = ({ isLoading, stats }: StatsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning Statistics</CardTitle>
        <CardDescription>Track your progress</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4 text-center">
              <div className="text-muted-foreground mb-2">Modules Completed</div>
              <div className="text-3xl font-bold">
                {stats.modulesCompleted} / {stats.totalModules || '?'}
              </div>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="text-muted-foreground mb-2">Average Score</div>
              <div className="text-3xl font-bold">
                {Math.round(stats.averageScore)}%
              </div>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="text-muted-foreground mb-2">Time Spent Learning</div>
              <div className="text-3xl font-bold">
                {stats.totalTimeSpent} min
              </div>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <div className="text-muted-foreground mb-2">Last Active</div>
              <div className="text-3xl font-bold">
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-4 text-muted-foreground">
            No learning data available yet. Start learning to see your statistics!
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href="/dashboard">Go to Dashboard</a>
        </Button>
      </CardFooter>
    </Card>
  );
};
