
import { supabase } from "@/integrations/supabase/client";
import { TherapistApprovalStatus } from "@/services/auth/auth-types";

export async function getTherapistApprovalStatus(userId: string): Promise<TherapistApprovalStatus> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("approval_status, admin_notes, updated_at")
      .eq("id", userId)
      .eq("account_type", "therapist")
      .single();

    if (error) throw error;

    if (!data) {
      return {
        status: "pending",
        updatedAt: new Date()
      };
    }

    return {
      status: data.approval_status as "pending" | "approved" | "rejected",
      notes: data.admin_notes,
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error("Error fetching therapist approval status:", error);
    return {
      status: "pending",
      updatedAt: new Date()
    };
  }
}

export async function checkTherapistApprovalStatus(userId: string): Promise<{ 
  approved: boolean; 
  status?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('approval_status, account_type')
      .eq('id', userId)
      .single();
    
    if (error || !data) {
      return { approved: false, status: 'unknown' };
    }
    
    // Approval only applies to therapist accounts
    if (data.account_type !== 'therapist') {
      return { approved: true };
    }
    
    return { 
      approved: data.approval_status === 'approved',
      status: data.approval_status
    };
  } catch (error) {
    console.error('Error checking therapist approval:', error);
    return { approved: false, status: 'error' };
  }
}

export async function approveTherapist(
  therapistId: string, 
  adminId: string, 
  notes?: string
): Promise<boolean> {
  try {
    // Update profile with approval status
    const { error } = await supabase.rpc(
      "update_approval_status_as_admin",
      {
        profile_id: therapistId,
        new_status: "approved",
        admin_user_id: adminId
      }
    );

    if (error) throw error;

    // Update notes if provided
    if (notes) {
      const { error: notesError } = await supabase
        .from("profiles")
        .update({
          admin_notes: notes
        })
        .eq("id", therapistId);

      if (notesError) throw notesError;
    }

    return true;
  } catch (error) {
    console.error("Error approving therapist:", error);
    return false;
  }
}

export async function rejectTherapist(
  therapistId: string, 
  adminId: string, 
  notes?: string
): Promise<boolean> {
  try {
    // Update profile with rejection status
    const { error } = await supabase.rpc(
      "update_approval_status_as_admin",
      {
        profile_id: therapistId,
        new_status: "rejected",
        admin_user_id: adminId
      }
    );

    if (error) throw error;

    // Update notes if provided
    if (notes) {
      const { error: notesError } = await supabase
        .from("profiles")
        .update({
          admin_notes: notes
        })
        .eq("id", therapistId);

      if (notesError) throw notesError;
    }

    return true;
  } catch (error) {
    console.error("Error rejecting therapist:", error);
    return false;
  }
}
