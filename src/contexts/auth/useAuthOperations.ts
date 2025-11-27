
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      return { data, error: null };
    } catch (error) {
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Sign in failed' 
        } 
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata: any = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        return { error };
      }
      
      return { data, error: null };
    } catch (error) {
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Sign up failed' 
        } 
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }, []);

  return {
    signIn,
    signUp,
    signOut,
  };
};
