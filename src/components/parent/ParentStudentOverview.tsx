
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Brain, Calendar, Clock, Heart } from 'lucide-react';
import StudentPerformanceChart from '../teacher/StudentPerformanceChart';
import StudentEmotionChart from '../teacher/StudentEmotionChart';

// Mock student data - in a real app this would come from an API
const STUDENT_DATA = {
  id: 1,
  name: 'Alex Thompson',
  avatar: null,
  age: 8,
  grade: '2nd Grade',
  totalModulesCompleted: 3,
  totalModules: 5,
  overallProgress: 65,
  attentionScore: 0.78,
  lastSessionDuration: 25,
  lastSessionDate: '2025-04-18T10:30:00Z',
  emotionTrend: 'happy',
  strengths: ['Numbers recognition', 'Color identification'],
  areasToImprove: ['Letter sequencing', 'Shape recognition'],
  upcomingActivities: [
    { name: 'New ABC module', date: '2025-04-22' },
    { name: 'Numbers quiz', date: '2025-04-25' }
  ]
};

const ParentStudentOverview = () => {
  // In a real app, this would be an API call
  const { data: student = STUDENT_DATA, isLoading } = useQuery({
    queryKey: ['student'],
    queryFn: () => Promise.resolve(STUDENT_DATA),
  });
  
  const getAttentionLabel = (score: number) => {
    if (score >= 0.8) return { label: "Excellent", color: "text-green-600" };
    if (score >= 0.6) return { label: "Good", color: "text-amber-600" };
    return { label: "Needs improvement", color: "text-red-600" };
  };
  
  const attentionInfo = getAttentionLabel(student.attentionScore);
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Student Overview</CardTitle>
            <CardDescription>Quick view of your child's learning journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage src={student.avatar || undefined} />
                  <AvatarFallback className="bg-happy-100 text-happy-700 text-xl">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{student.name}</h3>
                <p className="text-sm text-muted-foreground">{student.age} years • {student.grade}</p>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm font-medium">{student.overallProgress}%</span>
                  </div>
                  <Progress value={student.overallProgress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-happy-100 p-1.5">
                      <Heart className="h-4 w-4 text-happy-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Modules Completed</p>
                      <p className="text-xl font-bold">{student.totalModulesCompleted} <span className="text-sm font-normal text-muted-foreground">of {student.totalModules}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-happy-100 p-1.5">
                      <Brain className="h-4 w-4 text-happy-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Attention Level</p>
                      <p className="text-xl font-bold">
                        <span className={attentionInfo.color}>{attentionInfo.label}</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-happy-100 p-1.5">
                      <Calendar className="h-4 w-4 text-happy-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Session</p>
                      <p className="text-base font-medium">
                        {new Date(student.lastSessionDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <div className="rounded-full bg-happy-100 p-1.5">
                      <Clock className="h-4 w-4 text-happy-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Session Duration</p>
                      <p className="text-base font-medium">
                        {student.lastSessionDuration} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {student.upcomingActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-2 pb-2 border-b last:border-0">
                  <Calendar className="h-4 w-4 mt-0.5 text-happy-500" />
                  <div>
                    <p className="font-medium">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Learning Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.strengths.map((strength, index) => (
                <Badge key={index} className="mr-2 mb-2 bg-green-100 text-green-800 hover:bg-green-200">
                  {strength}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Areas to Improve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.areasToImprove.map((area, index) => (
                <Badge key={index} className="mr-2 mb-2 bg-amber-100 text-amber-800 hover:bg-amber-200">
                  {area}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Module Performance</CardTitle>
            <CardDescription>Progress across different learning modules</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentPerformanceChart />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Attention & Emotion Trend</CardTitle>
            <CardDescription>Last 7 days attention tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentEmotionChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentStudentOverview;
