
import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/core/rbac';

interface UseAuthInitializationProps {
  setLoading: (loading: boolean) => void;
  setIsInitialized: (initialized: boolean) => void;
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setUserRoles: (roles: UserRole[]) => void;
  setPermissions: (permissions: any[]) => void;
}

export const useAuthInitialization = ({
  setLoading,
  setIsInitialized,
  setUser,
  setSession,
  setUserRoles,
  setPermissions,
}: UseAuthInitializationProps) => {
  const initializationTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializingRef = useRef(false);

  const loadUserRoles = useCallback(async (userId: string): Promise<UserRole[]> => {
    try {
      console.log('[Auth] Loading roles for user:', userId);
      
      // Fix: Get accountType from raw_user_meta_data (faster)
      const { data: { user } } = await supabase.auth.getUser();
      const accountType = (user as any)?.raw_user_meta_data?.accountType;
      
      console.log('[Auth] Raw metadata accountType:', accountType);
      console.log('[Auth] Full raw metadata:', (user as any)?.raw_user_meta_data);
      
      let validRoles: UserRole[] = [];
      if (accountType && ['admin', 'therapist', 'patient', 'support'].includes(accountType)) {
        validRoles = [accountType as UserRole];
      }
      
      // Fallback: get role from database if not in metadata
      if (validRoles.length === 0) {
        try {
          console.log('[Auth] No accountType in metadata, checking database...');
          const { data: primaryRole } = await supabase.rpc('get_primary_role', { 
            p_user_id: userId 
          });
          
          if (primaryRole && ['admin', 'therapist', 'patient', 'support'].includes(primaryRole)) {
            validRoles = [primaryRole as UserRole];
            console.log('[Auth] Got role from database:', primaryRole);
          }
        } catch (dbError) {
          console.error('[Auth] Error fetching role from database:', dbError);
        }
      }
      
      // If no valid roles, assign default 'patient' role
      if (validRoles.length === 0) {
        console.log('[Auth] No valid roles found, assigning default patient role');
        return ['patient'];
      }
      
      console.log('[Auth] Loaded roles:', validRoles);
      return validRoles;
    } catch (error) {
      console.error('[Auth] Error loading roles:', error);
      // Return default role on error
      return ['patient'];
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    // Prevent multiple simultaneous initializations
    if (isInitializingRef.current) {
      console.log('[Auth] Initialization already in progress');
      return;
    }

    isInitializingRef.current = true;
    setLoading(true);

    // Set shorter timeout to prevent hanging
    initializationTimeoutRef.current = setTimeout(() => {
      console.error('[Auth] Initialization timeout after 3 seconds');
      setLoading(false);
      setIsInitialized(true);
      isInitializingRef.current = false;
    }, 3000);

    try {
      console.log('[Auth] Starting initialization...');
      
      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[Auth] Session error:', error);
        throw error;
      }
      
      console.log('[Auth] Session retrieved:', !!session);
      
      // Update auth state
      setSession(session);
      setUser(session?.user || null);
      
      if (session?.user) {
        // Load roles with timeout protection
        const roles = await Promise.race([
          loadUserRoles(session.user.id),
          new Promise<UserRole[]>((_, reject) => 
            setTimeout(() => reject(new Error('Role loading timeout')), 5000)
          )
        ]);
        
        setUserRoles(roles);
        console.log('[Auth] Roles set, initialization should complete');
        
        // Set basic permissions based on roles
        const permissions: any[] = [];
        if (roles.includes('admin')) {
          permissions.push(
            { id: '1', name: 'manage_users', resource: 'users', action: 'write' },
            { id: '2', name: 'view_all_data', resource: 'data', action: 'read' }
          );
        }
        if (roles.includes('therapist')) {
          permissions.push(
            { id: '3', name: 'manage_patients', resource: 'patients', action: 'write' },
            { id: '4', name: 'view_appointments', resource: 'appointments', action: 'read' }
          );
        }
        
        setPermissions(permissions);
      } else {
        console.log('[Auth] No active session');
        setUserRoles([]);
        setPermissions([]);
      }
      
      console.log('[Auth] Initialization completed successfully');
    } catch (error) {
      console.error('[Auth] Initialization error:', error);
      
      // Set fallback state to prevent app crash
      setUser(null);
      setSession(null);
      setUserRoles([]);
      setPermissions([]);
    } finally {
      // Clear timeout and finalize initialization
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      
      setLoading(false);
      setIsInitialized(true);
      isInitializingRef.current = false;
    }
  }, [setLoading, setIsInitialized, setUser, setSession, setUserRoles, setPermissions, loadUserRoles]);

  return { initializeAuth };
};
