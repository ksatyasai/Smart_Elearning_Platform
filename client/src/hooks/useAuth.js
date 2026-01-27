/**
 * useAuth.js
 * Custom hook for accessing authentication context
 */
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth hook
 * Provides easy access to auth context values and methods
 * @returns {object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};

export default useAuth;
