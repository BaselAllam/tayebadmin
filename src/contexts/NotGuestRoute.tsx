import { useAuth } from './AuthContext';
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { adminModules } from './PermGurad';

interface NotGuestRouteProps {
  children: ReactNode;
  module: string;
}

const NotGuestRoute = ({ children, module }: NotGuestRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    window.location.href = '/login';
    return null;
  }

  if (user && user.user_role !== 'admin' && adminModules.includes(module)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      {children}
    </>
  );
};

export default NotGuestRoute;