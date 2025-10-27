
import { useCallback, useState } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RoleSyncResult {
  success: boolean;
  isConsistent: boolean;
  message: string;
  errors?: string[];
}

/**
 * Hook for manual role synchronization and consistency checks
 */
export const useRoleSync = () => {
  const { user, refreshRoles } = useAuthRBAC();
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  const syncRoles = useCallback(async (): Promise<RoleSyncResult> => {
    if (!user?.id) {
      return {
        success: false,
        isConsistent: false,
        message: 'No authenticated user'
      };
    }

    setSyncing(true);
    
    try {
      // First, check and repair consistency
      const { data: consistencyData, error: consistencyError } = await supabase.rpc(
        'check_and_repair_user_role_consistency',
        {
          p_user_id: user.id,
          p_auto_repair: true
        }
      );

      if (consistencyError) {
        throw new Error(`Consistency check failed: ${consistencyError.message}`);
      }

      const consistencyResult = consistencyData as any;
      const wasConsistent = consistencyResult?.is_consistent || false;

      // Then sync metadata
      const { data: syncData, error: syncError } = await supabase.rpc('sync_user_roles', {
        user_id: user.id
      });

      if (syncError) {
        throw new Error(`Role sync failed: ${syncError.message}`);
      }

      // Refresh roles in context
      await refreshRoles();

      const message = wasConsistent 
        ? 'Roles were already consistent'
        : 'Role inconsistencies detected and repaired';

      toast({
        title: "Role Sync Complete",
        description: message,
        variant: wasConsistent ? "default" : "destructive",
      });

      return {
        success: true,
        isConsistent: wasConsistent,
        message
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Role Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return {
        success: false,
        isConsistent: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    } finally {
      setSyncing(false);
    }
  }, [user?.id, refreshRoles, toast]);

  const checkConsistency = useCallback(async (): Promise<RoleSyncResult> => {
    if (!user?.id) {
      return {
        success: false,
        isConsistent: false,
        message: 'No authenticated user'
      };
    }

    try {
      const { data, error } = await supabase.rpc('verify_user_role_consistency', {
        p_user_id: user.id
      });

      if (error) {
        throw new Error(`Consistency check failed: ${error.message}`);
      }

      const result = data as any;
      const isConsistent = result?.isConsistent || false;

      return {
        success: true,
        isConsistent,
        message: isConsistent ? 'Roles are consistent' : 'Role inconsistencies detected'
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        isConsistent: false,
        message: errorMessage,
        errors: [errorMessage]
      };
    }
  }, [user?.id]);

  return {
    syncRoles,
    checkConsistency,
    syncing
  };
};
