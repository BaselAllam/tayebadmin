import { useAuth } from './AuthContext';
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface NotGuestRouteProps {
  children: ReactNode;
}

const NotGuestRoute = ({ children }: NotGuestRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated && !user && !user?.is_staff && user?.user_status !== 'active') {
    window.location.href = '/login';
    return null;
  }

  return (
    <>
      {children}
    </>
  );
};

export default NotGuestRoute;