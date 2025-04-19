import { Navigate } from 'react-router-dom';
import { useAuth } from './UserAuth';

const RedirectIfNotAuthenticated = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default RedirectIfNotAuthenticated;