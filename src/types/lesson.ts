// src/types/lesson.ts
export type Lesson = {
    id: string;
    title: string;
    description: string;
    goal: string;
    category: 'numbers' | 'letters' | 'colors' | 'shapes' | 'emotions';
    level: 'beginner' | 'intermediate' | 'advanced';
    video_url: string;
    video_id?: string;
    thumbnail_url?: string;
    status: 'draft' | 'published';
    created_at?: string;
    updated_at?: string;
};
