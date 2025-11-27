
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAuthInitializationProps {
  setLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  updateAuthState: (user: any, session: any) => void;
  fetchUserRoles: (userId: string) => Promise<any[]>;
  fetchUserPermissions: (userId: string) => Promise<any[]>;
  updateRolesState: (roles: any[], permissions: any[]) => void;
  setAuthError: (error: string) => void;
}

export const useAuthInitialization = ({
  setLoading,
  setIsInitialized,
  updateAuthState,
  fetchUserRoles,
  fetchUserPermissions,
  updateRolesState,
  setAuthError,
}: UseAuthInitializationProps) => {
  const initializeAuth = useCallback(async () => {
    try {
      console.log('[AuthInitialization] Starting auth initialization...');
      setLoading(true);
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[AuthInitialization] Session error:', error);
        setAuthError(error.message);
        return;
      }
      
      console.log('[AuthInitialization] Session retrieved:', !!session);
      
      // Update auth state with session data
      updateAuthState(session?.user || null, session);
      
      if (session?.user) {
        console.log('[AuthInitialization] User found, loading roles...');
        
        // Simplified role loading - defer complex operations
        setTimeout(async () => {
          try {
            console.log('[AuthInitialization] Fetching roles and permissions...');
            
            const [roles, permissions] = await Promise.all([
              fetchUserRoles(session.user.id).catch(error => {
                console.error('[AuthInitialization] Error fetching roles:', error);
                return ['patient']; // Fallback to patient role
              }),
              fetchUserPermissions(session.user.id).catch(error => {
                console.error('[AuthInitialization] Error fetching permissions:', error);
                return []; // Fallback to empty permissions
              })
            ]);
            
            updateRolesState(roles, permissions);
            console.log('[AuthInitialization] Roles loaded successfully:', roles);
          } catch (error) {
            console.error('[AuthInitialization] Error in deferred role loading:', error);
            // Don't fail completely, just use fallback values
            updateRolesState(['patient'], []);
          }
        }, 100); // Small delay to ensure components are ready
      } else {
        console.log('[AuthInitialization] No active session');
        updateRolesState([], []);
      }
      
    } catch (error) {
      console.error('[AuthInitialization] Critical initialization error:', error);
      setAuthError(error instanceof Error ? error.message : 'Authentication initialization failed');
      // Set fallback state to prevent app crash
      updateAuthState(null, null);
      updateRolesState([], []);
    } finally {
      setIsInitialized(true);
      setLoading(false);
      console.log('[AuthInitialization] Auth initialization completed');
    }
  }, [
    setLoading,
    setIsInitialized,
    updateAuthState,
    fetchUserRoles,
    fetchUserPermissions,
    updateRolesState,
    setAuthError
  ]);

  return { initializeAuth };
};
