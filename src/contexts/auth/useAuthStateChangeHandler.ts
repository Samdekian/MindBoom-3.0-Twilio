
import { useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { asUserRoles } from '@/utils/rbac/type-adapters';

interface UseAuthStateChangeHandlerProps {
  updateAuthState: (user: User | null, session: Session | null) => void;
  updateRolesState: (roles: any[], permissions: any[]) => void;
  getCachedRoles: (userId: string) => any;
  isInitialized: boolean;
  log: (message: string, data?: any) => void;
}

export const useAuthStateChangeHandler = (props: UseAuthStateChangeHandlerProps) => {
  // Ensure props are stable
  const {
    updateAuthState,
    updateRolesState,
    getCachedRoles,
    isInitialized,
    log
  } = props;

  const handleAuthStateChange = useCallback(async (event: string, session: Session | null) => {
    if (!updateAuthState || !updateRolesState || !log) {
      console.error('[AuthRBAC] Missing required functions for auth state change');
      return;
    }

    log('Auth state change', { event, hasSession: !!session });
    
    try {
      const user = session?.user || null;
      updateAuthState(user, session);
      
      if (user && isInitialized) {
        // Check cache first
        const cached = getCachedRoles && getCachedRoles(user.id);
        if (cached) {
          log('Using cached roles after auth change');
          updateRolesState(cached.roles, cached.permissions);
        } else {
          // Fetch fresh roles
          try {
            const { data: rolesData, error } = await supabase
              .from('user_roles')
              .select(`
                roles!inner (
                  name
                )
              `)
              .eq('user_id', user.id);
            
            if (error) {
              log('Error fetching roles after auth change', error);
              updateRolesState(['patient'], []);
            } else {
              const roles = rolesData?.map((item: any) => item.roles?.name).filter(Boolean) || ['patient'];
              updateRolesState(asUserRoles(roles), []);
              log('Roles fetched after auth change', { roles });
            }
          } catch (error) {
            log('Exception fetching roles after auth change', error);
            updateRolesState(['patient'], []);
          }
        }
      } else if (!user) {
        // Clear roles when user logs out
        updateRolesState([], []);
      }
    } catch (error) {
      log('Error in auth state change handler', error);
    }
  }, [updateAuthState, updateRolesState, getCachedRoles, isInitialized, log]);

  return { handleAuthStateChange };
};
