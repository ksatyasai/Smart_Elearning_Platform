/**
 * ProtectedRoute.jsx
 * Route guard component for protecting authenticated routes
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * ProtectedRoute component
 * Redirects to login if user is not authenticated
 * @param {ReactNode} children - Child components to render if authenticated
 * @param {Array<string>} allowedRoles - Optional role requirement array (['student'] or ['instructor'])
 */
const ProtectedRoute = ({ children, allowedRoles = null }) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="auth-loading">
                <div className="loading-spinner" />
                <p>Loading...</p>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role requirement if specified
    if (allowedRoles && !allowedRoles.includes(user?.role)) {
        // Redirect to appropriate dashboard based on role
        const redirectPath = user?.role === 'instructor' ? '/instructor' : '/dashboard';
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;
