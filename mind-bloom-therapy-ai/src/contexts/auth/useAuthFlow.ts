
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { asUserRoles } from '@/utils/rbac/type-adapters';

interface UseAuthFlowProps {
  updateAuthState: (user: any, session: any) => void;
  updateRolesState: (roles: any[], permissions: any[]) => void;
  setLoading: (loading: boolean) => void;
  log: (message: string, data?: any) => void;
}

export const useAuthFlow = (props: UseAuthFlowProps) => {
  const { updateAuthState, updateRolesState, setLoading, log } = props;

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      log('Starting sign in process', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        log('Sign in error', error);
        return { error };
      }
      
      log('Sign in successful', { userId: data.user?.id });
      return { data, error: null };
    } catch (error) {
      log('Sign in exception', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Sign in failed' 
        } 
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, log]);

  const signUp = useCallback(async (email: string, password: string, metadata: any = {}) => {
    try {
      setLoading(true);
      log('Starting sign up process', { email });
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        log('Sign up error', error);
        return { error };
      }
      
      log('Sign up successful', { userId: data.user?.id });
      return { data, error: null };
    } catch (error) {
      log('Sign up exception', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Sign up failed' 
        } 
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, log]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      log('Starting sign out process');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        log('Sign out error', error);
        throw error;
      }
      
      // Clear auth state immediately
      updateAuthState(null, null);
      updateRolesState([], []);
      
      log('Sign out successful');
    } catch (error) {
      log('Sign out exception', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, updateAuthState, updateRolesState, log]);

  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      log('Fetching user roles', { userId });
      
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
        return ['patient'];
      }
      
      const roles = rolesData?.map((item: any) => item.roles?.name).filter(Boolean) || ['patient'];
      log('Roles fetched successfully', { roles });
      return asUserRoles(roles);
    } catch (error) {
      log('Exception fetching roles', error);
      return ['patient'];
    }
  }, [log]);

  return {
    signIn,
    signUp,
    signOut,
    fetchUserRoles,
  };
};
