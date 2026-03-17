import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getRoleHomePath, normalizeRole } from '../utils/role';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = normalizeRole(user?.role);
    const canAccess = allowedRoles.map((role) => role.toLowerCase()).includes(currentRole);
    if (!canAccess) {
      return <Navigate to={getRoleHomePath(user)} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
