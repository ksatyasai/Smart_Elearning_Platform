# Smart E-Learning Platform - Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                                 │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              React App (Vite)                                │   │
│  │           http://localhost:5173                              │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │          Authentication Context                     │    │   │
│  │  │  - Store JWT token                                 │    │   │
│  │  │  - Manage user state                               │    │   │
│  │  │  - Handle login/logout/signup                       │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                        ↓                                      │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │           API Service (axios)                       │    │   │
│  │  │  - authAPI                                          │    │   │
│  │  │  - coursesAPI                                       │    │   │
│  │  │  - lessonsAPI                                       │    │   │
│  │  │  - quizzesAPI                                       │    │   │
│  │  │  - userAPI                                          │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  │                        ↓                                      │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │       React Components                              │    │   │
│  │  │  - StudentDashboard (Dynamic!)                      │    │   │
│  │  │  - Login/Signup                                     │    │   │
│  │  │  - Course List                                      │    │   │
│  │  │  - Quiz Interface                                   │    │   │
│  │  │  - Lesson Viewer                                    │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  Request with JWT Token                                              │
│  ─────────────────────────────────────────────────────────────────→  │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER                                    │
│                  http://localhost:3001                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              CORS Middleware                                │   │
│  │  - Allow requests from http://localhost:5173               │   │
│  │  - Allow JSON content-type                                 │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                        ↓                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │          Authentication Middleware                          │   │
│  │  - Extract JWT from Authorization header                   │   │
│  │  - Verify token signature                                  │   │
│  │  - Attach user to request object                           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                        ↓                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Route Handlers                                 │   │
│  │                                                             │   │
│  │  POST /api/auth/login              → authController        │   │
│  │  POST /api/auth/signup             → authController        │   │
│  │  GET  /api/users/profile           → userController        │   │
│  │  GET  /api/courses                 → courseController      │   │
│  │  POST /api/courses/:id/enroll      → courseController      │   │
│  │  GET  /api/lessons/course/:id      → lessonController      │   │
│  │  POST /api/quizzes/:id/submit      → quizController        │   │
│  │  ... and 32 more endpoints                                 │   │
│  │                                                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                        ↓                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Controllers & Business Logic                   │   │
│  │  - Validate inputs                                          │   │
│  │  - Check authorization                                      │   │
│  │  - Execute database queries                                 │   │
│  │  - Format responses                                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                        ↓                                             │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │              Mongoose Models                                │   │
│  │  - User                - Enrollment                         │   │
│  │  - Course              - Progress                           │   │
│  │  - Lesson              - QuizSubmission                     │   │
│  │  - Quiz                - Certificate                        │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                        ↓                                             │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     MONGODB DATABASE                                 │
│                 mongodb://localhost:27017                            │
│                                                                      │
│  Collections (like tables):                                         │
│  ├── users         ─ User accounts with auth info                   │
│  ├── courses       ─ Course data and metadata                       │
│  ├── lessons       ─ Lesson content and links                       │
│  ├── quizzes       ─ Quiz questions and answers                     │
│  ├── enrollments   ─ Student enrollments in courses                 │
│  ├── progresses    ─ Lesson completion tracking                     │
│  ├── quizsubmissions ─ Quiz attempt records                         │
│  └── certificates  ─ Earned certificates                            │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Student Enrolling in a Course

```
1. FRONTEND (React)
   ↓
   Student clicks "Enroll" button
   ↓
   coursesAPI.enroll(courseId)
   ↓
   Sends: POST /api/courses/:id/enroll
         Headers: { Authorization: "Bearer {token}" }
         
2. SERVER (Express)
   ↓
   CORS middleware ✓
   ↓
   Auth middleware → Verify token → Extract user ID
   ↓
   Route: POST /api/courses/:id/enroll → courseController.enrollCourse()
   ↓
   Business Logic:
   - Find course by ID
   - Check if not already enrolled
   - Create enrollment document
   - Update course.studentsEnrolled count
   ↓
   Send response: { success: true, enrollment: {...} }

3. DATABASE (MongoDB)
   ↓
   Create Enrollment document:
   {
     student: ObjectId(user._id),
     course: ObjectId(courseId),
     status: "active",
     progress: 0,
     enrolledAt: Date.now()
   }
   ↓
   Update Course:
   - Increment studentsEnrolled

4. FRONTEND (React)
   ↓
   Receive response
   ↓
   Update UI
   ↓
   Show success message
   ↓
   Refresh courses list
```

---

## Authentication Flow

```
SIGNUP/LOGIN FLOW:

Frontend                          Backend                    Database
   │                                │                           │
   ├─ Submit credentials ──────────>│                           │
   │  (email, password)             │                           │
   │                                ├─ Hash password            │
   │                                ├─ Create User doc ────────>│
   │                                │  with hashed password      │
   │                          <──────┤ Create JWT token          │
   │  Response:                      │  (expires in 7 days)      │
   │  {                              │                           │
   │    token: "eyJhbG...",    <─────┤                           │
   │    user: {id, name, ...}  <─────┤                           │
   │  }                              │                           │
   │                                │                           │
   └─ Store token in localStorage    │                           │

AUTHENTICATED REQUEST FLOW:

Frontend                          Backend                    Database
   │                                │                           │
   │─ API Request                   │                           │
   │  + Authorization header        │                           │
   │  ("Bearer {token}")  ──────────>│                           │
   │                         ┌───────┤ Verify token signature    │
   │                         │       │ Check expiration          │
   │                         │       │ Extract user ID           │
   │                         │       ├─ Query user by ID ──────>│
   │                         │       │                    <──────┤
   │                    <────┴───────┤ Execute business logic    │
   │  Response                       │                           │
   │  (data)                         │                           │
   │                                │                           │
```

---

## Database Relationships

