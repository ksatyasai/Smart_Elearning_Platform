# Smart E-Learning Platform - Quick Reference Card

## 🚀 Get Started in 3 Steps

### Step 1: Start MongoDB
```bash
mongod
# Keep running in background
```

### Step 2: Start Server
```bash
cd server
npm install     # First time only
npm run seed    # First time only (optional)
npm run dev     # Runs on port 3001
```

### Step 3: Start Client
```bash
cd client
npm install     # First time only
npm run dev     # Runs on port 5173
```

---

## 🔑 Test Login Credentials

```
Email: instructor@example.com
Password: password123
Role: Instructor

OR

Email: student1@example.com  
Password: password123
Role: Student
```

---

## 📍 URLs

| Component | URL | Purpose |
|-----------|-----|---------|
| Client | http://localhost:5173 | React app |
| Server | http://localhost:3001 | API |
| API Health | http://localhost:3001/health | Check if running |
| MongoDB | localhost:27017 | Database |

---

## 📝 What Was Created

✅ **Backend:** 25 files
- 8 Database models
- 5 API controllers
- 5 Route handlers
- 40+ endpoints

✅ **Frontend:** Updated 3 files
- Authentication with real API
- Dynamic StudentDashboard
- API service integration

✅ **Documentation:** 6 files
- QUICK_START.md
- SETUP_GUIDE.md  
- IMPLEMENTATION_SUMMARY.md
- ARCHITECTURE.md
- COMMANDS.md
- FILE_INVENTORY.md

---

## 🔑 Key Files

### Most Important
| File | What It Does |
|------|--------------|
| `server/src/index.js` | Starts the server |
| `client/src/context/AuthContext.jsx` | Manages login |
| `client/src/services/api.js` | Makes API calls |

### Controllers (Business Logic)
| File | Handles |
|------|---------|
| `authController.js` | Login/signup |
| `courseController.js` | Courses |
| `lessonController.js` | Lessons |
| `quizController.js` | Quizzes |
| `userController.js` | Profiles |

### Models (Database)
| Model | Stores |
|-------|--------|
| User | Accounts |
| Course | Course info |
| Lesson | Lesson content |
| Quiz | Questions |
| Enrollment | Who's in what |
| Progress | Lesson tracking |
| QuizSubmission | Quiz results |
| Certificate | Earned certs |

---

## 🐛 Fix Common Issues

### "Cannot connect to MongoDB"
```bash
mongod
# Start MongoDB in separate terminal
```

### "Port 3001 already in use"
```bash
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :3001
kill -9 <PID>
```

### "Module not found"
```bash
npm install
# Reinstall dependencies
```

### "CORS error in browser"
- Check `CORS_ORIGIN` in server `.env`
- Should be `http://localhost:5173`
- Restart server after changing

### "Login not working"
- Did you run `npm run seed`?
- Check email: `instructor@example.com`
- Password: `password123`
- Check server terminal for errors

---

## 📡 API Endpoints Reference

### Auth (No token needed)
```
POST   /api/auth/login        - Login
POST   /api/auth/signup       - Register  
POST   /api/auth/logout       - Logout
```

### Auth (Token needed)
```
GET    /api/auth/me           - Get current user
POST   /api/auth/refresh      - Refresh token
```

### Users (Token needed)
```
GET    /api/users/profile     - Get profile
PUT    /api/users/profile     - Update profile
PUT    /api/users/password    - Change password
```

### Courses
```
GET    /api/courses           - Browse courses
GET    /api/courses/:id       - Course details
POST   /api/courses/:id/enroll - Enroll (token needed)
GET    /api/courses/enrolled  - Your courses (token needed)
```

### Lessons (Token needed)
```
GET    /api/lessons/course/:courseId  - Get lessons
GET    /api/lessons/:id               - Get lesson
POST   /api/lessons/:id/complete      - Mark complete
```

### Quizzes (Token needed)
```
GET    /api/quizzes/course/:courseId  - Get quizzes
GET    /api/quizzes/:id               - Get quiz
POST   /api/quizzes/:id/submit        - Submit answers
```

---

## 🎯 Common Tasks

### Login to App
1. Go to http://localhost:5173
2. Click "Login"
3. Enter credentials
4. Click "Continue"

### Enroll in Course
1. Go to "Courses" page
2. Click "Enroll" button
3. Course appears in dashboard

### View Progress
1. Go to Dashboard
2. See "My Courses"
3. Check progress bar

### Take a Quiz
1. Open a course
2. Scroll to "Quizzes"
3. Click quiz title
4. Answer questions
5. Click "Submit"

---

## ⚙️ Configuration Files

### Server `.env`
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-elearning
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### Client `.env.local`
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🔍 Verify Everything Works

