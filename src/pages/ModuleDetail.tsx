
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LearningModule, Exercise, User } from '@/types';
import { api } from '@/services/api';
import Header from '@/components/Header';
import EmotionTracker from '@/components/EmotionTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Award, CheckCircle } from 'lucide-react';

const ModuleDetail = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const [module, setModule] = useState<LearningModule | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (!moduleId) {
          navigate('/');
          return;
        }
        
        // Fetch module data
        const moduleData = await api.getModuleById(moduleId);
        if (!moduleData) {
          toast({
            title: "Module not found",
            description: "The learning module you're looking for doesn't exist.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }
        
        setModule(moduleData);
        
        // Fetch user data
        const userData = await api.getCurrentUser();
        setUser(userData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "There was a problem loading the module.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [moduleId, navigate]);

  const currentExercise = module?.exercises[currentExerciseIndex];
  const progress = ((currentExerciseIndex + 1) / (module?.exercises.length || 1)) * 100;

  const handleEmotionDetected = (emotion: string, confidence: number, attentionScore: number) => {
    if (user && module) {
      api.submitEmotionData(user.id, module.id, emotion, confidence, attentionScore);
      
      // Show encouragement for positive emotions
      if (emotion === 'happy' && confidence > 0.8 && Math.random() > 0.7) {
        toast({
          title: "You're doing great!",
          description: "I can see you're enjoying this activity!",
          variant: "default",
        });
      }
    }
  };

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    
    // For demo purposes, we'll determine if the answer is correct
    // In a real app, this would be more sophisticated
    let correct = false;
    
    if (currentExercise) {
      if (currentExercise.type === 'recognition') {
        correct = answer === currentExercise.content.answer;
      } else if (currentExercise.type === 'matching') {
        // Simplified matching logic for demo
        correct = true;
      } else {
        // For other exercise types, randomly determine correctness
        correct = Math.random() > 0.3;
      }
      
      setIsCorrect(correct);
      
      // Submit the result
      if (user && module) {
        api.submitExerciseResult(user.id, module.id, currentExercise.id, correct);
      }
    }
  };

  const handleNextExercise = () => {
    if (!module) return;
    
    if (currentExerciseIndex < module.exercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } else {
      // Completed all exercises
      toast({
        title: "Great job!",
        description: "You've completed all exercises in this module!",
        variant: "default",
      });
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const renderExerciseContent = () => {
    if (!currentExercise) return null;
    
    switch (currentExercise.type) {
      case 'recognition':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">{currentExercise.title}</h3>
              <p className="text-lg text-gray-600">{currentExercise.instructions}</p>
            </div>
            
            {currentExercise.content.image && (
              <div className="flex justify-center mb-6">
                <div className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                  {currentExercise.content.image === 'happy-face' ? '😊' : ''}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              {currentExercise.content.options.map((option: string) => (
                <Button
                  key={option}
                  variant="outline"
                  size="lg"
                  className={`h-20 text-xl ${
                    selectedAnswer === option
                      ? isCorrect
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-red-100 border-red-500 text-red-700'
                      : 'bg-white hover:bg-happy-50'
                  }`}
                  onClick={() => !selectedAnswer && handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                >
                  {option}
                  {selectedAnswer === option && isCorrect && (
                    <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                  )}
                </Button>
              ))}
            </div>
            
            {selectedAnswer && (
              <div className="flex justify-center mt-8">
                <Button 
                  size="lg"
                  className="happy-button animate-bounce"
                  onClick={handleNextExercise}
                >
                  {currentExerciseIndex < (module?.exercises.length ?? 0) - 1
                    ? "Next Exercise"
                    : "Finish Module"}
                </Button>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="text-center p-8">
            <p>This exercise type is not yet implemented.</p>
            <Button 
              variant="default"
              className="mt-4"
              onClick={handleNextExercise}
            >
              Skip to Next
            </Button>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="container mx-auto px-4 py-10 flex items-center justify-center">
          <p className="text-xl text-gray-600">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} />
        <div className="container mx-auto px-4 py-10 flex items-center justify-center">
          <p className="text-xl text-gray-600">Module not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} />
      
      <main className="container px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-happy-600 hover:text-happy-800 hover:bg-happy-100"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
          </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-md border-0">
              <CardHeader className="bg-happy-50 border-b border-happy-100">
                <CardTitle className="text-2xl text-happy-700">{module.title}</CardTitle>
                <CardDescription className="text-lg">{module.description}</CardDescription>
                
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{currentExerciseIndex + 1} of {module.exercises.length}</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-happy-100" />
                </div>
              </CardHeader>
              
              <CardContent className="p-6 lg:p-8">
                {renderExerciseContent()}
              </CardContent>
              
              <CardFooter className="bg-happy-50 border-t border-happy-100 p-4">
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-sunny-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      Earn stars by completing exercises!
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Exercise {currentExerciseIndex + 1} / {module.exercises.length}
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <EmotionTracker onEmotionDetected={handleEmotionDetected} />
            
            <Card className="bg-white shadow-md border-0 overflow-hidden">
              <CardHeader className="bg-sunny-50 border-b border-sunny-100">
                <CardTitle className="text-xl text-sunny-700">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-2 list-disc list-inside">
                  <li>Take your time to read each question.</li>
                  <li>Look at all options before answering.</li>
                  <li>It's okay to ask for help if needed!</li>
                  <li>Have fun while learning!</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-md border-0 overflow-hidden">
              <CardHeader className="bg-nature-50 border-b border-nature-100">
                <CardTitle className="text-xl text-nature-700">Need a Break?</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="mb-4">It's okay to take breaks when you need them!</p>
                <Button className="nature-button w-full">
                  Take a 5 Minute Break
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModuleDetail;
