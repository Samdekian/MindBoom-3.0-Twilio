
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { getGuestRedirect } from '@/utils/routing/unified-route-config';

export const useRequireAuth = (redirectPath?: string) => {
  const { user, loading } = useAuthRBAC();
  const navigate = useNavigate();
  const location = useLocation();
  const [redirectAttempted, setRedirectAttempted] = useState(false);
  const defaultRedirect = redirectPath || getGuestRedirect();
  
  console.log('[useRequireAuth] Current path:', location.pathname);
  console.log('[useRequireAuth] User authenticated:', !!user);
  console.log('[useRequireAuth] Auth loading:', loading);
  console.log('[useRequireAuth] Redirect attempted:', redirectAttempted);
  
  useEffect(() => {
    // Only attempt redirect once auth loading is complete and we haven't already tried
    if (!loading && !user && !redirectAttempted) {
      console.log('[useRequireAuth] No authenticated user, redirecting to:', defaultRedirect);
      
      // Preserve the originally requested URL so we can redirect back after login
      navigate(defaultRedirect, { 
        replace: true,
        state: { from: location.pathname }
      });
      
      // Mark that we've attempted a redirect to prevent loops
      setRedirectAttempted(true);
    }
  }, [loading, user, navigate, defaultRedirect, location.pathname, redirectAttempted]);
  
  return { user, loading };
};

export default useRequireAuth;
