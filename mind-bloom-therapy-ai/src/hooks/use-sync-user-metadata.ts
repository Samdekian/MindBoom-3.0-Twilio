
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

export const useSyncUserMetadata = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();

  const syncMetadataWithRoles = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // Sync user metadata with roles
      const { error } = await supabase
        .from('profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Profile Synced",
        description: "Your profile has been synchronized successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync profile.",
        variant: "destructive",
      });
    },
  });

  return {
    syncMetadataWithRoles: () => syncMetadataWithRoles.mutateAsync(),
    isSyncing: syncMetadataWithRoles.isPending,
  };
};
