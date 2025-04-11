import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const authenticated = isAuthenticated();
  console.log('ProtectedRoute - isAuthenticated:', authenticated);
  
  if (!authenticated) {
    console.log('User not authenticated, redirecting to login...');
    return <Navigate to="/" replace />;
  }
  
  console.log('User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute; 