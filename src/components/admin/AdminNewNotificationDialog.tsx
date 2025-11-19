// src/components/admin/AdminNewNotificationDialog.tsx
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
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    notificationService,
    NotificationRecipientDto,
    NotificationType,
} from "@/services/notificationService";

const formSchema = z.object({
    recipientRoles: z
        .array(z.enum(["parent", "teacher"]))
        .min(1, "Select at least one recipient type"),
    type: z.enum(["system", "general"] as [NotificationType, ...NotificationType[]]),
    title: z.string().min(3, "Title must be at least 3 characters"),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

interface AdminNewNotificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const AdminNewNotificationDialog = ({
                                        open,
                                        onOpenChange,
                                    }: AdminNewNotificationDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            recipientRoles: ["parent"],
            type: "system",
        },
    });

    // Load ALL parents and teachers so we know who to send to
    const {
        data: parentRecipients = [],
        isLoading: isLoadingParents,
        isError: isParentsError,
    } = useQuery<NotificationRecipientDto[]>({
        queryKey: ["notificationRecipients", "admin", "parent"],
        queryFn: () => notificationService.getRecipients("parent"),
        enabled: open,
    });

    const {
        data: teacherRecipients = [],
        isLoading: isLoadingTeachers,
        isError: isTeachersError,
    } = useQuery<NotificationRecipientDto[]>({
        queryKey: ["notificationRecipients", "admin", "teacher"],
        queryFn: () => notificationService.getRecipients("teacher"),
        enabled: open,
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const { recipientRoles, type, title, message } = values;

            if (isLoadingParents || isLoadingTeachers) {
                toast.error("Recipients are still loading. Please wait a moment.");
                setIsSubmitting(false);
                return;
            }

            const tasks: Promise<any>[] = [];

            if (recipientRoles.includes("parent")) {
                const parentIds = parentRecipients.map((r) => r.id);
                if (parentIds.length === 0) {
                    toast.error("No parents found to send notifications to.");
                } else {
                    tasks.push(
                        notificationService.send({
                            recipientIds: parentIds,
                            recipientRole: "parent",
                            type,
                            title,
                            message,
                        })
                    );
                }
            }

            if (recipientRoles.includes("teacher")) {
                const teacherIds = teacherRecipients.map((r) => r.id);
                if (teacherIds.length === 0) {
                    toast.error("No teachers found to send notifications to.");
                } else {
                    tasks.push(
                        notificationService.send({
                            recipientIds: teacherIds,
                            recipientRole: "teacher",
                            type,
                            title,
                            message,
                        })
                    );
                }
            }

            if (tasks.length === 0) {
                setIsSubmitting(false);
                return;
            }

            await Promise.all(tasks);

            toast.success("Notification sent to selected recipient groups");
            onOpenChange(false);
            form.reset({ recipientRoles: ["parent"], type: "system" });
            queryClient.invalidateQueries({
                queryKey: ["notifications", "sent", "admin"],
            });
        } catch (error) {
            console.error("Error sending notification:", error);
            toast.error("Failed to send notification");
        } finally {
            setIsSubmitting(false);
        }
    };

    const recipientsLoading = isLoadingParents || isLoadingTeachers;
    const recipientsError = isParentsError || isTeachersError;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Send System Notification</DialogTitle>
                    <DialogDescription>
                        Send a system-wide update or important message to all parents and/or
                        all teachers.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* Multi-select recipient types */}
                        <FormField
                            control={form.control}
                            name="recipientRoles"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Recipient Types</FormLabel>
                                    <div className="flex gap-4">
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes("parent")}
                                                    onCheckedChange={(checked) => {
                                                        const current = field.value || [];
                                                        if (checked) {
                                                            field.onChange(
                                                                Array.from(new Set([...current, "parent"]))
                                                            );
                                                        } else {
                                                            field.onChange(
                                                                current.filter((r) => r !== "parent")
                                                            );
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                Parents (all)
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes("teacher")}
                                                    onCheckedChange={(checked) => {
                                                        const current = field.value || [];
                                                        if (checked) {
                                                            field.onChange(
                                                                Array.from(new Set([...current, "teacher"]))
                                                            );
                                                        } else {
                                                            field.onChange(
                                                                current.filter((r) => r !== "teacher")
                                                            );
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                Teachers (all)
                                            </FormLabel>
                                        </FormItem>
                                    </div>
                                    <FormMessage />
                                    {recipientsLoading && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Loading recipients…
                                        </p>
                                    )}
                                    {recipientsError && (
                                        <p className="text-xs text-red-600 mt-1">
                                            Failed to load recipients. They may still receive messages
                                            if they are cached.
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        {/* Notification type (system / general) */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notification Type</FormLabel>
                                    <RadioGroup
                                        onValueChange={(value) => field.onChange(value)}
                                        defaultValue={field.value}
                                        className="flex gap-4"
                                    >
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="system" />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                System
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="general" />
                                            </FormControl>
                                            <FormLabel className="font-normal cursor-pointer">
                                                General
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Title */}
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

                        {/* Message */}
                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Type your system message here..."
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
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
                            <Button
                                type="submit"
                                disabled={isSubmitting || recipientsLoading}
                            >
                                {isSubmitting ? "Sending..." : "Send Notification"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default AdminNewNotificationDialog;
