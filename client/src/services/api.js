/**
 * api.js
 * Axios API service configuration for backend integration
 */
import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - adds auth token to requests
api.interceptors.request.use(
    (config) => {
        const storedUser = localStorage.getItem('eduai_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (err) {
                console.error('Error parsing stored user:', err);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - handles common errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Handle specific status codes
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear auth and redirect to login
                    localStorage.removeItem('eduai_user');
                    window.location.href = '/login';
                    break;
                case 403:
                    console.error('Access forbidden:', error.response.data);
                    break;
                case 404:
                    console.error('Resource not found:', error.response.data);
                    break;
                case 500:
                    console.error('Server error:', error.response.data);
                    break;
                default:
                    console.error('API error:', error.response.data);
            }
        } else if (error.request) {
            console.error('Network error - no response received');
        } else {
            console.error('Request configuration error:', error.message);
        }
        return Promise.reject(error);
    }
);

// ============ Auth API ============
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    signup: (userData) => api.post('/auth/signup', userData),
    logout: () => api.post('/auth/logout'),
    refreshToken: (token) => api.post('/auth/refresh', { refreshToken: token }),
    getMe: () => api.get('/auth/me')
};

// ============ User API ============
export const userAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    updatePassword: (data) => api.put('/users/password', data),
    getSettings: () => api.get('/users/settings'),
    updateSettings: (settings) => api.put('/users/settings', settings)
};

// ============ Courses API ============
export const coursesAPI = {
    getAll: (params) => api.get('/courses', { params }),
    getById: (id) => api.get(`/courses/${id}`),
    getEnrolled: () => api.get('/courses/enrolled'),
    enroll: (courseId) => api.post(`/courses/${courseId}/enroll`),
    getProgress: (courseId) => api.get(`/courses/${courseId}/progress`),
    // Instructor methods
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`)
};

// ============ Lessons API ============
export const lessonsAPI = {
    getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
    getById: (id) => api.get(`/lessons/${id}`),
    complete: (id) => api.post(`/lessons/${id}/complete`),
    // Instructor methods
    create: (data) => api.post('/lessons', data),
    update: (id, data) => api.put(`/lessons/${id}`, data),
    delete: (id) => api.delete(`/lessons/${id}`)
};

// ============ Quizzes API ============
export const quizzesAPI = {
    getByCourse: (courseId) => api.get(`/quizzes/course/${courseId}`),
    getById: (id) => api.get(`/quizzes/${id}`),
    submit: (id, answers) => api.post(`/quizzes/${id}/submit`, { answers }),
    getSubmissions: (id) => api.get(`/quizzes/${id}/submissions`),
    // Instructor methods
    create: (data) => api.post('/quizzes', data),
    update: (id, data) => api.put(`/quizzes/${id}`, data),
    delete: (id) => api.delete(`/quizzes/${id}`)
};

export default api;
