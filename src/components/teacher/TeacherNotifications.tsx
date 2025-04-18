
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Search, Check, Clock, Bell, AlertTriangle, Info, Heart } from 'lucide-react';
import { toast } from 'sonner';
import NewNotificationDialog from './NewNotificationDialog';

// Mock data for notifications
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    recipient: { id: 1, name: 'Taylor Thompson', avatar: null, relation: 'Parent', studentName: 'Alex Thompson' },
    title: 'Low attention alert',
    message: 'Alex has shown decreased attention during the last 3 sessions.',
    type: 'attention_alert',
    sentAt: '2025-04-18T09:30:00Z',
    read: true,
  },
  {
    id: 2,
    recipient: { id: 2, name: 'Jordan Wilson', avatar: null, relation: 'Parent', studentName: 'Morgan Wilson' },
    title: 'Quiz results update',
    message: 'Morgan scored 90% on the Numbers module quiz!',
    type: 'quiz_result',
    sentAt: '2025-04-17T14:15:00Z',
    read: false,
  },
  {
    id: 3,
    recipient: { id: 3, name: 'Casey Lee', avatar: null, relation: 'Parent', studentName: 'Jamie Lee' },
    title: 'Module completed notification',
    message: 'Jamie has successfully completed the Colors module.',
    type: 'progress_update',
    sentAt: '2025-04-16T11:45:00Z',
    read: false,
  },
  {
    id: 4,
    recipient: { id: 4, name: 'Riley Taylor', avatar: null, relation: 'Parent', studentName: 'Riley Taylor' },
    title: 'Weekly progress summary',
    message: 'Here is Riley\'s weekly progress summary. Overall progress: 45%.',
    type: 'general',
    sentAt: '2025-04-15T16:00:00Z',
    read: true,
  },
];

const TeacherNotifications = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewNotificationOpen, setIsNewNotificationOpen] = useState(false);
  
  // In a real app, this would be an API call
  const { data: notifications = MOCK_NOTIFICATIONS, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => Promise.resolve(MOCK_NOTIFICATIONS),
  });
  
  const filteredNotifications = notifications.filter(notification => 
    notification.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.recipient.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notification.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // This would be real API call in production
  const handleMarkAsRead = (id: number) => {
    toast.success("Notification marked as read");
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'attention_alert':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'quiz_result':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'progress_update':
        return <Heart className="h-4 w-4 text-purple-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'attention_alert':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Attention Alert</Badge>;
      case 'quiz_result':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Quiz Result</Badge>;
      case 'progress_update':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Progress Update</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">General</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-happy-100 text-happy-800">
              {unreadCount} unread
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsNewNotificationOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Notification
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="attention">Attention Alerts</TabsTrigger>
          <TabsTrigger value="progress">Progress Updates</TabsTrigger>
          <TabsTrigger value="quiz">Quiz Results</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center p-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-happy-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No notifications found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {searchQuery ? 'Try a different search term' : 'You have not sent any notifications yet'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications.map((notification) => (
                      <TableRow key={notification.id} className={notification.read ? '' : 'bg-happy-50'}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar>
                              <AvatarImage src={notification.recipient.avatar || undefined} />
                              <AvatarFallback className="bg-happy-100 text-happy-700">
                                {notification.recipient.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{notification.recipient.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {notification.recipient.relation} of {notification.recipient.studentName}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(notification.type)}
                            {getTypeLabel(notification.type)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {notification.message}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(notification.sentAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          {notification.read ? (
                            <Badge variant="outline" className="bg-gray-100">Read</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-happy-100 text-happy-800">Unread</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Unread Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.filter(n => !n.read).map((notification) => (
                    <TableRow key={notification.id} className="bg-happy-50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarImage src={notification.recipient.avatar || undefined} />
                            <AvatarFallback className="bg-happy-100 text-happy-700">
                              {notification.recipient.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{notification.recipient.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {notification.recipient.relation} of {notification.recipient.studentName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(notification.type)}
                          {getTypeLabel(notification.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {notification.message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(notification.sentAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* The other tab contents would follow a similar pattern */}
        <TabsContent value="attention">
          {/* Filtered content for attention alerts */}
        </TabsContent>
        
        <TabsContent value="progress">
          {/* Filtered content for progress updates */}
        </TabsContent>
        
        <TabsContent value="quiz">
          {/* Filtered content for quiz results */}
        </TabsContent>
      </Tabs>
      
      <NewNotificationDialog
        open={isNewNotificationOpen}
        onOpenChange={setIsNewNotificationOpen}
      />
    </div>
  );
};

export default TeacherNotifications;
