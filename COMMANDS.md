# Commands & Troubleshooting Guide

## Essential Commands

### Initial Setup

```bash
# Clone/Navigate to project
cd Smart_E-Learning_Platform-main

# Setup Server
cd server
npm install
cp .env.example .env

# Setup Client  
cd ../client
npm install
npm install   # Re-run if .env.local not created

# Make sure .env.local exists
cat .env.local
```

---

## Running the Application

### Terminal 1: Start MongoDB
```bash
mongod
# Leave running, watch for "Waiting for connections"
```

### Terminal 2: Start Server
```bash
cd server
npm run dev
# Should see: "Server running on port 3001"
```

### Terminal 3: Seed Database (Optional but Recommended)
```bash
cd server
npm run seed
# Should see: "Database seeding completed successfully!"
```

### Terminal 4: Start Client
```bash
cd client
npm run dev
# Should see: "Local: http://localhost:5173"
```

---

## Development Commands

### Server Commands
```bash
# Development mode (with auto-reload on file changes)
npm run dev

# Production mode
npm start

# Seed database with sample data
npm run seed

# Check for errors
npm run lint  # (if configured)
```

### Client Commands
```bash
# Development server (Vite)
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Check code quality
npm run lint
```

---

## Verification Checklist

Run these commands to verify everything is working:

### 1. Check Server is Running
```bash
curl http://localhost:3001/health
# Expected: {"success": true, "message": "Server is running"}
```

### 2. Check MongoDB Connection
In server terminal, you should see:
```
MongoDB Connected: localhost
```

### 3. Check API is Accessible
```bash
curl http://localhost:3001/api/courses
# Expected: JSON response with courses array
```

### 4. Check Database was Seeded
Open MongoDB Compass or shell:
```javascript
use smart-elearning
db.users.find()  // Should show 3 users
db.courses.find()  // Should show 3 courses
```

### 5. Check Client Loads
- Open http://localhost:5173
- Should see login page
- No console errors

---

## Common Issues & Solutions

### Issue 1: "Port 3001 already in use"

**Windows PowerShell:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess
Stop-Process -Id <PID> -Force
```

**Mac/Linux:**
```bash
lsof -i :3001
kill -9 <PID>
```

**Or change port in server .env:**
```env
PORT=3002
```

---

### Issue 2: "Cannot find module 'mongoose'"

```bash
cd server
npm install
npm list mongoose  # Verify it's installed
```

---

### Issue 3: "MongoDB connection refused"

```bash
# Check if MongoDB is running
mongod --version  # Should show version

# Start MongoDB
mongod

# On Mac with Homebrew:
brew services start mongodb-community

# On Windows:
# MongoDB should be running as service, or start:
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
```

---

### Issue 4: "CORS error in browser console"

**Cause:** Server CORS configuration doesn't match client URL

**Solution:** Update server `.env`:
```env
CORS_ORIGIN=http://localhost:5173
```

Then restart server.

---

### Issue 5: "Login fails - Invalid credentials"

**Using seed data:**
```
Email: instructor@example.com  (or student1@example.com)
Password: password123
```

**Make sure you ran:**
```bash
npm run seed
```

---

### Issue 6: "Token not being sent to API"

**Check localStorage:**
```javascript
// In browser console
localStorage.getItem('eduai_user')
// Should show an object with "token" property
```

**Check token in requests:**
```javascript
// In browser DevTools Network tab
// Look at Authorization header for API requests
// Should see: "Bearer eyJhbGc..."
```

---

### Issue 7: "Dashboard shows no courses"

**Check these in order:**
1. Are you logged in? (Check login page)
2. Did you seed the database?
3. Try enrolling in a course first (visit /courses)
4. Check browser console for API errors
5. Check server terminal for errors

---

### Issue 8: "Build fails with 'Cannot find module'"

```bash
cd client
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## Debugging Tips

### Enable Detailed Logging

**Server side - Add to routes:**
```javascript
router.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

**Client side - Check Network tab:**
1. Open DevTools (F12)
2. Go to Network tab
3. Make API call
4. Click request to see details
5. Check Status, Headers, Response

---

## Database Queries

### Using MongoDB Shell

```bash
# Start mongo shell
mongosh

# Use database
use smart-elearning

# View data
db.users.find()
db.courses.find()
db.enrollments.find()
db.progress.find()

# Count documents
db.users.countDocuments()

# Find specific user
db.users.findOne({email: "instructor@example.com"})

# Delete all (useful for cleanup)
db.users.deleteMany({})
```

---

## API Testing with Curl

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@example.com","password":"password123"}'
```

