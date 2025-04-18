
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { LearningModule } from '@/types';
import { moduleService } from '@/services/moduleService';

// Mock quiz results data
const QUIZ_RESULTS = [
  {
    id: 1,
    moduleId: 'numbers-101',
    moduleName: 'Fun with Numbers',
    date: '2025-04-15T10:30:00Z',
    score: 85,
    totalQuestions: 10,
    correctAnswers: 8.5,
    timeSpent: 15,
    questions: [
      { id: 1, question: 'How many apples are there?', answer: '3', correct: true },
      { id: 2, question: 'Count the dogs', answer: '2', correct: true },
      { id: 3, question: 'How many birds do you see?', answer: '3', correct: false },
      { id: 4, question: 'What comes after 5?', answer: '6', correct: true },
    ]
  },
  {
    id: 2,
    moduleId: 'letters-101',
    moduleName: 'ABC Adventures',
    date: '2025-04-12T14:15:00Z',
    score: 70,
    totalQuestions: 10,
    correctAnswers: 7,
    timeSpent: 20,
    questions: [
      { id: 1, question: 'Find the letter A', answer: 'A', correct: true },
      { id: 2, question: 'What letter comes after B?', answer: 'C', correct: true },
      { id: 3, question: 'Match the uppercase and lowercase letters', answer: 'D-d', correct: false },
    ]
  },
  {
    id: 3,
    moduleId: 'colors-101',
    moduleName: 'Colorful World',
    date: '2025-04-08T11:00:00Z',
    score: 90,
    totalQuestions: 5,
    correctAnswers: 4.5,
    timeSpent: 10,
    questions: [
      { id: 1, question: 'What color is the apple?', answer: 'Red', correct: true },
      { id: 2, question: 'Find the blue object', answer: 'Blue ball', correct: true },
    ]
  },
];

const ParentProgress = () => {
  const [selectedModule, setSelectedModule] = useState<string>('all');
  
  // Fetch learning modules
  const { data: modules = [], isLoading: isLoadingModules } = useQuery<LearningModule[]>({
    queryKey: ['modules'],
    queryFn: moduleService.getModules,
  });
  
  // In a real app, this would fetch quiz results from an API
  const { data: quizResults = QUIZ_RESULTS, isLoading: isLoadingResults } = useQuery({
    queryKey: ['quizResults'],
    queryFn: () => Promise.resolve(QUIZ_RESULTS),
  });
  
  const filteredResults = selectedModule === 'all' 
    ? quizResults 
    : quizResults.filter(result => result.moduleId === selectedModule);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Learning Progress</h2>
        <Select value={selectedModule} onValueChange={setSelectedModule}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map((module) => (
              <SelectItem key={module.id} value={module.id}>{module.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Modules Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoadingModules ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-happy-600"></div>
                </div>
              ) : (
                modules.map((module) => (
                  <div key={module.id} className="space-y-1 pb-3 border-b last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium">{module.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {module.level}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>
                          {/* In a real app, you'd calculate this from student progress data */}
                          {module.id === 'numbers-101' ? '100%' : 
                           module.id === 'letters-101' ? '75%' : 
                           module.id === 'colors-101' ? '90%' : '0%'}
                        </span>
                      </div>
                      <Progress 
                        value={
                          module.id === 'numbers-101' ? 100 : 
                          module.id === 'letters-101' ? 75 : 
                          module.id === 'colors-101' ? 90 : 0
                        }
                        className="h-1.5" 
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-xs text-muted-foreground flex items-center">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        {module.id === 'numbers-101' ? 'Completed' : 
                         module.id === 'letters-101' ? '3/4 Exercises' : 
                         module.id === 'colors-101' ? 'Nearly complete' : 'Not started'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {module.category}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Quiz Results</CardTitle>
            <CardDescription>Recent quiz performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list" className="space-y-4">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="detail">Detailed View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                {isLoadingResults ? (
                  <div className="flex justify-center p-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-happy-600"></div>
                  </div>
                ) : filteredResults.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No quiz results found for this module.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-3 rounded-md border">
                        <div className="flex items-start gap-3">
                          <div className="rounded-full bg-happy-100 p-2">
                            <FileText className="h-5 w-5 text-happy-700" />
                          </div>
                          <div>
                            <h4 className="font-medium">{result.moduleName} Quiz</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {new Date(result.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center">
                                <Clock className="h-3.5 w-3.5 mr-1" />
                                {result.timeSpent} mins
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.correctAnswers}/{result.totalQuestions} correct
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="detail">
                {filteredResults.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No quiz results found for this module.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredResults.map((result) => (
                      <Card key={result.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{result.moduleName} Quiz</CardTitle>
                              <CardDescription>
                                Taken on {new Date(result.date).toLocaleDateString()}
                              </CardDescription>
                            </div>
                            <div className={`text-xl font-bold ${getScoreColor(result.score)}`}>
                              {result.score}%
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {result.questions.map((question) => (
                              <div key={question.id} className="flex items-start gap-2 border-b pb-3 last:border-0">
                                {question.correct ? (
                                  <Check className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                                ) : (
                                  <X className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                                )}
                                <div>
                                  <p className="font-medium">{question.question}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Answer: {question.answer}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentProgress;