```bash
# 1. Server health check
curl http://localhost:3001/health

# 2. Get courses
curl http://localhost:3001/api/courses

# 3. Check database
# Open MongoDB Compass
# Connect to: mongodb://localhost:27017
# Database: smart-elearning
```

---

## 📊 Database Schema Quick View

```
User (Accounts)
├── name, email, password (hashed)
├── role (student/instructor/admin)
└── stats (certificates, streak, etc)

Course
├── title, description
├── instructor (User ID)
├── lessons (Lesson IDs)
└── quizzes (Quiz IDs)

Lesson
├── title, content (HTML)
├── course (Course ID)
└── duration

Quiz
├── title
├── questions (array)
├── course (Course ID)
└── passing score

Enrollment
├── student (User ID)
├── course (Course ID)
└── progress (0-100%)

Progress
├── student (User ID)
├── lesson (Lesson ID)
└── completed (true/false)

QuizSubmission
├── student (User ID)
├── quiz (Quiz ID)
├── answers
├── score
└── passed (true/false)

Certificate
├── student (User ID)
├── course (Course ID)
└── earnedAt (date)
```

---

## 💾 Terminal Commands Cheat Sheet

```bash
# Install dependencies
npm install

# Start development
npm run dev

# Seed database (server only)
npm run seed

# Build for production (client only)
npm run build

# Preview build (client only)
npm run preview

# View logs (depending on how you start)
# Usually shows in terminal automatically
```

---

## 🚨 Emergency Fixes

### Everything Broken?
```bash
# Complete reset
rm -rf server/node_modules client/node_modules
npm cache clean --force
cd server && npm install && npm run dev
# New terminal:
cd client && npm install && npm run dev
```

### Need to Restart?
```bash
# Kill Node processes
killall node          # Mac/Linux
taskkill /F /IM node.exe  # Windows

# Restart MongoDB
# Or check if service is running
```

### Database Messed Up?
```bash
cd server
npm run seed
# Recreates all sample data
```

---

## ✅ Success Checklist

- [ ] MongoDB running (shows "Waiting for connections")
- [ ] Server running on port 3001 (shows "Server running")
- [ ] Client running on port 5173 (shows URL)
- [ ] No red errors in any terminal
- [ ] Browser opens at http://localhost:5173
- [ ] Login page loads
- [ ] Can login with credentials
- [ ] Dashboard shows courses
- [ ] No errors in browser console (F12)

---

## 📚 Documentation Index

| File | Purpose | Read When |
|------|---------|-----------|
| QUICK_START.md | Get running | First |
| SETUP_GUIDE.md | Detailed setup | Need details |
| COMMANDS.md | All commands | Need reference |
| ARCHITECTURE.md | How it works | Want to learn |
| IMPLEMENTATION_SUMMARY.md | What was built | Want overview |
| FILE_INVENTORY.md | Complete list | Need reference |

---

## 🎓 Learning Resources

### Understanding the Code
1. Read ARCHITECTURE.md for system overview
2. Look at models (database schema)
3. Look at controllers (business logic)
4. Look at routes (API endpoints)
5. Look at React components

### Testing API
1. Use browser DevTools Network tab
2. Or use curl commands (see COMMANDS.md)
3. Or use Postman app
4. Check server console for logs

### Debugging
1. Check browser console (F12)
2. Check server terminal
3. Check MongoDB Compass
4. Use Network tab to see requests
5. Add console.log statements

---

## 🚀 Next Steps

1. ✅ Get it running (this page helps!)
2. ✅ Test with sample data
3. ✅ Read ARCHITECTURE.md
4. ✅ Explore code files
5. ✅ Add new features
6. ✅ Deploy to cloud

---

## 💬 When Something Goes Wrong

1. **Check terminal output** - Usually tells you the problem
2. **Check browser console** - F12 → Console tab
3. **Check .env files** - Most issues here
4. **Restart everything** - Often fixes it
5. **Check COMMANDS.md** - Solution usually there
6. **Read SETUP_GUIDE.md** - More detail

---

## ⏱️ Typical Session

```
1. Start MongoDB     (stays running)
   ↓
2. Start Server      (port 3001)
   ↓
3. Start Client      (port 5173)
   ↓
4. Open Browser      (http://localhost:5173)
   ↓
5. Login             (instructor@example.com / password123)
   ↓
6. Start Coding!
```

---

## 🎯 Most Important Things to Remember

1. **MongoDB must be running** - Start it first
2. **.env files must be configured** - Copy .example and edit
3. **Use `npm run seed`** - Gets test data in database
4. **Check terminal for errors** - Usually tells you problem
5. **Token stored in localStorage** - Check if missing with DevTools
6. **Restart after changing .env** - Changes don't apply until restart

---

**Everything works! Just follow the "Get Started in 3 Steps" at the top.** ✅

Lost? Read QUICK_START.md or SETUP_GUIDE.md!
