
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export interface AuthRBACProfile {
  id: string;
  user_id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAuthRBACProfiles = () => {
  const { user } = useAuthRBAC();

  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['auth-rbac-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auth_rbac_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AuthRBACProfile[];
    },
    enabled: !!user,
  });

  return {
    profiles: profiles || [],
    isLoading,
    error,
  };
};
