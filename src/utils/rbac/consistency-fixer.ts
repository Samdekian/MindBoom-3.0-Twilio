
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./types";
import { toast } from "@/components/ui/use-toast";

/**
 * Fixes inconsistency for a specific user
 * @param userId User ID to fix
 * @param primaryRole The primary role to set
 */
export const fixUserDataInconsistency = async (
  userId: string,
  primaryRole: UserRole | string
): Promise<boolean> => {
  try {
    // Call the sync_user_roles RPC function
    const { data, error } = await supabase.rpc(
      "sync_user_roles", 
      { user_id: userId }
    );
    
    if (error) {
      throw error;
    }
    
    // Log the fix
    await supabase.from("audit_logs").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      activity_type: "data_consistency_fix",
      resource_type: "user_roles",
      resource_id: userId,
      metadata: { 
        fixed_role: primaryRole, 
        source: "automatic_consistency_check" 
      }
    });
    
    return true;
  } catch (error) {
    console.error(`Failed to fix user data for ${userId}:`, error);
    return false;
  }
};
