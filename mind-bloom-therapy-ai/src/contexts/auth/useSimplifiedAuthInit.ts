
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseSimplifiedAuthInitProps {
  setLoading?: (loading: boolean) => void;
  setIsInitialized?: (initialized: boolean) => void;
  updateAuthState?: (user: any, session: any) => void;
  updateRolesState?: (roles: any[], permissions: any[]) => void;
  fetchUserRoles?: (userId: string) => Promise<any[]>;
  log?: (message: string, data?: any) => void;
}

export const useSimplifiedAuthInit = (props: UseSimplifiedAuthInitProps = {}) => {
  // Destructure with safe fallbacks
  const {
    setLoading = () => {},
    setIsInitialized = () => {},
    updateAuthState = () => {},
    updateRolesState = () => {},
    fetchUserRoles = async () => ['patient'],
    log = () => {}
  } = props;

  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      log('Starting simplified auth initialization');
      
      // Get current session first
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        log('Session error', sessionError);
        // Don't throw, just continue with null session
      }
      
      // Update auth state immediately
      updateAuthState(session?.user || null, session);
      
      // If we have a user, fetch their roles in background
      if (session?.user && fetchUserRoles) {
        log('User found, fetching roles', { userId: session.user.id });
        
        // Use setTimeout to avoid blocking initialization
        setTimeout(async () => {
          try {
            const roles = await fetchUserRoles(session.user.id);
            updateRolesState(roles, []);
            log('Roles loaded successfully', { roles });
          } catch (error) {
            log('Failed to fetch roles, using default', error);
            updateRolesState(['patient'], []);
          }
        }, 100);
      } else {
        log('No user session found');
        updateRolesState([], []);
      }
      
      log('Auth initialization completed successfully');
    } catch (error) {
      log('Auth initialization failed', error);
      // Set safe defaults on error
      updateAuthState(null, null);
      updateRolesState([], []);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [setLoading, setIsInitialized, updateAuthState, updateRolesState, fetchUserRoles, log]);

  // Return stable reference
  return { 
    initializeAuth
  };
};
