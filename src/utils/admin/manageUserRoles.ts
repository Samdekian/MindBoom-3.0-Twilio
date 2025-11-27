
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoleManagementResult {
  success: boolean;
  message: string;
}

/**
 * Manages user roles by adding or removing roles using the database function
 * @param userId The user ID to modify roles for
 * @param roleName The role to add or remove
 * @param operation Either 'assign' or 'remove'
 * @returns Promise with result information
 */
export const manageUserRole = async (
  userId: string,
  roleName: string,
  operation: 'assign' | 'remove'
): Promise<RoleManagementResult> => {
  try {
    // Call the database function to manage user roles
    const { data, error } = await supabase.rpc('manage_user_role', {
      p_user_id: userId,
      p_role_name: roleName,
      p_operation: operation
    });

    if (error) {
      console.error(`Error ${operation}ing role:`, error);
      return {
        success: false,
        message: error.message || `Failed to ${operation} role: ${roleName}`
      };
    }

    console.log(`Role ${operation} result:`, data);
    return {
      success: true,
      message: `Successfully ${operation}ed role: ${roleName}`
    };
  } catch (err: any) {
    console.error(`Failed to ${operation} role:`, err);
    return {
      success: false,
      message: err.message || `An unexpected error occurred while ${operation}ing role: ${roleName}`
    };
  }
};
