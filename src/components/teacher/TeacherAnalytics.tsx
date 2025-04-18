
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, Users, BookOpen, Brain } from 'lucide-react';

const mockModuleCompletionData = [
  { name: 'Numbers', value: 35, fill: '#8884d8' },
  { name: 'Letters', value: 25, fill: '#83a6ed' },
  { name: 'Colors', value: 20, fill: '#8dd1e1' },
  { name: 'Shapes', value: 15, fill: '#82ca9d' },
  { name: 'Emotions', value: 5, fill: '#a4de6c' },
];

const mockAttentionData = [
  { name: 'Jan', average: 78 },
  { name: 'Feb', average: 80 },
  { name: 'Mar', average: 75 },
  { name: 'Apr', average: 82 },
  { name: 'May', average: 84 },
  { name: 'Jun', average: 80 },
  { name: 'Jul', average: 78 },
  { name: 'Aug', average: 77 },
  { name: 'Sep', average: 81 },
  { name: 'Oct', average: 83 },
  { name: 'Nov', average: 85 },
  { name: 'Dec', average: 79 },
];

const mockEmotionData = [
  { name: 'Happy', value: 60, fill: '#8884d8' },
  { name: 'Neutral', value: 25, fill: '#83a6ed' },
  { name: 'Confused', value: 10, fill: '#8dd1e1' },
  { name: 'Frustrated', value: 5, fill: '#82ca9d' },
];

const mockPerformanceData = [
  { name: 'Numbers', beginner: 85, intermediate: 70, advanced: 60 },
  { name: 'Letters', beginner: 80, intermediate: 65, advanced: 55 },
  { name: 'Colors', beginner: 90, intermediate: 75, advanced: 65 },
  { name: 'Shapes', beginner: 75, intermediate: 60, advanced: 50 },
  { name: 'Emotions', beginner: 70, intermediate: 55, advanced: 45 },
];

const TeacherAnalytics = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Analytics Dashboard</h2>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="year">Past Year</SelectItem>
            <SelectItem value="6months">Past 6 Months</SelectItem>
            <SelectItem value="month">Past Month</SelectItem>
            <SelectItem value="week">Past Week</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">+4 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Modules</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attention Score</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65%</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="attention">Attention</TabsTrigger>
          <TabsTrigger value="emotions">Emotions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Module Completion</CardTitle>
              <CardDescription>Distribution of completed modules by category</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[300px] w-full max-w-md">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockModuleCompletionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attention Trends</CardTitle>
              <CardDescription>Average student attention scores by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockAttentionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      name="Avg. Attention Score" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emotions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emotion Distribution</CardTitle>
              <CardDescription>Overall distribution of detected student emotions</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[300px] w-full max-w-md">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={mockEmotionData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Module Level</CardTitle>
              <CardDescription>Average scores across difficulty levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="beginner" name="Beginner" fill="#8884d8" />
                    <Bar dataKey="intermediate" name="Intermediate" fill="#82ca9d" />
                    <Bar dataKey="advanced" name="Advanced" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeacherAnalytics;
