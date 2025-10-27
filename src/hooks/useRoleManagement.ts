
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBACProfiles } from './useAuthRBACProfiles';
import { useRoleListing } from './role/use-role-listing';

export const useRoleManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profiles } = useAuthRBACProfiles();
  const { listUsers, listRoles, isLoading: roleListingLoading, error: roleListingError } = useRoleListing();

  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role_id: role }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-rbac-profiles'] });
      toast({
        title: "Role Assigned",
        description: "User role has been successfully assigned.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign role.",
        variant: "destructive",
      });
    },
  });

  const removeRole = useMutation({
    mutationFn: async (roleAssignmentId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleAssignmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-rbac-profiles'] });
      toast({
        title: "Role Removed",
        description: "User role has been successfully removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Removal Failed",
        description: error.message || "Failed to remove role.",
        variant: "destructive",
      });
    },
  });

  const assignRoleFunction = async (userId: string, role: string): Promise<boolean> => {
    try {
      await assignRole.mutateAsync({ userId, role });
      return true;
    } catch (error) {
      return false;
    }
  };

  const removeRoleFunction = async (userId: string, roleId: string): Promise<boolean> => {
    try {
      await removeRole.mutateAsync(roleId);
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    assignRole: assignRoleFunction,
    removeRole: removeRoleFunction,
    assignRoleFunction,
    removeRoleFunction,
    isAssigning: assignRole.isPending,
    isRemoving: removeRole.isPending,
    isLoading: roleListingLoading,
    assignError: assignRole.error,
    removeError: removeRole.error,
    error: roleListingError,
    profiles,
    listUsers,
    listRoles,
  };
};
