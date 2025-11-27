
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useAuthRBACProfiles } from '@/hooks/useAuthRBACProfiles';

export const useRoleAssignment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthRBAC();
  const { profiles } = useAuthRBACProfiles();

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from('auth_rbac_profiles')
        .upsert([
          {
            user_id: userId,
            role: role,
            is_active: true,
            updated_at: new Date().toISOString(),
          }
        ])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-rbac-profiles'] });
      toast({
        title: 'Role assigned successfully',
        description: 'The user role has been updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error assigning role',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const removeRole = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('auth_rbac_profiles')
        .update({ is_active: false })
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-rbac-profiles'] });
      toast({
        title: 'Role removed successfully',
        description: 'The user role has been deactivated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error removing role',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  return {
    assignRole,
    removeRole,
    isAssigning: assignRole.isPending,
    isRemoving: removeRole.isPending,
    profiles,
    assignError: assignRole.error,
    removeError: removeRole.error,
  };
};
