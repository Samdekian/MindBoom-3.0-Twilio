
import { supabase } from "@/integrations/supabase/client";

/**
 * This utility function can be used to fix a specific user's metadata
 * to match their assigned roles in the database.
 * 
 * IMPORTANT: This should ONLY be run by an administrator.
 * 
 * @param userId The ID of the user to fix
 * @param accountType The account type to set in metadata
 */
export const fixUserMetadata = async (
  userId: string, 
  accountType: 'admin' | 'therapist' | 'patient' | 'support'
): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Fixing metadata for user ${userId} to ${accountType}`);
    
    // Get current user metadata first
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
    
    if (userError) {
      throw userError;
    }
    
    if (!userData || !userData.user) {
      throw new Error("User not found");
    }
    
    // Prepare updated metadata
    const updatedMetadata = {
      ...userData.user.user_metadata,
      accountType
    };
    
    // Update user metadata
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { user_metadata: updatedMetadata }
    );
    
    if (updateError) {
      throw updateError;
    }
    
    // Also update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ account_type: accountType })
      .eq('id', userId);
      
    if (profileError) {
      console.warn("Could not update profile table, but metadata was updated:", profileError);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error fixing user metadata:", error);
    return { 
      success: false, 
      error: error.message || "An unknown error occurred"
    };
  }
};

/**
 * Example usage:
 * 
 * // For the specific user mentioned in the issue:
 * await fixUserMetadata("4742475c-2941-4335-a3ff-e297d1a359b6", "admin");
 */
