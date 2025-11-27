
import { useState } from 'react';
import { useBypassAuthRBAC } from '@/contexts/BypassAuthRBACContext';

/**
 * A version of useRequireAuth that performs no redirection
 */
export const useNoRedirectAuth = (redirectPath: string = '/login') => {
  const { user, loading } = useBypassAuthRBAC();
  const [redirectAttempted] = useState(false);
  
  console.log('[useNoRedirectAuth] BYPASSED: No redirects will be performed');
  
  return { user, loading: false }; // Never loading to avoid loader UI
};

export default useNoRedirectAuth;
