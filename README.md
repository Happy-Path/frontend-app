# Happy Path - Frontend Application

A React-based learning platform designed specifically for children with Down Syndrome, providing an engaging and accessible educational experience.

## 🌟 Features

- **Adaptive Learning Interface** - Tailored for children with special needs
- **Emotion Detection** - Real-time emotion tracking for enhanced learning
- **Role-Based Access** - Support for students, teachers, and parents
- **Progress Tracking** - Monitor learning achievements and milestones
- **Interactive Modules** - Engaging educational content across multiple categories
- **Responsive Design** - Works seamlessly across devices

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Build Tool**: Vite
- **State Management**: React Context API
- **HTTP Client**: Custom Fetch-based API client
- **Authentication**: JWT token-based authentication
- **Routing**: React Router (if applicable)
- **UI Components**: shadcn/ui component library

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── home/           # Home page specific components
│   ├── parent/         # Parent dashboard components
│   ├── profile/        # Profile management components
│   ├── teacher/        # Teacher dashboard components
│   ├── ui/             # shadcn/ui base components
│   ├── EmotionTracker.tsx
│   ├── Header.tsx
│   ├── ModuleCard.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # React context providers
│   └── AuthContext.tsx
├── hooks/              # Custom React hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
├── lib/                # Utility libraries
│   └── utils.ts
├── pages/              # Page components
│   ├── parent/         # Parent-specific pages
│   ├── student/        # Student-specific pages
│   ├── teacher/        # Teacher-specific pages
│   ├── About.tsx
│   ├── AuthCallback.tsx
│   ├── Dashboard.tsx
│   ├── Index.tsx
│   ├── Login.tsx
│   ├── ModuleDetail.tsx
│   ├── NotFound.tsx
│   ├── Profile.tsx
│   └── Register.tsx
├── services/           # API service layer
│   ├── api.ts          # Generic HTTP client
│   ├── authService.ts  # Authentication services
│   ├── emotionService.ts
│   ├── index.ts
│   ├── moduleService.ts
│   └── progressService.ts
├── types/              # TypeScript type definitions
│   ├── index.ts
│   └── profile.ts
├── App.tsx
└── main.tsx
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Running backend server (Happy Path Backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Happy-Path/frontend-app
   cd frontend-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Development

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Access the application**
   - Open your browser to `http://localhost:8080` (or the port shown in terminal)

3. **Ensure backend is running**
   - Make sure the Happy Path backend server is running on `http://localhost:5000`

## 📋 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🔐 Authentication

The application uses JWT-based authentication with the following user roles:

- **Student** - Access to learning modules and progress tracking
- **Teacher** - Module management and student progress monitoring
- **Parent** - Child's progress monitoring and family dashboard

### Auth Flow:
1. User registers/logs in through the frontend
2. Backend validates credentials and returns JWT token
3. Token is stored in localStorage
4. Subsequent API calls include token in Authorization header
5. Backend verifies token for protected routes

## 🌐 API Integration

The frontend communicates with the Node.js backend through:

- **Base URL**: Configured via `VITE_API_BASE_URL` environment variable
- **Authentication**: JWT tokens in Authorization header
- **Error Handling**: Centralized error handling in API client
- **Type Safety**: Full TypeScript support for API responses

### API Endpoints Used:
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user data
- `GET /modules` - Fetch learning modules
- `GET /modules/:id` - Get specific module

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Accessibility** - WCAG compliant components for inclusive design
- **Toast Notifications** - User feedback for actions and errors
- **Loading States** - Smooth user experience with loading indicators
- **Error Boundaries** - Graceful error handling and recovery

## 🔧 Development Guidelines

### Code Style
- TypeScript for type safety
- Functional components with React Hooks
- Custom hooks for reusable logic
- Context API for global state management

### Component Architecture
- Atomic design principles
- Separation of concerns
- Reusable UI components
- Page-specific components in respective folders

### State Management
- React Context for authentication state
- Local state for component-specific data
- Custom hooks for complex state logic

## 🚦 Environment Configuration

### Development
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Production
```env
VITE_API_BASE_URL=https://your-backend-domain.com/api
```

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow the existing code style and structure
3. Add TypeScript types for new features
4. Test authentication flows thoroughly
5. Ensure responsive design compliance
6. Submit pull request with clear description

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔍 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure backend CORS is configured for your frontend port
- Check that `VITE_API_BASE_URL` points to correct backend

**Authentication Issues:**
- Verify JWT token in localStorage
- Check backend authentication endpoints are working
- Ensure token hasn't expired (1-hour expiration)

**Build Errors:**
- Run `npm install` to ensure all dependencies are installed
- Check TypeScript errors with `npm run type-check`

## 📄 License

This project is part of the Happy Path educational platform for children with Down Syndrome.

## 🆘 Support

For technical issues or questions:
- Check the backend README for API documentation
- Ensure backend server is running and accessible
- Verify environment variables are correctly configured