### Get All Courses
```bash
curl http://localhost:3001/api/courses
```

### Get Enrolled Courses (with token)
```bash
TOKEN="your_jwt_token_here"
curl http://localhost:3001/api/courses/enrolled \
  -H "Authorization: Bearer $TOKEN"
```

### Enroll in Course (with token)
```bash
TOKEN="your_jwt_token_here"
COURSE_ID="course_id_here"
curl -X POST http://localhost:3001/api/courses/$COURSE_ID/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Performance Commands

### Check Port Usage
```bash
# Windows
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :3001
```

### Monitor Server
```bash
# Add this to see real-time logs
npm run dev 2>&1 | tee server.log
```

### Check File Sizes
```bash
cd client
npm run build
du -sh dist/  # Check build size
```

---

## Useful Tools

### Browser DevTools
```javascript
// Check stored user
console.log(JSON.parse(localStorage.getItem('eduai_user')))

// Clear all data
localStorage.clear()

// Clear specific item
localStorage.removeItem('eduai_user')
```

### Postman Setup
1. Create new environment:
   - `api_url`: http://localhost:3001/api
   - `token`: (leave empty initially)

2. After login, set token:
   ```javascript
   pm.environment.set("token", pm.response.json().token)
   ```

3. Use `{{token}}` in Authorization header

---

## Maintenance Commands

### Clean Install
```bash
# Server
cd server
rm -rf node_modules package-lock.json
npm install

# Client
cd client
rm -rf node_modules package-lock.json
npm install
```

### Reset Database
```bash
# Stop server
# Delete database or:
cd server
npm run seed  # Overwrites all data
```

### Update Dependencies
```bash
cd server
npm update

cd ../client
npm update
```

---

## Production Deployment Commands

### Build Client
```bash
cd client
npm run build
# Creates 'dist' folder for deployment
```

### Build Server for Production
```bash
cd server
npm start  # Production mode
```

### Environment Variables for Production
```bash
# Server .env
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart-elearning
JWT_SECRET=your_super_secret_production_key
CORS_ORIGIN=https://yourdomain.com

# Client .env.production
VITE_API_URL=https://api.yourdomain.com
```

---

## Quick Reference

```bash
# Full startup sequence
cd Smart_E-Learning_Platform-main

# Terminal 1
mongod

# Terminal 2
cd server && npm install && cp .env.example .env && npm run dev

# Terminal 3  
cd server && npm run seed

# Terminal 4
cd client && npm install && npm run dev

# Open browser
http://localhost:5173
```

---

## Environment Setup Verification

```bash
# Check Node version (need v18+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version

# Check git (optional)
git --version
```

---

## Recovery Commands

### If Everything is Broken
```bash
# Completely clean install
rm -rf server/node_modules client/node_modules
npm --version  # Verify npm works
cd server && npm install && npm run dev
# In new terminal:
cd client && npm install && npm run dev
```

### Restart Services
```bash
# Kill all Node processes
killall node  # Mac/Linux
taskkill /F /IM node.exe  # Windows

# Kill MongoDB
killall mongod  # Mac/Linux
taskkill /F /IM mongod.exe  # Windows
```

---

## Monitoring & Logs

### View Server Logs
```bash
# If using pm2
pm2 logs

# If running with npm
# Press Ctrl+C to stop, logs stop
```

### View Client Errors
1. Open DevTools (F12)
2. Console tab - JavaScript errors
3. Network tab - Failed API calls
4. Application tab - localStorage, cookies

---

## Command Summary Table

| Action | Command |
|--------|---------|
| Install server deps | `cd server && npm install` |
| Install client deps | `cd client && npm install` |
| Start MongoDB | `mongod` |
| Start server | `cd server && npm run dev` |
| Seed DB | `cd server && npm run seed` |
| Start client | `cd client && npm run dev` |
| Build client | `cd client && npm run build` |
| Test API | `curl http://localhost:3001/health` |
| Clear cache | `npm cache clean --force` |
| Kill process on port | `lsof -i :PORT \| grep LISTEN \| awk '{print $2}' \| xargs kill` |

---

## Still Having Issues?

1. Check logs in both terminals
2. Verify all services running (MongoDB, Server, Client)
3. Check .env files have correct values
4. Check browser console (F12)
5. Check server terminal for errors
6. Try refreshing browser
7. Try hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
8. Review QUICK_START.md
9. Review SETUP_GUIDE.md

**90% of issues are:**
- MongoDB not running
- Port already in use  
- .env files not configured
- Dependencies not installed
- Server not restarted after .env change
