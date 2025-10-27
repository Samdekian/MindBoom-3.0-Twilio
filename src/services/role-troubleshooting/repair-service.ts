
import { supabase } from "@/integrations/supabase/client";

/**
 * Repair role consistency issues
 * @param userId User ID to repair
 */
export const repairRoleConsistency = async (userId: string): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .rpc('sync_user_roles', { user_id: userId });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error("Error repairing roles:", error);
    return { 
      success: false, 
      error: error.message || "Error repairing roles" 
    };
  }
};

/**
 * Manually assign or remove a role
 * @param userId User ID
 * @param action Action to take (assign or remove)
 */
export const handleRoleManualUpdate = async (
  userId: string,
  action: 'assign' | 'remove'
): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    // For this simple version, we just trigger role sync
    // In a real implementation, you would have UI to select roles
    const { error } = await supabase
      .rpc('sync_user_roles', { user_id: userId });
      
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error ${action}ing role:`, error);
    return { 
      success: false, 
      error: error.message || `Error ${action}ing role` 
    };
  }
};
