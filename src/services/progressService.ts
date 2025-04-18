
import { ProgressType } from '@/types/profile';

// Mock progress data
const MOCK_PROGRESS: ProgressType[] = [
  {
    userId: "user-123",
    moduleId: "numbers-101",
    completedExercises: ["num-ex-1"],
    score: 10,
    lastAccessed: "2025-04-12T10:30:00Z",
    completed: true, // Add this property for Profile component
    timeSpentMinutes: 45, // Add this property for Profile component
    emotionData: [
      {
        timestamp: "2025-04-12T10:25:00Z",
        emotion: "happy",
        confidence: 0.89,
        attentionScore: 0.92
      }
    ]
  }
];

export const progressService = {  
  getUserProgress: async (userId: string): Promise<ProgressType[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const progress = MOCK_PROGRESS.filter(p => p.userId === userId);
        resolve(progress);
      }, 600);
    });
  },
  
  submitExerciseResult: async (
    userId: string, 
    moduleId: string, 
    exerciseId: string, 
    isCorrect: boolean,
    emotionData?: {
      emotion: string;
      confidence: number;
      attentionScore: number;
    }
  ): Promise<void> => {
    console.log(`Exercise ${exerciseId} submitted with result: ${isCorrect}`);
    // In a real app, this would send data to the server
    return Promise.resolve();
  },
};
