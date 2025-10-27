import { supabase } from "@/integrations/supabase/client";
import { TherapistProfile, ApprovalAction } from "@/types/therapist-approval";

export interface ApprovalResult {
  success: boolean;
  error?: string;
  data?: any;
}

export class TherapistApprovalCoreService {
  /**
   * Fetch all therapist profiles using the new secure RPC function
   */
  static async fetchTherapists(): Promise<TherapistProfile[]> {
    try {
      console.log("[TherapistApprovalCoreService] Fetching therapist profiles using secure RPC...");
      
      // Use the new secure RPC function instead of the dropped view
      const { data, error } = await supabase
        .rpc('get_therapist_profiles_for_admin');

      if (error) {
        console.error("[TherapistApprovalCoreService] RPC error:", error);
        throw new Error(`Failed to fetch therapists: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log("[TherapistApprovalCoreService] No therapists found");
        return [];
      }

      // Transform data to match TherapistProfile interface
      const therapists = data.map((therapist) => ({
        id: therapist.id,
        full_name: therapist.full_name || `Therapist ${therapist.id.substring(0, 8)}`,
        admin_notes: therapist.admin_notes,
        approval_status: therapist.approval_status as 'pending' | 'approved' | 'rejected',
        approval_request_date: therapist.approval_request_date || therapist.created_at || new Date().toISOString(),
        email: therapist.email || `therapist.${therapist.id.substring(0, 8)}@example.com`
      }));

      console.log(`[TherapistApprovalCoreService] Successfully fetched ${therapists.length} therapists`);
      return therapists;
    } catch (error: any) {
      console.error("[TherapistApprovalCoreService] Error in fetchTherapists:", error);
      
      // Provide more specific error messaging for common cases
      if (error.message?.includes('Access denied')) {
        throw new Error('Access denied: Administrator privileges required to view therapist profiles');
      }
      
      throw new Error(error.message || 'Failed to fetch therapist profiles');
    }
  }

  /**
   * Update therapist approval status with proper validation
   */
  static async updateApprovalStatus(
    therapistId: string,
    action: ApprovalAction,
    adminUserId: string,
    adminNotes?: string
  ): Promise<ApprovalResult> {
    try {
      console.log(`[TherapistApprovalCoreService] Updating therapist ${therapistId} with action ${action}`);
      
      // Validate inputs
      if (!therapistId || !action || !adminUserId) {
        throw new Error('Missing required parameters');
      }

      if (!['approve', 'reject'].includes(action)) {
        throw new Error('Invalid approval action. Must be "approve" or "reject"');
      }

      // Convert action to status
      const newStatus = action === 'approve' ? 'approved' : 'rejected';

      // Use the updated database function that now accepts admin_user_id
      const { error } = await supabase.rpc('update_therapist_approval_simple', {
        therapist_id: therapistId,
        new_status: newStatus,
        admin_user_id: adminUserId,
        admin_notes: adminNotes || null
      });

      if (error) {
        console.error("[TherapistApprovalCoreService] Database error:", error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`[TherapistApprovalCoreService] Successfully updated therapist ${therapistId} to ${newStatus}`);
      
      return {
        success: true,
        data: {
          therapistId,
          newStatus,
          adminNotes
        }
      };
    } catch (error: any) {
      console.error("[TherapistApprovalCoreService] Error updating approval status:", error);
      return {
        success: false,
        error: error.message || 'Failed to update approval status'
      };
    }
  }

  /**
   * Create a sample therapist for demonstration
   */
  static async createSampleTherapist(): Promise<ApprovalResult> {
    try {
      const sampleId = crypto.randomUUID();
      const timestamp = new Date().toISOString();
      const sampleName = `Dr. Sample Therapist ${new Date().toLocaleDateString()}`;
      
      console.log(`[TherapistApprovalCoreService] Creating sample therapist: ${sampleName}`);
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: sampleId,
          full_name: sampleName,
          account_type: 'therapist',
          approval_status: 'pending',
          approval_request_date: timestamp,
          admin_notes: 'Sample therapist created for demonstration purposes'
        });
        
      if (error) {
        console.error("[TherapistApprovalCoreService] Error creating sample:", error);
        throw new Error(`Failed to create sample therapist: ${error.message}`);
      }
      
      console.log(`[TherapistApprovalCoreService] Sample therapist created successfully`);
      
      return {
        success: true,
        data: { id: sampleId, name: sampleName }
      };
    } catch (error: any) {
      console.error("[TherapistApprovalCoreService] Error in createSampleTherapist:", error);
      return {
        success: false,
        error: error.message || 'Failed to create sample therapist'
      };
    }
  }

  /**
   * Check role consistency for a therapist
   */
  static async checkRoleConsistency(therapistId: string): Promise<ApprovalResult> {
    try {
      const { data, error } = await supabase.rpc('check_and_repair_user_role_consistency', {
        p_user_id: therapistId,
        p_auto_repair: false
      });

      if (error) {
        throw new Error(`Role consistency check failed: ${error.message}`);
      }

      return {
        success: true,
        data: {
          isConsistent: data?.is_consistent || false,
          details: data
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to check role consistency'
      };
    }
  }
}
