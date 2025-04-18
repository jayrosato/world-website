import { Navigate } from 'react-router-dom';
import { useAuth } from './UserAuth';

const RedirectIfNotAuthenticated = ({ children }) => {
  const { user } = useAuth();
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the protected content
  return children;
};

export default RedirectIfNotAuthenticated;