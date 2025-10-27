
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { getRoleBasedDashboard } from '@/utils/routing/unified-route-config';
import { SimpleLoading } from '@/components/ui/simple-loading';
import { useMigrationTracking } from '@/utils/migration/migration-helpers';

interface GuestRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export const GuestRoute: React.FC<GuestRouteProps> = ({ 
  children, 
  redirectPath
}) => {
  const { user, loading, primaryRole, isInitialized } = useAuthRBAC();
  const location = useLocation();
  
  // Track migration
  useMigrationTracking('GuestRoute', 'useAuthRBAC');
  
  if (loading || !isInitialized) {
    return <SimpleLoading text="Checking authentication..." />;
  }
  
  if (user && primaryRole) {
    const redirect = redirectPath || getRoleBasedDashboard(primaryRole);
    return <Navigate to={redirect} replace state={{ from: location.pathname }} />;
  }
  
  return <>{children}</>;
};

export default GuestRoute;
