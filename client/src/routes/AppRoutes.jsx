/**
 * AppRoutes.jsx
 * Application routing configuration
 */
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Components
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import StudentDashboard from '../pages/StudentDashboard';
import InstructorDashboard from '../pages/InstructorDashboard';
import CreateCourse from '../pages/CreateCourse';
import CreateQuiz from '../pages/CreateQuiz';
import Course from '../pages/Course';
import Quiz from '../pages/Quiz';
import AITutor from '../pages/AITutor';
import Analytics from '../pages/Analytics';
import Profile from '../pages/Profile';

/**
 * AppRoutes component
 * Defines all application routes with proper layouts and protection
 */
const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />

            {/* Auth Routes - with AuthLayout */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
            </Route>

            {/* Protected Student Routes - with DashboardLayout */}
            <Route element={
                <ProtectedRoute>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route path="/dashboard" element={<StudentDashboard />} />
                <Route path="/courses" element={<StudentDashboard />} />
                <Route path="/course/:id" element={<Course />} />
                <Route path="/course/:courseId/lesson/:lessonId" element={<Course />} />
                <Route path="/quiz/:id" element={<Quiz />} />
                <Route path="/ai-tutor" element={<AITutor />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Profile />} />
            </Route>

            {/* Protected Instructor Routes - with DashboardLayout */}
            <Route element={
                <ProtectedRoute allowedRoles={['instructor']}>
                    <DashboardLayout />
                </ProtectedRoute>
            }>
                <Route path="/instructor" element={<InstructorDashboard />} />
                <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
                <Route path="/instructor/create-course" element={<CreateCourse />} />
                <Route path="/instructor/create-quiz/:courseId" element={<CreateQuiz />} />
                <Route path="/instructor/analytics" element={<Analytics />} />
                <Route path="/instructor/courses" element={<InstructorDashboard />} />
                <Route path="/instructor/courses/:id" element={<Course />} />
                <Route path="/instructor/students" element={<InstructorDashboard />} />
            </Route>

            {/* Fallback - Redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default AppRoutes;
