/**
 * AuthContext.jsx
 * Authentication context provider for managing user auth state
 */
import { createContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

// Create the auth context
export const AuthContext = createContext(null);

/**
 * AuthProvider component
 * Wraps the app and provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  // User state - null means not logged in
  const [user, setUser] = useState(null);
  // Loading state for async auth checks
  const [loading, setLoading] = useState(true);
  // Error state for auth errors
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('eduai_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        localStorage.removeItem('eduai_user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login function - calls backend API
   * @param {string} email - User email
   * @param {string} password - User password
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login({ email, password });
      const { user: userData, token, refreshToken } = response.data;

      // Store user and tokens
      const userWithToken = { ...userData, token, refreshToken };
      localStorage.setItem('eduai_user', JSON.stringify(userWithToken));
      setUser(userWithToken);

      return { success: true, user: userWithToken };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Signup function - calls backend API
   * @param {object} userData - User registration data
   */
  const signup = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.signup(userData);
      const { user: newUser, token, refreshToken } = response.data;

      // Store user and tokens
      const userWithToken = { ...newUser, token, refreshToken };
      localStorage.setItem('eduai_user', JSON.stringify(userWithToken));
      setUser(userWithToken);

      return { success: true, user: userWithToken };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout function - calls API and clears auth state
   */
  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('eduai_user');
      setUser(null);
      setError(null);
    }
  }, []);

  /**
   * Update user profile - calls backend API
   * @param {object} updates - Profile updates
   */
  const updateProfile = useCallback(async (updates) => {
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(updates);
      const updatedUser = { ...user, ...response.data.user };
      localStorage.setItem('eduai_user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Clear any auth errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isInstructor: user?.role === 'instructor',
    login,
    signup,
    logout,
    updateProfile,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
