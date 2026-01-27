# Smart E-Learning Platform - Setup Guide

## Project Overview

This is a full-stack **Smart E-Learning Platform** with:
- **Backend**: Node.js + Express + MongoDB (Dynamic API server)
- **Frontend**: React + Vite + TailwindCSS (Dynamic client consuming the API)

## ✅ What's Been Created

### Server (Backend)
- Complete REST API with Express.js
- MongoDB database with 8 models (User, Course, Lesson, Quiz, Enrollment, Progress, QuizSubmission, Certificate)
- JWT-based authentication
- Role-based access control (Student, Instructor, Admin)
- Full CRUD operations for courses, lessons, quizzes
- Error handling and validation middleware

### Client (Frontend)
- Updated React components to use dynamic API calls
- Authentication context using real API endpoints
- Dynamic StudentDashboard with real course data
- Axios API service with interceptors
- Token-based authorization

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

## Backend Setup (Server)

### 1. Navigate to Server Directory
```bash
cd server
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-elearning
JWT_SECRET=your_super_secret_key_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d
CORS_ORIGIN=http://localhost:5173
```

### 4. Start MongoDB
If using local MongoDB:
```bash
mongod
```

Or use MongoDB Atlas connection string in MONGODB_URI

### 5. Seed Database (Optional)
Populate with sample data:
```bash
npm run seed
```

This creates:
- 3 test users (1 instructor, 2 students)
- 3 sample courses
- 6 lessons with content
- 2 quizzes

### 6. Start Development Server
```bash
npm run dev
```

Server will run on: **http://localhost:3001**

---

## Frontend Setup (Client)

### 1. Navigate to Client Directory
```bash
cd client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create `.env.local`:
```bash
cp .env.example .env.local
```

Content:
```env
VITE_API_URL=http://localhost:3001/api
```

### 4. Start Development Server
```bash
npm run dev
```

Application will open at: **http://localhost:5173**

---

## Testing the Platform

### Test Accounts (After Seeding)

**Instructor:**
- Email: `instructor@example.com`
- Password: `password123`

**Student 1:**
- Email: `student1@example.com`
- Password: `password123`

**Student 2:**
- Email: `student2@example.com`
- Password: `password123`

### Test Flow

1. **Login** with a student account
2. Navigate to **Courses** to see available courses
3. **Enroll** in a course
4. View the **Dashboard** to see enrolled courses
5. Click on a course to view lessons
6. Complete lessons and take quizzes

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `GET /api/users/settings` - Get settings
- `PUT /api/users/settings` - Update settings

### Courses
- `GET /api/courses` - Get all published courses
- `GET /api/courses/:id` - Get course details
- `GET /api/courses/enrolled` - Get enrolled courses
- `POST /api/courses/:id/enroll` - Enroll in course
- `GET /api/courses/:id/progress` - Get course progress

### Lessons
- `GET /api/lessons/course/:courseId` - Get course lessons
- `GET /api/lessons/:id` - Get lesson content
- `POST /api/lessons/:id/complete` - Mark lesson complete

### Quizzes
- `GET /api/quizzes/course/:courseId` - Get course quizzes
- `GET /api/quizzes/:id` - Get quiz details
- `POST /api/quizzes/:id/submit` - Submit quiz answers
- `GET /api/quizzes/:id/submissions` - Get quiz submissions

---

## Project Structure

### Server
```
server/
├── src/
│   ├── models/              # MongoDB schemas
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Lesson.js
│   │   ├── Quiz.js
│   │   ├── Enrollment.js
│   │   ├── Progress.js
│   │   ├── QuizSubmission.js
│   │   └── Certificate.js
│   ├── controllers/         # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── courseController.js
│   │   ├── lessonController.js
│   │   └── quizController.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── courseRoutes.js
│   │   ├── lessonRoutes.js
│   │   └── quizRoutes.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/               # Utility functions
│   │   ├── tokenUtils.js
│   │   └── validators.js
│   ├── config/
│   │   └── database.js
│   ├── seed.js              # Database seeding
│   └── index.js             # Server entry point
├── package.json
└── .env.example
```

### Client
```
client/
├── src/
│   ├── components/          # React components
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Footer.jsx
│   │   └── ProtectedRoute.jsx
│   ├── context/             # React context
│   │   └── AuthContext.jsx
│   ├── hooks/               # Custom hooks
│   │   └── useAuth.js
│   ├── pages/               # Page components
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── Course.jsx
│   │   ├── Quiz.jsx
│   │   └── AITutor.jsx
│   ├── services/            # API services
│   │   └── api.js
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── DashboardLayout.jsx
│   ├── styles/              # CSS files
│   ├── App.jsx
│   └── main.jsx
└── package.json
```

---

## Key Features Implemented

### ✅ Authentication
- JWT token-based authentication
- Automatic token inclusion in API requests
- Token refresh capability
- Protected routes

### ✅ Courses
- Dynamic course listing
- Course enrollment system
- Progress tracking
- Lesson management

### ✅ Lessons
- Lesson content display
- Lesson completion tracking
- Progress indicators

### ✅ Quizzes
- Quiz submission and grading
- Question types support
- Score calculation
- Passing score validation

### ✅ User Management
- Profile management
- Password change
- Settings preferences
- Statistics tracking

### ✅ Dashboard
- Dynamic data from API
- Real-time statistics
- Course progress visualization
- Activity tracking

---

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
mongod
```

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Verify `CORS_ORIGIN` in server `.env` matches your client URL

### Token Not Being Sent
**Solution:** Ensure token is stored correctly:
```javascript
// Should be in localStorage as:
{
  "id": "...",
  "name": "...",
  "email": "...",
  "role": "...",
  "token": "eyJhbGc..."
}
```

### API 404 Errors
**Solution:** Check that:
1. Server is running on port 3001
2. API base URL in client is correct
3. Endpoint paths match the server routes

---

## Next Steps

### To Make It Production-Ready

1. **Security**
   - Use HTTPS in production
   - Add rate limiting
   - Implement CSRF protection
   - Add input sanitization

2. **Database**
   - Use MongoDB Atlas for production
   - Set up proper backups
   - Add database indexes

3. **Frontend**
   - Build optimized bundle: `npm run build`
   - Add error boundaries
   - Implement lazy loading
   - Add PWA support

4. **Backend**
   - Add comprehensive logging
   - Implement analytics
   - Add email notifications
   - Deploy to cloud (Heroku, AWS, DigitalOcean, etc.)

5. **Testing**
   - Add unit tests
   - Add integration tests
   - Add E2E tests

---

## Common Commands

### Server
```bash
npm run dev      # Start development server with auto-reload
npm start        # Start production server
npm run seed     # Seed database with sample data
```

### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code quality
```

---

## Support & Documentation

For more information:
- Check individual README files in `client/` and `server/` directories
- Review API endpoint documentation in the controllers
- Check model definitions for database schema

---

## Version Info
- Node.js: v18+
- React: v19
- Express: v4
- MongoDB: v6+
- React Router: v7
