import { Navigate } from 'react-router-dom';
import { useAuth } from './UserAuth';

const RedirectIfAuthenticated = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
};

export default RedirectIfAuthenticated;