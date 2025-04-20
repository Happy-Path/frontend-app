
// This file now serves as a placeholder for documentation purposes
// Previously defined TypeScript interfaces are removed
// The application will rely on JSDoc comments for type hints

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {'student' | 'parent' | 'teacher'} role
 * @property {string} [avatar]
 */

/**
 * @typedef {Object} LearningModule
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'numbers' | 'letters' | 'emotions' | 'colors'} category
 * @property {string} icon
 * @property {'beginner' | 'intermediate' | 'advanced'} level
 * @property {Exercise[]} exercises
 */

/**
 * @typedef {Object} Exercise
 * @property {string} id
 * @property {string} title
 * @property {'matching' | 'selection' | 'sorting' | 'recognition'} type
 * @property {string} instructions
 * @property {any} content
 * @property {boolean} completed
 */

/**
 * @typedef {Object} Progress
 * @property {string} userId
 * @property {string} moduleId
 * @property {string[]} completedExercises
 * @property {number} score
 * @property {string} lastAccessed
 * @property {EmotionData[]} [emotionData]
 */

/**
 * @typedef {Object} EmotionData
 * @property {string} timestamp
 * @property {'happy' | 'sad' | 'angry' | 'surprised' | 'neutral'} emotion
 * @property {number} confidence
 * @property {number} attentionScore
 */
