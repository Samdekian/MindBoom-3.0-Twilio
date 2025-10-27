
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { asUserRoles } from '@/utils/rbac/type-adapters';

interface UseRobustAuthInitProps {
  setLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  updateAuthState: (user: any, session: any) => void;
  updateRolesState: (roles: any[], permissions: any[]) => void;
  getCachedRoles: (userId: string) => any;
  incrementRetry: () => void;
  shouldRetry: () => boolean;
  log: (message: string, data?: any) => void;
}

export const useRobustAuthInit = (props: UseRobustAuthInitProps) => {
  // Destructure props to ensure they're stable
  const {
    setLoading,
    setIsInitialized,
    updateAuthState,
    updateRolesState,
    getCachedRoles,
    incrementRetry,
    shouldRetry,
    log
  } = props;

  const fetchUserRoles = useCallback(async (userId: string) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    log('Fetching user roles', { userId });
    
    try {
      const { data: rolesData, error } = await supabase
        .from('user_roles')
        .select(`
          roles!inner (
            name
          )
        `)
        .eq('user_id', userId);
      
      if (error) {
        log('Error fetching roles', error);
        throw error;
      }
      
      const roles = rolesData?.map((item: any) => item.roles?.name).filter(Boolean) || ['patient'];
      const permissions: any[] = []; // Derive from roles if needed
      
      log('Roles fetched successfully', { roles });
      return { roles: asUserRoles(roles), permissions };
    } catch (error) {
      log('Exception fetching roles', error);
      throw error;
    }
  }, [log]);

  const initializeAuth = useCallback(async () => {
    if (!setLoading || !setIsInitialized || !updateAuthState || !updateRolesState) {
      log('Missing required functions for initialization');
      return;
    }

    try {
      setLoading(true);
      log('Initializing authentication');
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        log('Error getting session', error);
        throw error;
      }
      
      updateAuthState(session?.user || null, session);
      
      if (session?.user) {
        log('User found, fetching roles');
        
        // Check cache first
        const cached = getCachedRoles(session.user.id);
        if (cached) {
          log('Using cached roles');
          updateRolesState(cached.roles, cached.permissions);
        } else {
          // Fetch fresh roles
          try {
            const { roles, permissions } = await fetchUserRoles(session.user.id);
            updateRolesState(roles, permissions);
          } catch (error) {
            log('Failed to fetch roles, using defaults', error);
            updateRolesState(['patient'], []);
          }
        }
      }
      
      log('Authentication initialized successfully');
    } catch (error) {
      log('Auth initialization error', error);
      
      if (shouldRetry && shouldRetry()) {
        incrementRetry();
        log('Retrying auth initialization');
        setTimeout(() => initializeAuth(), 2000);
        return;
      }
      
      // Fallback to default state
      updateAuthState(null, null);
      updateRolesState([], []);
    } finally {
      setLoading(false);
      setIsInitialized(true);
    }
  }, [
    setLoading,
    setIsInitialized,
    updateAuthState,
    updateRolesState,
    getCachedRoles,
    incrementRetry,
    shouldRetry,
    log,
    fetchUserRoles
  ]);

  return { initializeAuth };
};
