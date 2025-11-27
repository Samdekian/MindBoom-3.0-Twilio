
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { getRoleBasedDashboard } from '@/utils/routing/unified-route-config';

/**
 * Hook to redirect authenticated users away from guest-only pages
 */
export const useRequireGuest = () => {
  const { user, isInitialized, primaryRole } = useAuthRBAC();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && user && primaryRole) {
      // Redirect based on user's primary role using unified routing
      const redirectPath = getRoleBasedDashboard(primaryRole);
      navigate(redirectPath, { replace: true });
    }
  }, [isInitialized, user, primaryRole, navigate]);
};
