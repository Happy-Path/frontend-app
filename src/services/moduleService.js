
// Mock data for development
const MOCK_MODULES = [
  {
    id: "numbers-101",
    title: "Fun with Numbers",
    description: "Learn to count from 1 to 10 with fun activities",
    category: "numbers",
    icon: "123",
    level: "beginner",
    exercises: [
      {
        id: "num-ex-1",
        title: "Count the Animals",
        type: "recognition",
        instructions: "Count how many animals you see!",
        content: {
          images: ["dog", "cat", "bird"],
          answer: 3
        },
        completed: false
      },
      {
        id: "num-ex-2",
        title: "Match Numbers",
        type: "matching",
        instructions: "Match the number with the correct amount of objects",
        content: {
          pairs: [
            { number: 1, objects: ["apple"] },
            { number: 2, objects: ["banana", "banana"] }
          ]
        },
        completed: false
      }
    ]
  },
  {
    id: "letters-101",
    title: "ABC Adventures",
    description: "Learn the alphabet with fun games",
    category: "letters",
    icon: "ABC",
    level: "beginner",
    exercises: [
      {
        id: "let-ex-1",
        title: "Find the Letter",
        type: "recognition",
        instructions: "Can you find the letter A?",
        content: {
          targetLetter: "A",
          options: ["A", "B", "C", "D"]
        },
        completed: false
      }
    ]
  },
  {
    id: "emotions-101",
    title: "Understanding Feelings",
    description: "Learn to recognize different emotions",
    category: "emotions",
    icon: "😊",
    level: "beginner",
    exercises: [
      {
        id: "emo-ex-1",
        title: "Name the Feeling",
        type: "recognition",
        instructions: "What emotion is shown in the picture?",
        content: {
          image: "happy-face",
          options: ["Happy", "Sad", "Angry"],
          answer: "Happy"
        },
        completed: false
      }
    ]
  },
  {
    id: "colors-101",
    title: "Colorful World",
    description: "Learn about different colors through fun activities",
    category: "colors",
    icon: "🎨",
    level: "beginner",
    exercises: [
      {
        id: "col-ex-1",
        title: "Find the Color",
        type: "recognition",
        instructions: "Can you find the red color?",
        content: {
          targetColor: "red",
          options: ["red", "blue", "green", "yellow"]
        },
        completed: false
      }
    ]
  }
];

export const moduleService = {
  getModules: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_MODULES), 700);
    });
  },
  
  getModuleById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const module = MOCK_MODULES.find(m => m.id === id);
        resolve(module);
      }, 500);
    });
  },
};
