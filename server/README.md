# Smart E-Learning Platform - Server

Node.js/Express backend for the Smart E-Learning Platform with MongoDB database.

## Features

- User authentication (JWT-based)
- Course management
- Lessons and content delivery
- Quiz system
- User analytics and progress tracking
- AI Tutor integration ready
- Instructor dashboard
- Student dashboard

## Installation

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
- MongoDB connection string
- JWT secrets
- CORS origin (client URL)

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database (Sample Data)
```bash
npm run seed
```

## API Structure

```
/api
  /auth
    POST /login
    POST /signup
    POST /logout
    POST /refresh
  /users
    GET /profile
    PUT /profile
    PUT /password
    GET /settings
    PUT /settings
  /courses
    GET /
    GET /:id
    POST / (instructor only)
    PUT /:id (instructor only)
    DELETE /:id (instructor only)
    POST /:id/enroll
    GET /:id/progress
  /lessons
    GET /course/:courseId
    GET /:id
    POST /:id/complete
  /quizzes
    GET /course/:courseId
    GET /:id
    POST /:id/submit
  /analytics
    GET /student
    GET /instructor
```

## Database Models

- **User**: Students and Instructors
- **Course**: Course information and content
- **Lesson**: Individual lesson modules
- **Quiz**: Quiz questions and answers
- **Enrollment**: Student course enrollments
- **Progress**: Student progress tracking
- **Certificate**: Certificates earned

## Environment Variables

See `.env.example` for all required variables.

## Error Handling

All endpoints return consistent error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "error_code"
}
```

## CORS Configuration

Configure the CORS_ORIGIN in `.env` to match your client URL.
Default: `http://localhost:5173`
