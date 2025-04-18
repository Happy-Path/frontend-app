
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import StudentDetailDialog from './StudentDetailDialog';

// Mock data for students
const STUDENTS = [
  {
    id: 1,
    name: 'Alex Thompson',
    email: 'alex.t@example.com',
    avatar: null,
    progress: 75,
    lastActive: '2025-04-15T14:25:00Z',
    completedModules: 3,
    totalModules: 4,
    attentionScore: 0.85,
  },
  {
    id: 2,
    name: 'Jamie Lee',
    email: 'jamie.lee@example.com',
    avatar: null,
    progress: 45,
    lastActive: '2025-04-17T09:15:00Z',
    completedModules: 2,
    totalModules: 4,
    attentionScore: 0.72,
  },
  {
    id: 3,
    name: 'Riley Taylor',
    email: 'riley.t@example.com',
    avatar: null,
    progress: 20,
    lastActive: '2025-04-16T16:30:00Z',
    completedModules: 1,
    totalModules: 4,
    attentionScore: 0.62,
  },
  {
    id: 4,
    name: 'Morgan Wilson',
    email: 'morgan.w@example.com',
    avatar: null,
    progress: 90,
    lastActive: '2025-04-18T10:00:00Z',
    completedModules: 4,
    totalModules: 4,
    attentionScore: 0.91,
  },
];

const TeacherStudents = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  // This would be a real API call in production
  const { data: students = STUDENTS, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => Promise.resolve(STUDENTS),
  });
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSendNotification = (studentId: number) => {
    console.log(`Sending notification to student ${studentId}`);
    // This would open a dialog to send notification in a real app
  };
  
  const handleViewStudent = (student: any) => {
    setSelectedStudent(student);
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 40) return "bg-amber-500";
    return "bg-red-500";
  };
  
  const getAttentionBadge = (score: number) => {
    if (score >= 0.8) return <Badge className="bg-green-500">High</Badge>;
    if (score >= 0.6) return <Badge className="bg-amber-500">Medium</Badge>;
    return <Badge className="bg-red-500">Low</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Students</h2>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Student List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Attention Level</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={student.avatar || undefined} />
                          <AvatarFallback className="bg-happy-100 text-happy-700">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={student.progress} className={getProgressColor(student.progress)} />
                        <span className="text-sm">{student.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.completedModules}/{student.totalModules} modules
                    </TableCell>
                    <TableCell>
                      {getAttentionBadge(student.attentionScore)}
                    </TableCell>
                    <TableCell>
                      {new Date(student.lastActive).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleSendNotification(student.id)}
                          title="Send notification"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleViewStudent(student)}
                          title="View details"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {selectedStudent && (
        <StudentDetailDialog 
          student={selectedStudent} 
          open={!!selectedStudent} 
          onOpenChange={(open) => !open && setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

export default TeacherStudents;
