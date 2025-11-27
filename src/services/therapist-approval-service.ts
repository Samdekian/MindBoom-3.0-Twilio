import { supabase } from "@/integrations/supabase/client";
import { updateTherapistApprovalStatus, checkTherapistDataConsistency } from "@/utils/therapist/approvalUtils";

export interface SimpleTherapistProfile {
  id: string;
  full_name: string;
  admin_notes: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_request_date: string;
  email: string;
}

export type ApprovalAction = 'approved' | 'rejected';

export class TherapistApprovalService {
  static async fetchTherapists(): Promise<SimpleTherapistProfile[]> {
    console.log("Fetching therapist profiles using secure RPC function...");
    
    try {
      // Use the new secure RPC function instead of the dropped view
      const { data: therapistsData, error } = await supabase
        .rpc('get_therapist_profiles_for_admin');

      if (error) {
        console.error("Error fetching therapists from secure RPC:", error);
        
        // Provide more specific error messaging
        if (error.message?.includes('Access denied')) {
          throw new Error('Access denied: Administrator privileges required to manage therapist accounts');
        }
        
        throw new Error(`Failed to load therapist accounts: ${error.message}`);
      }

      console.log(`Found ${therapistsData?.length || 0} therapists:`, therapistsData);

      return (therapistsData || []).map(therapist => ({
        id: therapist.id,
        full_name: therapist.full_name || `Therapist ${therapist.id.substring(0, 8)}`,
        admin_notes: therapist.admin_notes,
        approval_status: (therapist.approval_status || 'pending') as 'pending' | 'approved' | 'rejected',
        approval_request_date: therapist.approval_request_date || new Date().toISOString(),
        email: therapist.email || `therapist.${therapist.id.substring(0, 8)}@example.com`
      }));
    } catch (error) {
      console.error("Service error:", error);
      throw error;
    }
  }

  static async updateApprovalStatus(
    therapistId: string,
    newStatus: ApprovalAction,
    adminNotes: string,
    adminUserId: string
  ): Promise<void> {
    console.log(`Updating therapist ${therapistId} status to ${newStatus} by admin ${adminUserId}`);
    
    // Enhanced validation
    if (!therapistId) {
      throw new Error('Therapist ID is required');
    }
    
    if (!adminUserId) {
      throw new Error('Admin user ID is required');
    }
    
    if (!['approved', 'rejected'].includes(newStatus)) {
      throw new Error('Invalid approval status. Must be "approved" or "rejected"');
    }
    
    // Use the enhanced utility function
    const result = await updateTherapistApprovalStatus(
      therapistId,
      newStatus,
      adminUserId,
      adminNotes
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update approval status');
    }
    
    console.log(`Successfully updated therapist ${therapistId} to ${newStatus}`, result.details);
  }

  static async runConsistencyCheck(adminUserId: string): Promise<any> {
    console.log('Running therapist data consistency check...');
    
    if (!adminUserId) {
      throw new Error('Admin user ID is required for consistency check');
    }
    
    const result = await checkTherapistDataConsistency(adminUserId);
    
    if (!result.success) {
      throw new Error(result.error || 'Consistency check failed');
    }
    
    console.log('Consistency check completed successfully', result.details);
    return result.details;
  }

  static async createSampleTherapist(): Promise<void> {
    const sampleTherapistId = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const sampleName = `Dr. Sample Therapist ${new Date().toLocaleDateString()}`;
    
    console.log(`Creating sample therapist: ${sampleName}`);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: sampleTherapistId,
          full_name: sampleName,
          account_type: 'therapist',
          approval_status: 'pending',
          approval_request_date: timestamp,
          admin_notes: 'Sample therapist for testing',
          created_at: timestamp,
          updated_at: timestamp
        });
        
      if (error) {
        console.error("Error creating sample therapist:", error);
        throw error;
      }
      
      console.log(`Successfully created sample therapist with ID: ${sampleTherapistId}`);
    } catch (error) {
      console.error("Failed to create sample therapist:", error);
      throw error;
    }
  }
}
