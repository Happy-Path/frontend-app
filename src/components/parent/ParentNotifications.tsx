
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Bell, Check, Clock, Info, User, Heart } from 'lucide-react';
import { toast } from 'sonner';

// Mock notifications data
const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Low attention alert',
    message: 'Alex has shown decreased attention during the last 3 sessions. Consider taking a break or switching activities.',
    type: 'attention_alert',
    sender: { name: 'Ms. Johnson', role: 'Teacher' },
    sentAt: '2025-04-18T09:30:00Z',
    isRead: false,
  },
  {
    id: 2,
    title: 'Quiz results update',
    message: 'Alex scored 90% on the Numbers module quiz! Great progress!',
    type: 'quiz_result',
    sender: { name: 'Mr. Roberts', role: 'Teacher' },
    sentAt: '2025-04-17T14:15:00Z',
    isRead: false,
  },
  {
    id: 3,
    title: 'Module completed notification',
    message: 'Alex has successfully completed the Colors module. Consider moving to the Shapes module next.',
    type: 'progress_update',
    sender: { name: 'Ms. Johnson', role: 'Teacher' },
    sentAt: '2025-04-16T11:45:00Z',
    isRead: true,
  },
  {
    id: 4,
    title: 'Weekly progress summary',
    message: 'Here is Alex\'s weekly progress summary. Overall progress: 65%. Alex spent 2 hours and 15 minutes learning this week.',
    type: 'general',
    sender: { name: 'HappyPath System', role: 'Automated' },
    sentAt: '2025-04-15T16:00:00Z',
    isRead: true,
  },
];

const ParentNotifications = () => {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Check for unread notifications
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    setHasUnread(unreadCount > 0);
  }, [notifications]);
  
  // Mark notification as read
  const handleMarkAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true } 
          : notification
      )
    );
    toast.success("Notification marked as read");
  };
  
  // Mark all as read
  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast.success("All notifications marked as read");
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'attention_alert':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'quiz_result':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'progress_update':
        return <Heart className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'attention_alert':
        return "border-amber-200 bg-amber-50";
      case 'quiz_result':
        return "border-green-200 bg-green-50";
      case 'progress_update':
        return "border-purple-200 bg-purple-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          {hasUnread && (
            <Badge className="bg-happy-100 text-happy-800">
              {notifications.filter(n => !n.isRead).length} unread
            </Badge>
          )}
        </div>
        {hasUnread && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>
      
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No notifications yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            You'll receive notifications from teachers here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Alert 
              key={notification.id} 
              className={`${getNotificationVariant(notification.type)} ${!notification.isRead ? 'border-l-4' : ''}`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <AlertTitle>{notification.title}</AlertTitle>
                  <AlertDescription className="mt-1">
                    {notification.message}
                  </AlertDescription>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center text-sm text-muted-foreground gap-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {notification.sender.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(notification.sentAt).toLocaleDateString()}
                      </span>
                    </div>
                    {!notification.isRead && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParentNotifications;
