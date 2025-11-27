
import { supabase } from "@/integrations/supabase/client";

export interface ApprovalStatusResult {
  success: boolean;
  error?: string;
  details?: any;
}

export const updateTherapistApprovalStatus = async (
  therapistId: string,
  newStatus: 'approved' | 'rejected',
  adminUserId: string,
  adminNotes?: string
): Promise<ApprovalStatusResult> => {
  console.log(`[approvalUtils] Starting approval status update:`, {
    therapistId,
    newStatus,
    adminUserId,
    adminNotes
  });

  try {
    // Input validation
    if (!therapistId || !newStatus || !adminUserId) {
      throw new Error('Missing required parameters for approval status update');
    }

    // Validate admin status first
    console.log(`[approvalUtils] Verifying admin status for user: ${adminUserId}`);
    const { data: isAdminData, error: adminCheckError } = await supabase.rpc('is_admin_bypass_rls', {
      check_user_id: adminUserId
    });

    if (adminCheckError) {
      console.error(`[approvalUtils] Admin verification error:`, adminCheckError);
      throw new Error(`Admin verification failed: ${adminCheckError.message}`);
    }

    if (!isAdminData) {
      throw new Error('Only administrators can update approval status');
    }

    console.log(`[approvalUtils] Admin verification successful`);

    // Use the correct database function that exists
    console.log(`[approvalUtils] Calling update_therapist_approval_simple function`);
    const { error: updateError } = await supabase.rpc('update_therapist_approval_simple', {
      therapist_id: therapistId,
      new_status: newStatus,
      admin_user_id: adminUserId,
      admin_notes: adminNotes || null
    });

    if (updateError) {
      console.error(`[approvalUtils] Database function error:`, updateError);
      throw new Error(`Database error: ${updateError.message}`);
    }

    console.log(`[approvalUtils] Successfully updated therapist status to ${newStatus}`);

    return { 
      success: true, 
      details: { therapistId, newStatus, adminNotes }
    };

  } catch (error: any) {
    console.error(`[approvalUtils] Approval status update failed:`, error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred during approval status update',
      details: error
    };
  }
};

// Enhanced consistency check function
export const checkTherapistDataConsistency = async (adminUserId: string): Promise<ApprovalStatusResult> => {
  try {
    console.log(`[approvalUtils] Running consistency check as admin: ${adminUserId}`);
    
    const { data: cleanupResult, error: cleanupError } = await supabase.rpc('cleanup_therapist_inconsistencies');
    
    if (cleanupError) {
      console.error(`[approvalUtils] Consistency check error:`, cleanupError);
      throw new Error(`Consistency check failed: ${cleanupError.message}`);
    }
    
    console.log(`[approvalUtils] Consistency check completed:`, cleanupResult);
    
    return {
      success: true,
      details: cleanupResult
    };
  } catch (error: any) {
    console.error(`[approvalUtils] Consistency check failed:`, error);
    return {
      success: false,
      error: error.message || 'Consistency check failed',
      details: error
    };
  }
};
