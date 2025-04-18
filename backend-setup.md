# Backend Setup Instructions

This document outlines how to set up the backend server for the HappyPath learning application using Node.js, Express, and PostgreSQL.

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── controllers/
│   ├── authController.js  # Authentication logic
│   ├── moduleController.js # Learning modules logic
│   ├── progressController.js # User progress logic
│   └── emotionController.js # Emotion tracking logic
├── models/
│   ├── user.js            # User model
│   ├── module.js          # Learning module model
│   ├── exercise.js        # Exercise model
│   └── progress.js        # Progress model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── modules.js         # Learning module routes
│   ├── progress.js         # Progress tracking routes
│   └── emotions.js        # Emotion tracking routes
├── middleware/
│   ├── auth.js            # Authentication middleware
│   └── error.js           # Error handling middleware
├── utils/
│   └── helpers.js         # Helper functions
├── .env                   # Environment variables (not committed to git)
├── .gitignore             # Git ignore file
├── package.json           # Node.js dependencies
└── server.js              # Main application entry point
```

## Getting Started

1. Create the backend folder structure as shown above
2. Initialize a new Node.js project:

```bash
mkdir backend
cd backend
npm init -y
```

3. Install required dependencies:

```bash
npm install express pg pg-hstore sequelize cors dotenv bcrypt jsonwebtoken
npm install --save-dev nodemon
```

4. Create the database in PostgreSQL:

```sql
CREATE DATABASE happypath;
CREATE USER happypath_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE happypath TO happypath_user;
```

5. Set up environment variables (.env file):

```
DB_HOST=localhost
DB_USER=happypath_user
DB_PASS=your_password
DB_NAME=happypath
PORT=3000
JWT_SECRET=your_jwt_secret_key
```

## Database Schema

Here's the initial database schema:

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Learning Modules Table
```sql
CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  module_id VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  icon VARCHAR(50),
  level VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Exercises Table
```sql
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  exercise_id VARCHAR(255) UNIQUE NOT NULL,
  module_id VARCHAR(255) REFERENCES modules(module_id),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  instructions TEXT,
  content JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Progress Table
```sql
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  module_id VARCHAR(255) REFERENCES modules(module_id),
  completed_exercises JSONB,
  score INTEGER DEFAULT 0,
  last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Emotion Data Table
```sql
CREATE TABLE emotion_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  module_id VARCHAR(255) REFERENCES modules(module_id),
  emotion VARCHAR(50) NOT NULL,
  confidence FLOAT NOT NULL,
  attention_score FLOAT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Files Implementation

### server.js
```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/emotions', require('./routes/emotions'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Server Error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### config/db.js
```javascript
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
```

### middleware/auth.js
```javascript
const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findByPk(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};
```

### routes/auth.js
```javascript
const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
```

## Running the Backend

Add this script to your package.json:

```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

Then run:

```bash
npm run dev
```

## Connecting Frontend to Backend

Update your frontend API services to point to these new backend endpoints. For example:

```javascript
// src/services/authService.js
export const authService = {
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },
  
  loginUser: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) throw new Error('Invalid credentials');
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  },
  
  // ... other methods
}
```

## Next Steps

1. Implement each controller with proper business logic
2. Set up Sequelize models for each database table
3. Implement data validation
4. Add error handling
5. Set up automated testing
6. Configure production deployment
