
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { getGuestRedirect } from '@/utils/routing/unified-route-config';
import { SimpleLoading } from '@/components/ui/simple-loading';
import { useMigrationTracking } from '@/utils/migration/migration-helpers';

interface AuthRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const AuthRoute: React.FC<AuthRouteProps & React.HTMLAttributes<HTMLDivElement>> = ({ 
  children, 
  redirectPath,
  ...rest 
}) => {
  const { user, loading, isAuthenticated } = useAuthRBAC();
  const location = useLocation();
  
  // Track migration
  useMigrationTracking('AuthRoute', 'useAuthRBAC');
  
  if (loading) {
    return <SimpleLoading text="Verifying authentication..." />;
  }
  
  if (!isAuthenticated) {
    const redirect = redirectPath || getGuestRedirect();
    return <Navigate to={redirect} state={{ from: location.pathname }} replace />;
  }
  
  return <div {...rest}>{children}</div>;
};

export default AuthRoute;
