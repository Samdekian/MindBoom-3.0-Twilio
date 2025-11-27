
import { supabase } from "@/integrations/supabase/client";
import { ComponentPermission } from "./component-types";
import { FieldAccessSettings } from "./component-types";
import { safeRpcCall, safeTableFetch } from "./safe-supabase-calls";

/**
 * Check if the current user has all the required permissions
 */
export async function checkPermissions(
  userId: string,
  requiredPermissions: ComponentPermission[]
): Promise<boolean> {
  try {
    // For each permission, check if the user has it
    const { data: userPermissions, error } = await supabase
      .from('user_permissions')
      .select('resource, action, level')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user permissions:', error);
      return false;
    }

    // Check if all required permissions are found
    return requiredPermissions.every(required => 
      userPermissions?.some(userPerm => 
        userPerm.resource === required.resource && 
        userPerm.action === required.action
      )
    );

  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

/**
 * Get field access settings for a specific field
 */
export async function getFieldAccess(
  userId: string, 
  fieldName: string
): Promise<FieldAccessSettings> {
  try {
    // Get field access settings
    const { data, error } = await supabase
      .from('field_access_control')
      .select('read_only, hidden, mask')
      .eq('user_id', userId)
      .eq('field_name', fieldName)
      .maybeSingle();

    if (error) {
      console.error('Error fetching field access settings:', error);
      // Default to most restrictive settings
      return {
        readOnly: true,
        hidden: false,
        mask: false
      };
    }

    // Return field access settings or defaults
    if (!data) {
      // Default access settings when no specific rules are found
      return {
        readOnly: false,
        hidden: false,
        mask: false
      };
    }

    return {
      readOnly: data.read_only || false,
      hidden: data.hidden || false,
      mask: data.mask || false
    };

  } catch (error) {
    console.error('Error getting field access:', error);
    // Default to restrictive settings
    return {
      readOnly: true,
      hidden: false,
      mask: false
    };
  }
}
