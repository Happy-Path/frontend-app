
export interface LearningStats {
  modulesCompleted: number;
  totalModules: number;
  averageScore: number;
  totalTimeSpent: number;
}

export interface ProfileFormData {
  name: string;
  email: string;
}

export interface ProgressType {
  userId: string;
  moduleId: string;
  completedExercises: string[];
  score: number;
  lastAccessed: string;
  completed: boolean;
  timeSpentMinutes: number;
  emotionData: {
    timestamp: string;
    emotion: string;
    confidence: number;
    attentionScore: number;
  }[];
}
