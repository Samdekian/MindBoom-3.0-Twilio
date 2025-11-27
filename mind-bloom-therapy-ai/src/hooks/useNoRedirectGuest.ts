
import { useState } from 'react';
import { useBypassAuthRBAC } from '@/contexts/BypassAuthRBACContext';

/**
 * A version of useRequireGuest that performs no redirection
 */
export const useNoRedirectGuest = (redirectPath?: string) => {
  const { user, loading } = useBypassAuthRBAC();
  const [redirectAttempted] = useState(false);
  
  console.log('[useNoRedirectGuest] BYPASSED: No redirects will be performed');
  
  return { user, loading: false }; // Never loading to avoid loader UI
};

export default useNoRedirectGuest;
