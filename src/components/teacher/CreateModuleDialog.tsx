import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { LearningModule } from '@/types';

// ✅ Import API functions
import { createLesson } from '@/services/lessonService';
import { updateLesson } from '@/services/lessonService';

// --- YouTube helpers ---
const YT_ID_REGEXES = [
    /(?:v=|\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
];

function extractYouTubeId(url: string): string | null {
    for (const r of YT_ID_REGEXES) {
        const m = url.match(r);
        if (m?.[1]) return m[1];
    }
    try {
        const u = new URL(url);
        const v = u.searchParams.get('v');
        if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;
    } catch {}
    return null;
}

function youtubeEmbedUrl(id: string) {
    return `https://www.youtube.com/embed/${id}?modestbranding=1&rel=0&playsinline=1`;
}

// --- Form schema ---
const formSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    goal: z.string().min(5, 'Please add a short learning goal'),
    category: z.string().min(1, 'Please select a category'),
    level: z.string().min(1, 'Please select a level'),
    youtubeUrl: z.string()
        .url('Enter a valid URL')
        .refine((u) => !!extractYouTubeId(u), 'Enter a valid YouTube link (watch, youtu.be, embed, or Shorts)'),
    publish: z.boolean().default(true),
});

interface CreateModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    module?: LearningModule & {
        video_id?: string;
        video_url?: string;
        thumbnail_url?: string;
        goal?: string;
        status?: 'draft' | 'published';
    };
}

const CreateModuleDialog = ({ open, onOpenChange, onSuccess, module }: CreateModuleDialogProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = !!module;

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: module?.title || '',
            description: module?.description || '',
            goal: (module as any)?.goal || '',
            category: module?.category || '',
            level: module?.level || '',
            youtubeUrl: (module as any)?.video_url || '',
            publish: (module as any)?.status ? (module as any)?.status === 'published' : true,
        },
    });

    const watchUrl = form.watch('youtubeUrl');
    const videoId = useMemo(() => extractYouTubeId(watchUrl || ''), [watchUrl]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        try {
            const payload = {
                title: values.title,
                description: values.description,
                goal: values.goal,
                category: values.category as any,
                level: values.level as any,
                video_url: values.youtubeUrl,
                status: values.publish ? 'published' : 'draft',
            };

            if (isEditing && (module as any)?.id) {
                await updateLesson((module as any).id as string, payload); // ✅ update existing
            } else {
                await createLesson(payload); // ✅ create new
            }

            onSuccess();
            onOpenChange(false);
            form.reset();
        } catch (error) {
            console.error('Error saving lesson:', error);
            // Optionally show a toast/snackbar here
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] overflow-y-auto max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Lesson' : 'Create New Lesson'}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the lesson details below.'
                            : 'Paste an Unlisted YouTube link and add lesson details below.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-3">
                        {/* Title */}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Lesson Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Count to 5 with Apples" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Goal */}
                        <FormField
                            control={form.control}
                            name="goal"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Goal (1 sentence)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Identify the numbers 1 to 5." {...field} />
                                    </FormControl>
                                    <FormDescription>Keep it short and simple.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe what the child will learn and any tips for the parent."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Category + Level */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="numbers">Numbers</SelectItem>
                                                <SelectItem value="letters">Letters</SelectItem>
                                                <SelectItem value="colors">Colors</SelectItem>
                                                <SelectItem value="shapes">Shapes</SelectItem>
                                                <SelectItem value="emotions">Emotions</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Difficulty Level</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select level" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="beginner">Beginner</SelectItem>
                                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                                <SelectItem value="advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* YouTube URL */}
                        <FormField
                            control={form.control}
                            name="youtubeUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>YouTube URL (Unlisted)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="https://youtu.be/XXXXXXXXXXX" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Supports watch links, youtu.be, embed, or Shorts format.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Video Preview */}
                        {videoId && (
                            <div className="rounded-xl overflow-hidden border">
                                <div className="relative pt-[56.25%]">
                                    <iframe
                                        src={youtubeEmbedUrl(videoId)}
                                        className="absolute inset-0 w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                        title="Lesson Preview"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Publish toggle */}
                        <FormField
                            control={form.control}
                            name="publish"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div>
                                        <FormLabel>Publish now</FormLabel>
                                        <FormDescription>Turn off to save as draft.</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* Buttons */}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? 'Saving…' : isEditing ? 'Update Lesson' : 'Create Lesson'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateModuleDialog;
