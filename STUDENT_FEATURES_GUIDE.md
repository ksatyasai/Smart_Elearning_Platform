# Student Features Guide - Course Enrollment & Quiz Attempts

## Overview
This guide describes the student-facing features for enrolling in courses and attempting quizzes in the Smart E-Learning Platform.

## Table of Contents
1. [Course Enrollment](#course-enrollment)
2. [Quiz Discovery & Attempts](#quiz-discovery--attempts)
3. [UI Components](#ui-components)
4. [API Integration](#api-integration)
5. [Error Handling](#error-handling)
6. [Technical Implementation](#technical-implementation)

---

## Course Enrollment

### Feature Description
Students can browse courses and enroll in them to access course content and available quizzes.

### Student Workflow
1. **View Course** - Navigate to `/course/:id` to view a course
2. **See Enrollment Status** - Course shows if student is enrolled or not
3. **Enroll** - Click "Enroll Now" button to enroll
4. **Access Content** - After enrollment, student can see course lessons and quizzes

### UI Components

#### Course Header (Non-Enrolled State)
```jsx
{!enrolled && (
    <div className="enrollment-section">
        {enrollError && <div className="enrollment-error">...</div>}
        <button className="enroll-btn" onClick={handleEnroll} disabled={enrolling}>
            <LogIn size={20} />
            {enrolling ? 'Enrolling...' : 'Enroll Now'}
        </button>
        <p className="enrollment-message">Enroll to access quizzes and track your progress</p>
    </div>
)}
```

#### Course Header (Enrolled State)
```jsx
{enrolled && (
    <div className="enrolled-badge">
        <CheckCircle size={20} className="badge-icon" />
        <span>Enrolled</span>
    </div>
)}
```

### State Management
```javascript
const [enrolled, setEnrolled] = useState(false);
const [enrolling, setEnrolling] = useState(false);
const [enrollError, setEnrollError] = useState('');
```

### Enrollment Logic
```javascript
const handleEnroll = async () => {
    try {
        setEnrolling(true);
        setEnrollError('');
        const response = await coursesAPI.enroll(id);
        
        if (response.data.success) {
            setEnrolled(true);
            // Fetch quizzes after enrollment
            if (course?.quizzes?.length > 0) {
                const quizzesRes = await quizzesAPI.getByCourse(id);
                setQuizzes(quizzesRes.data.quizzes || []);
            }
        }
    } catch (err) {
        setEnrollError(err.response?.data?.message || 'Failed to enroll. Please try again.');
    } finally {
        setEnrolling(false);
    }
};
```

---

## Quiz Discovery & Attempts

### Feature Description
After enrolling, students can see available quizzes for the course and attempt them by clicking the "Start Quiz" button.

### Quiz Card Display
```jsx
<div className="quizzes-section">
    <h2>Available Quizzes</h2>
    <div className="quizzes-grid">
        {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
                <div className="quiz-header">
                    <h3>{quiz.title}</h3>
                    <span className="quiz-badge">{quiz.questions.length} Questions</span>
                </div>
                
                <p className="quiz-description">{quiz.description || 'Test your knowledge'}</p>
                
                <div className="quiz-details">
                    <div className="detail-item"><Clock size={16} /><span>{quiz.duration} mins</span></div>
                    <div className="detail-item"><CheckSquare size={16} /><span>Pass: {quiz.passingScore}%</span></div>
                    <div className="detail-item"><Star size={16} /><span>{quiz.totalPoints} points</span></div>
                </div>

                <button className="attempt-quiz-btn" onClick={() => handleStartQuiz(quiz)}>
                    <Play size={18} fill="white" />
                    Start Quiz
                </button>
            </div>
        ))}
    </div>
</div>
```

### Quiz Attempt Handler
```javascript
const handleStartQuiz = (quiz) => {
    navigate(`/quiz/${quiz._id}`);
};
```

### No Quizzes State
```jsx
{enrolled && quizzes.length === 0 && (
    <div className="no-quizzes">
        <CheckSquare size={48} />
        <p>No quizzes available yet</p>
        <span className="hint">Check back later for quiz assignments</span>
    </div>
)}
```

---

## UI Components

### Course.jsx Structure
```
Course Page
├── Course Header
│   ├── Course Title
│   ├── Course Description
│   ├── Course Meta (Rating, Students, Duration)
│   ├── Enrollment Section (if not enrolled)
│   │   ├── Enrollment Error (if any)
│   │   ├── Enroll Button
│   │   └── Enrollment Message
│   ├── Enrolled Badge (if enrolled)
│   └── Course Image
├── Quizzes Section (if enrolled)
│   ├── Quiz Cards Grid
│   │   ├── Quiz Title & Question Count Badge
│   │   ├── Quiz Description
│   │   ├── Quiz Details (Duration, Pass Score, Points)
│   │   └── Start Quiz Button
│   └── No Quizzes Message (if no quizzes)
├── Course Curriculum (if lessons exist)
│   └── Lessons List
│       └── Lesson Items (Video icon, Title, Action)
└── Locked Content Message (if not enrolled)
```

### CSS Classes
- `.enrollment-section` - Container for enrollment UI
- `.enrollment-error` - Error message styling
- `.enroll-btn` - Enrollment button styling
- `.enrolled-badge` - Enrolled state badge
- `.quizzes-section` - Quiz section container
- `.quizzes-grid` - Grid layout for quiz cards
- `.quiz-card` - Individual quiz card styling
- `.quiz-header` - Quiz title and badge
- `.quiz-badge` - Question count badge
- `.quiz-details` - Duration, pass score, points
- `.attempt-quiz-btn` - Start quiz button
- `.no-quizzes` - No quizzes available message
- `.locked-content` - Content locked message
- `.course-loading` - Loading state
- `.course-error` - Error state
- `.course-curriculum` - Course lessons section
- `.lesson-item` - Individual lesson styling

---

## API Integration

### Required API Endpoints

#### 1. Get Course by ID
```javascript
GET /api/courses/:id
Response: {
    success: true,
    course: {
        _id: string,
        title: string,
        description: string,
        image: string,
        rating: number,
        studentsEnrolled: number,
        duration: number,
        lessons: Array,
        quizzes: Array
    }
}
```

#### 2. Get Enrolled Courses
```javascript
GET /api/courses/enrolled
Response: {
    success: true,
    courses: [
        { _id: string, title: string, ... },
        ...
    ]
}
```

#### 3. Enroll in Course
```javascript
POST /api/courses/:id/enroll
Headers: { Authorization: 'Bearer <token>' }
Response: {
    success: true,
    message: "Successfully enrolled in course"
}
```

#### 4. Get Quizzes by Course
```javascript
GET /api/quizzes/course/:courseId
Response: {
    success: true,
    quizzes: [
        {
            _id: string,
            title: string,
            description: string,
            questions: Array,
            duration: number,
            passingScore: number,
            totalPoints: number
        },
        ...
    ]
}
```

### Axios API Service
```javascript
// In client/src/services/api.js
export const coursesAPI = {
    getById: (id) => api.get(`/courses/${id}`),
    getEnrolled: () => api.get('/courses/enrolled'),
    enroll: (courseId) => api.post(`/courses/${courseId}/enroll`)
};

export const quizzesAPI = {
    getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
    getById: (id) => api.get(`/quizzes/${id}`),
    submit: (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, answers)
};
```

---

## Error Handling

### Enrollment Error Display
```jsx
{enrollError && (
    <div className="enrollment-error">
        <AlertCircle size={18} />
        <span>{enrollError}</span>
    </div>
)}
```

### Error States
1. **Enrollment Failed** - Shows error message from API
2. **Course Not Found** - Displays error page with "Go Back" button
3. **Quiz Loading Failed** - Falls back to "No quizzes available"
4. **Network Error** - Handled by API interceptor, shows generic message

### Error Recovery
- Users can retry enrollment by clicking "Enroll Now" again
- "Go Back" button returns to previous page if course not found
- Check browser console for detailed error logs

---

## Technical Implementation

### Course.jsx - Key Functions

#### fetchCourseData()
Fetches course details and checks enrollment status on component mount.

```javascript
const fetchCourseData = async () => {
    try {
        setLoading(true);
        setError(null);

        // Get course details
        const courseRes = await coursesAPI.getById(id);
        setCourse(courseRes.data.course);

        // Check if user is enrolled
        try {
            const enrolledRes = await coursesAPI.getEnrolled();
            const isEnrolled = enrolledRes.data.courses?.some(c => c._id === id);
            setEnrolled(isEnrolled);

            // Get quizzes if enrolled
            if (isEnrolled && courseRes.data.course?.quizzes?.length > 0) {
                const quizzesRes = await quizzesAPI.getByCourse(id);
                setQuizzes(quizzesRes.data.quizzes || []);
            }
        } catch (err) {
            console.log('Error checking enrollment:', err);
            setEnrolled(false);
        }
    } catch (err) {
        console.error('Error fetching course:', err);
        setError('Failed to load course details');
    } finally {
        setLoading(false);
    }
};
```

#### handleEnroll()
Enrolls user in course and fetches associated quizzes.

#### handleStartQuiz()
Navigates to quiz attempt page.

### State Management
```javascript
const [course, setCourse] = useState(null);        // Course data
const [quizzes, setQuizzes] = useState([]);        // Available quizzes
const [loading, setLoading] = useState(true);      // Loading state
const [error, setError] = useState(null);          // Error message
const [enrolled, setEnrolled] = useState(false);   // Enrollment status
const [enrolling, setEnrolling] = useState(false); // Enrollment button state
const [enrollError, setEnrollError] = useState(''); // Enrollment error
```

### Routing
- **Course View**: `/course/:id` - Display course and handle enrollment
- **Quiz Attempt**: `/quiz/:id` - Take quiz (handled by Quiz.jsx)
- **Student Dashboard**: `/courses` or `/dashboard` - Browse available courses

---

## Features in Detail

### 1. Dynamic Course Overview
- Shows course title, description, metadata
- Displays course image if available
- Shows rating, student count, and duration
- Responsive design for mobile devices

### 2. Enrollment Management
- Button changes from "Enroll Now" to "Enrolling..." during process
- Shows error message if enrollment fails
- Badge shows "Enrolled" status after successful enrollment
- Loading state prevents multiple simultaneous enrollments

### 3. Quiz Discovery
- Only visible after enrollment
- Shows all available quizzes in grid layout
- Displays quiz metadata (questions, duration, passing score, points)
- "Start Quiz" button navigates to quiz attempt page
- Shows helpful message when no quizzes available

### 4. Protected Content
- Course lessons hidden until enrolled
- "Enroll to access course content and quizzes" message shown
- Locked content section with clear call-to-action

### 5. Loading & Error States
- Spinner shown while loading course data
- Error page with "Go Back" button if course not found
- Proper error messages for enrollment failures

---

## Testing the Feature

### Manual Testing Steps

1. **Login as Student**
   - Go to login page
   - Enter student credentials

2. **Browse Courses**
   - Go to Student Dashboard or /courses
   - Click on a course to view details

3. **Enroll in Course**
   - Click "Enroll Now" button
   - Wait for enrollment confirmation
   - See "Enrolled" badge appear

4. **View Quizzes**
   - See quizzes section appear after enrollment
   - Verify quiz cards show correct information

5. **Attempt Quiz**
   - Click "Start Quiz" button
   - Get redirected to quiz attempt page

### API Testing

```bash
# Get specific course
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/courses/<courseId>

# Get enrolled courses
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/courses/enrolled

# Enroll in course
curl -X POST -H "Authorization: Bearer <token>" http://localhost:3001/api/courses/<courseId>/enroll

# Get course quizzes
curl -H "Authorization: Bearer <token>" http://localhost:3001/api/quizzes/course/<courseId>
```

---

## Files Modified/Created

1. **client/src/pages/Course.jsx** - Main course view component with enrollment & quiz features
2. **client/src/pages/Course.css** - Complete styling for course page and all UI elements
3. **client/src/services/api.js** - Already contains required API methods
4. **client/src/routes/AppRoutes.jsx** - Routes already configured
5. **server/src/controllers/courseController.js** - Enrollment endpoint implementation
6. **server/src/models/Enrollment.js** - Enrollment model for tracking

---

## Dependencies
- React 18+ (hooks: useState, useEffect)
- React Router v6+ (useParams, useNavigate)
- Lucide React (icons)
- Axios (API calls)
- CSS with CSS Variables for theming

---

## Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 12+, Chrome Mobile 90+)

---

## Performance Considerations
- Quizzes loaded only after enrollment confirmation
- API calls batched for efficiency
- Error boundaries prevent full page crashes
- Loading states indicate ongoing operations

---

## Future Enhancements
1. Quiz attempt history and scores
2. Certificate generation on passing
3. Lesson progress tracking
4. Video player integration
5. Note-taking feature
6. Discussion forums
7. Student performance analytics

---

## Support & Troubleshooting

### Issue: "Enroll Now" button not responding
- Check network connection
- Verify authentication token is valid
- Check browser console for API errors

### Issue: Quizzes not showing after enrollment
- Wait for quizzes to load (check loading state)
- Verify course has quizzes assigned
- Check API endpoint `/api/quizzes/course/:courseId`

### Issue: Can't access quiz attempt page
- Ensure you're enrolled in the course
- Verify quiz ID is correct
- Check authentication token

### Issue: Enrollment fails with error
- Note error message
- Check server logs for details
- Verify course exists and is not full
- Try enrolling again after a moment

---

## Support Contact
For issues or questions, contact the development team or check the troubleshooting documentation.