```
┌──────────────────────────────────────────────────────────┐
│                      USER                                │
│  - id (PK)                                               │
│  - name, email, password                                 │
│  - role (student/instructor/admin)                       │
│  - stats (certificates, streak, etc)                     │
└──────────────────────────────────────────────────────────┘
         │                            │
         │                            │
    (Instructor)              (Student)
         │                            │
         ▼                            ▼
┌──────────────────┐      ┌──────────────────┐
│     COURSE       │      │   ENROLLMENT     │
│ - id (PK)        │      │ - id (PK)        │
│ - title          │◄─────│ - student (FK)   │
│ - description    │      │ - course (FK)    │
│ - lessons [] ────┼──┐   │ - progress       │
│ - quizzes [] ────┼──┼─┐ │ - status         │
└──────────────────┘  │ │ └──────────────────┘
         │             │ │         │
         │             │ │    ┌────▼──────────────┐
         │             │ │    │    PROGRESS       │
         │             │ │    │ - student (FK)    │
         │             │ │    │ - course (FK)     │
         │             │ │    │ - lesson (FK)     │
         │             │ │    │ - completed       │
         │             │ │    └───────────────────┘
         │             │ │
         │         ┌────▼──────────┐
         │         │    LESSON      │
         │         │ - id (PK)      │
         │         │ - title        │
         │         │ - content      │
         │         │ - order        │
         │         └────────────────┘
         │
         └──────┐
                │
          ┌─────▼──────────┐
          │    QUIZ        │
          │ - id (PK)      │
          │ - title        │
          │ - questions[]  │
          │ - passing %    │
          └────────────────┘
                 │
                 │
          ┌──────▼──────────────────┐
          │  QUIZSUBMISSION         │
          │ - student (FK)          │
          │ - quiz (FK)             │
          │ - answers[]             │
          │ - score                 │
          │ - passed (boolean)      │
          └─────────────────────────┘
```

---

## Component Architecture (Frontend)

```
App.jsx
└── AuthProvider
    ├── AppRoutes
    │   ├── Landing (Public)
    │   │   └── (No auth required)
    │   │
    │   ├── AuthLayout
    │   │   ├── Login
    │   │   └── Signup
    │   │
    │   └── ProtectedRoute (Auth required)
    │       ├── DashboardLayout
    │       │   ├── StudentDashboard ★ (Dynamic - fetches from API)
    │       │   ├── Course ★ (Dynamic - shows lessons)
    │       │   ├── Lesson
    │       │   ├── Quiz ★ (Dynamic - fetches questions)
    │       │   ├── AITutor
    │       │   ├── Analytics
    │       │   ├── Profile
    │       │   └── [Navbar, Sidebar, Footer]
    │       │
    │       └── InstructorDashboard (Instructor only)
    │           └── [Instructor features]
    │
    └── (Global state)
        - User authentication
        - User profile
        - UI theme

★ = Uses dynamic data from API
```

---

## API Response Examples

### Successful Login Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student",
    "avatar": null,
    "plan": "Premium Plan",
    "verified": true,
    "createdAt": "2024-01-27T10:30:00Z"
  }
}
```

### Enrolled Courses Response
```json
{
  "success": true,
  "count": 2,
  "courses": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "Advanced Machine Learning",
      "image": "https://...",
      "instructor": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "enrollment": {
        "status": "active",
        "progress": 65,
        "enrolledAt": "2024-01-20T10:30:00Z"
      }
    }
  ]
}
```

### Quiz Submission Response
```json
{
  "success": true,
  "submission": {
    "score": 8,
    "percentage": 80,
    "passed": true,
    "totalPoints": 10,
    "submittedAt": "2024-01-27T15:45:00Z"
  }
}
```

---

## Deployment Architecture

```
Production Environment:

┌─────────────────────────────────────────────────────────┐
│                     CDN / Static Host                    │
│  - React build artifacts                                │
│  - Compressed JS/CSS                                    │
│  - Minified assets                                      │
│  └─→ https://elearning.example.com                      │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                  Cloud Server (AWS/DO)                   │
│  - Node.js application                                  │
│  - Express server                                       │
│  - SSL certificate                                      │
│  └─→ https://api.elearning.example.com:3001             │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud)                       │
│  - Managed MongoDB database                             │
│  - Automated backups                                    │
│  - Replica sets for high availability                   │
│  └─→ mongodb+srv://user:pass@cluster.mongodb.net        │
└─────────────────────────────────────────────────────────┘
```

---

## Security Features

```
┌─────────────────────────────────────────────────────────┐
│            Authentication & Authorization                │
├─────────────────────────────────────────────────────────┤
│ ✓ Password hashing (bcryptjs)                           │
│ ✓ JWT token-based auth                                  │
│ ✓ Token expiration (7 days)                             │
│ ✓ Role-based access control                             │
│ ✓ Protected routes                                       │
│ ✓ Automatic logout on 401                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   Data Validation                        │
├─────────────────────────────────────────────────────────┤
│ ✓ Email validation                                       │
│ ✓ Password strength validation                           │
│ ✓ Input sanitization                                     │
│ ✓ MongoDB injection prevention (Mongoose)               │
│ ✓ CORS configuration                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Error Handling                        │
├─────────────────────────────────────────────────────────┤
│ ✓ Global error handler                                   │
│ ✓ Meaningful error messages                              │
│ ✓ Request/response logging                               │
│ ✓ No sensitive data in errors                            │
└─────────────────────────────────────────────────────────┘
```

---

This architecture is:
- **Scalable**: Can handle growing user base
- **Maintainable**: Clear separation of concerns
- **Secure**: Multiple layers of validation and authentication
- **Dynamic**: All data fetched from API (not static)
- **Production-ready**: Can be deployed to the cloud
