// src/components/teacher/NewNotificationDialog.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    notificationService,
    NotificationType,
    NotificationRecipientDto,
} from "@/services/notificationService";

const formSchema = z.object({
    recipient: z.string({
        required_error: "Please select a recipient",
    }),
    type: z.enum(
        ["attention_alert", "progress_update", "quiz_result", "general"] as [
            NotificationType,
            ...NotificationType[]
        ],
        {
            required_error: "Please select a notification type",
        }
    ),
    title: z.string().min(3, "Title must be at least 3 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

interface NewNotificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const NewNotificationDialog = ({
                                   open,
                                   onOpenChange,
                               }: NewNotificationDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    // Load parents as recipients
    const {
        data: parents = [],
        isLoading: isLoadingParents,
        isError: isParentsError,
    } = useQuery<NotificationRecipientDto[]>({
        queryKey: ["notificationRecipients", "parent"],
        queryFn: () => notificationService.getRecipients("parent"),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: "general",
        },
    });

    const getTypeTitle = (type: string) => {
        switch (type) {
            case "attention_alert":
                return "Low attention alert";
            case "progress_update":
                return "Progress update";
            case "quiz_result":
                return "Quiz results";
            default:
                return "";
        }
    };

    const getTypeMessage = (type: string) => {
        switch (type) {
            case "attention_alert":
                return "Your child has shown decreased attention during recent learning sessions.";
            case "progress_update":
                return "Your child has made good progress in the latest module.";
            case "quiz_result":
                return "Your child has completed the latest quiz.";
            default:
                return "";
        }
    };

    const onTypeChange = (type: string) => {
        form.setValue("title", getTypeTitle(type));
        form.setValue("message", getTypeMessage(type));
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const payload = {
                recipientIds: [values.recipient],
                recipientRole: "parent" as const, // teachers only send to parents
                type: values.type,
                title: values.title,
                message: values.message,
            };

            await notificationService.send(payload);

            toast.success("Notification sent successfully");
            onOpenChange(false);
            form.reset({ type: "general" });
            queryClient.invalidateQueries({
                queryKey: ["notifications", "sent", "teacher"],
            });
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error("Failed to send notification");
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
                        Send a notification to a parent about their child's learning
                        progress.
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
                                        onValueChange={(value) => field.onChange(value)}
                                        defaultValue={field.value}
                                        disabled={isLoadingParents || isParentsError}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingParents
                                                            ? "Loading parents..."
                                                            : isParentsError
                                                                ? "Failed to load parents"
                                                                : "Select a parent"
                                                    }
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {parents.map((parent) => (
                                                <SelectItem key={parent.id} value={parent.id}>
                                                    {parent.name}
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
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Sending..." : "Send Notification"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default NewNotificationDialog;
