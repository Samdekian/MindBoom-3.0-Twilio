
import { useCallback } from 'react';

interface UseAuthStateManagerProps {
  isInitialized: boolean;
  updateAuthState: (user: any, session: any) => void;
  fetchUserRoles: (userId: string) => Promise<any[]>;
  fetchUserPermissions: (userId: string) => Promise<any[]>;
  updateRolesState: (roles: any[], permissions: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStateManager = ({
  isInitialized,
  updateAuthState,
  fetchUserRoles,
  fetchUserPermissions,
  updateRolesState,
  setLoading,
}: UseAuthStateManagerProps) => {
  const handleAuthStateChange = useCallback((event: string, session: any) => {
    console.log('[AuthStateManager] Auth state changed:', event, !!session);
    
    // Update auth state immediately
    updateAuthState(session?.user || null, session);
    
    // Handle role updates for authenticated users
    if (session?.user && isInitialized) {
      // Defer role fetching to avoid blocking auth state updates
      setTimeout(async () => {
        try {
          setLoading(true);
          
          const [roles, permissions] = await Promise.all([
            fetchUserRoles(session.user.id).catch(() => ['patient']),
            fetchUserPermissions(session.user.id).catch(() => [])
          ]);
          
          updateRolesState(roles, permissions);
          console.log('[AuthStateManager] Roles updated for user:', session.user.id);
        } catch (error) {
          console.error('[AuthStateManager] Error updating roles:', error);
        } finally {
          setLoading(false);
        }
      }, 50);
    } else if (!session?.user) {
      // Clear roles when user signs out
      updateRolesState([], []);
    }
  }, [isInitialized, updateAuthState, fetchUserRoles, fetchUserPermissions, updateRolesState, setLoading]);

  return { handleAuthStateChange };
};
