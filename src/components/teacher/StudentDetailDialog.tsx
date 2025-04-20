import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';
import StudentPerformanceChart from './StudentPerformanceChart';
import StudentEmotionChart from './StudentEmotionChart';

interface StudentDetailDialogProps {
  student: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StudentDetailDialog = ({ student, open, onOpenChange }: StudentDetailDialogProps) => {
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSendNotification = async () => {
    if (!notificationMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would send the notification to the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Notification sent to ${student.name}`);
      setNotificationMessage('');
    } catch (error) {
      toast.error("Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={student.avatar || undefined} />
              <AvatarFallback className="bg-happy-100 text-happy-700 text-lg">
                {student.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl mb-1">{student.name}</DialogTitle>
              <p className="text-sm text-muted-foreground">
                {student.email} • Progress: {student.progress}%
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Learning Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total time spent</span>
                      <span className="font-medium">12h 30m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average session length</span>
                      <span className="font-medium">25m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Modules completed</span>
                      <span className="font-medium">{student.completedModules}/{student.totalModules}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Average quiz score</span>
                      <span className="font-medium">78%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-happy-200 pl-4 py-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-happy-500" />
                        <span className="text-muted-foreground mr-2">
                          {new Date(student.lastActive).toLocaleDateString()}
                        </span>
                        <Clock className="h-3.5 w-3.5 mr-1 ml-2 text-happy-500" />
                        <span className="text-muted-foreground">
                          {new Date(student.lastActive).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-medium mt-1">Completed "Counting to 10" exercise</p>
                    </div>
                    
                    <div className="border-l-2 border-happy-200 pl-4 py-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-happy-500" />
                        <span className="text-muted-foreground mr-2">
                          {new Date("2025-04-16T14:15:00Z").toLocaleDateString()}
                        </span>
                        <Clock className="h-3.5 w-3.5 mr-1 ml-2 text-happy-500" />
                        <span className="text-muted-foreground">
                          {new Date("2025-04-16T14:15:00Z").toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="font-medium mt-1">Started "ABC Adventures" module</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Attention Level Trend</CardTitle>
                <CardDescription>Last 7 days attention tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <StudentEmotionChart />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Module Performance</CardTitle>
                <CardDescription>Progress across different learning modules</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <StudentPerformanceChart />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Quiz Results</CardTitle>
                <CardDescription>Last 5 quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { date: "2025-04-17", module: "Numbers", score: 90 },
                    { date: "2025-04-15", module: "Colors", score: 80 },
                    { date: "2025-04-12", module: "Letters", score: 75 },
                    { date: "2025-04-10", module: "Shapes", score: 85 },
                    { date: "2025-04-08", module: "Emotions", score: 70 },
                  ].map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-happy-500" />
                        <div>
                          <p className="font-medium">{quiz.module} Quiz</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(quiz.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-white text-sm ${
                        quiz.score >= 80 ? "bg-green-500" : 
                        quiz.score >= 70 ? "bg-amber-500" : "bg-red-500"
                      }`}>
                        {quiz.score}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Send Notification</CardTitle>
                <CardDescription>
                  Send a notification to this student's parent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Type your message here..."
                    className="min-h-32 resize-none"
                    value={notificationMessage}
                    onChange={(e) => setNotificationMessage(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button 
                      disabled={isSubmitting} 
                      onClick={handleSendNotification}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Notification'}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Parent/Guardian:</p>
                    <p>Taylor Thompson</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email:</p>
                    <p>taylor.thompson@example.com</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone:</p>
                    <p>(555) 123-4567</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default StudentDetailDialog;
