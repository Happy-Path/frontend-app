
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

const formSchema = z.object({
  recipient: z.string({
    required_error: "Please select a recipient",
  }),
  type: z.enum(['attention_alert', 'progress_update', 'quiz_result', 'general'], {
    required_error: "Please select a notification type",
  }),
  title: z.string().min(3, "Title must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Mock data for parents
const MOCK_PARENTS = [
  { id: "1", name: "Taylor Thompson", studentName: "Alex Thompson" },
  { id: "2", name: "Jordan Wilson", studentName: "Morgan Wilson" },
  { id: "3", name: "Casey Lee", studentName: "Jamie Lee" },
  { id: "4", name: "Riley Taylor", studentName: "Riley Taylor" },
];

interface NewNotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewNotificationDialog = ({ open, onOpenChange }: NewNotificationDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'general',
    },
  });
  
  const selectedType = form.watch('type');
  
  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'attention_alert': return 'Low attention alert';
      case 'progress_update': return 'Progress update';
      case 'quiz_result': return 'Quiz results';
      default: return '';
    }
  };
  
  const getTypeMessage = (type: string, studentName: string) => {
    switch (type) {
      case 'attention_alert': 
        return `${studentName} has shown decreased attention during recent learning sessions.`;
      case 'progress_update': 
        return `${studentName} has made good progress in the latest module.`;
      case 'quiz_result': 
        return `${studentName} has completed the latest quiz.`;
      default: return '';
    }
  };
  
  const onTypeChange = (type: string) => {
    const recipient = form.getValues('recipient');
    if (recipient) {
      const parent = MOCK_PARENTS.find(p => p.id === recipient);
      if (parent) {
        form.setValue('title', getTypeTitle(type));
        form.setValue('message', getTypeMessage(type, parent.studentName));
      }
    }
  };
  
  const onRecipientChange = (recipient: string) => {
    const type = form.getValues('type');
    const parent = MOCK_PARENTS.find(p => p.id === recipient);
    if (parent && type) {
      form.setValue('title', getTypeTitle(type));
      form.setValue('message', getTypeMessage(type, parent.studentName));
    }
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // This would send data to your backend in a real app
      console.log('Notification data:', values);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Notification sent successfully');
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Failed to send notification');
      console.error('Error sending notification:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Send New Notification</DialogTitle>
          <DialogDescription>
            Create a notification to send to a parent about their child's learning progress.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      onRecipientChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a parent" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MOCK_PARENTS.map((parent) => (
                        <SelectItem key={parent.id} value={parent.id}>
                          {parent.name} (Parent of {parent.studentName})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notification Type</FormLabel>
                  <RadioGroup
                    onValueChange={(value) => {
                      field.onChange(value);
                      onTypeChange(value);
                    }}
                    defaultValue={field.value}
                    className="grid grid-cols-2 gap-2"
                  >
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="attention_alert" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Attention Alert
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="progress_update" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Progress Update
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="quiz_result" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        Quiz Result
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="general" />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">
                        General Message
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Notification title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Type your message here..." 
                      className="min-h-[100px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide clear and specific information to the parent.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Notification'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewNotificationDialog;
