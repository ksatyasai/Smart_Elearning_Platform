/**
 * App.jsx
 * Root application component
 * Smart eLearning Platform
 */
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

// Import global styles
import './styles/global.css';

/**
 * App component
 * Wraps the application with necessary providers
 */
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
