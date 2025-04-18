
import { authService } from './authService';
import { moduleService } from './moduleService';
import { progressService } from './progressService';
import { emotionService } from './emotionService';

export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/api' 
  : 'http://localhost:3000/api';

export const api = {
  // Auth
  getCurrentUser: authService.getCurrentUser,
  loginUser: authService.loginUser,
  registerUser: authService.registerUser,
  
  // Learning modules
  getModules: moduleService.getModules,
  getModuleById: moduleService.getModuleById,
  
  // Progress
  getUserProgress: progressService.getUserProgress,
  submitExerciseResult: progressService.submitExerciseResult,
  
  // Emotion tracking
  submitEmotionData: emotionService.submitEmotionData
};
