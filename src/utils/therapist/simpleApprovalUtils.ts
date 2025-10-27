
import { supabase } from "@/integrations/supabase/client";

export interface ApprovalResult {
  success: boolean;
  error?: string;
}

export const updateTherapistApproval = async (
  therapistId: string,
  newStatus: 'approved' | 'rejected' | 'pending',
  adminNotes?: string
): Promise<ApprovalResult> => {
  try {
    console.log(`[simpleApprovalUtils] Updating therapist ${therapistId} to ${newStatus}`);
    
    const { error } = await supabase.rpc('update_therapist_approval_simple', {
      therapist_id: therapistId,
      new_status: newStatus,
      admin_notes: adminNotes || null
    });

    if (error) {
      console.error('[simpleApprovalUtils] Database error:', error);
      return { success: false, error: error.message };
    }

    console.log(`[simpleApprovalUtils] Successfully updated therapist ${therapistId} to ${newStatus}`);
    return { success: true };
  } catch (error: any) {
    console.error('[simpleApprovalUtils] Unexpected error:', error);
    return { success: false, error: error.message || 'Unknown error occurred' };
  }
};

export const fetchTherapists = async () => {
  try {
    console.log('[simpleApprovalUtils] Fetching therapist profiles...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, admin_notes, approval_status, approval_request_date, account_type')
      .eq('account_type', 'therapist')
      .order('approval_request_date', { ascending: false });

    if (error) {
      console.error('[simpleApprovalUtils] Error fetching therapists:', error);
      throw new Error(`Failed to fetch therapists: ${error.message}`);
    }

    console.log(`[simpleApprovalUtils] Found ${data?.length || 0} therapists`);
    return data || [];
  } catch (error: any) {
    console.error('[simpleApprovalUtils] Fetch error:', error);
    throw error;
  }
};
