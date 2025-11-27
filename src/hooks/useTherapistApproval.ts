import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { updateTherapistApprovalStatus } from "@/utils/therapist/approvalUtils";

export interface TherapistProfile {
  id: string;
  full_name: string | null;
  admin_notes: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_request_date: string;
  email: string;
  account_type: string;
  roles?: string[];
  role_consistency?: boolean;
}

export const useTherapistApproval = () => {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated, isAdmin } = useAuthRBAC();

  const createSampleTherapist = async () => {
    try {
      console.log("[useTherapistApproval] Starting sample therapist creation process");
      setIsUpdating(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error("User must be logged in to create sample therapist");
      }

      if (!isAdmin) {
        throw new Error("Only administrators can create sample therapists");
      }

      const sampleTherapistId = crypto.randomUUID();
      const sampleName = "Dr. Sample Therapist " + new Date().toLocaleDateString();
      
      console.log(`[useTherapistApproval] Creating sample therapist with ID: ${sampleTherapistId} and name: ${sampleName}`);
      
      const { data, error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: sampleTherapistId,
          full_name: sampleName,
          account_type: 'therapist',
          approval_status: 'pending',
          approval_request_date: new Date().toISOString(),
          admin_notes: 'This is a sample therapist for demonstration purposes'
        })
        .select()
        .single();
        
      if (insertError) {
        console.error("[useTherapistApproval] Error in sample therapist creation:", insertError);
        throw insertError;
      }
      
      console.log("[useTherapistApproval] Sample therapist created successfully:", data);
      
      toast({
        title: "Sample Therapist Created",
        description: `A sample therapist account (${sampleName}) has been created for demonstration purposes.`
      });
      
      await fetchTherapists();
      return true;
    } catch (error: any) {
      console.error("[useTherapistApproval] Error creating sample therapist:", error);
      setError(`Failed to create sample therapist: ${error.message || 'Unknown error'}`);
      toast({
        title: "Error Creating Sample Therapist",
        description: error.message || "Failed to create sample therapist account.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchTherapists = async () => {
    if (!isAuthenticated || !user?.id) {
      console.log("[useTherapistApproval] Not authenticated or no user, skipping fetch");
      setTherapists([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      console.log("[useTherapistApproval] Fetching therapist profiles using secure RPC...");
      
      // Use the new secure RPC function
      const { data: therapistsData, error: therapistsError } = await supabase
        .rpc('get_therapist_profiles_for_admin');

      if (therapistsError) {
        console.error("[useTherapistApproval] Error fetching therapist profiles:", therapistsError);
        
        // Handle specific security errors
        if (therapistsError.message?.includes('Access denied')) {
          setError('Access denied: Administrator privileges required');
          toast({
            title: "Access Denied",
            description: "You must be an administrator to view therapist accounts.",
            variant: "destructive",
          });
          setTherapists([]);
          return;
        }
        
        throw therapistsError;
      }

      console.log(`[useTherapistApproval] Retrieved ${therapistsData?.length || 0} therapist profiles:`, therapistsData);

      if (!therapistsData || therapistsData.length === 0) {
        console.log("[useTherapistApproval] No therapists found in the database");
        setTherapists([]);
        return;
      }

      // Transform data to match TherapistProfile interface
      const formattedTherapists = therapistsData.map((therapist) => ({
        id: therapist.id,
        full_name: therapist.full_name || `Therapist ${therapist.id.substring(0, 8)}`,
        admin_notes: therapist.admin_notes,
        approval_status: therapist.approval_status as 'pending' | 'approved' | 'rejected',
        approval_request_date: therapist.approval_request_date || new Date().toISOString(),
        email: therapist.email || `therapist.${therapist.id.substring(0, 8)}@example.com`,
        account_type: therapist.account_type || 'therapist',
        roles: ['therapist'],
        role_consistency: true
      }));

      console.log("[useTherapistApproval] Final formatted therapists data:", formattedTherapists);
      setTherapists(formattedTherapists);
      
    } catch (error: any) {
      console.error("[useTherapistApproval] Error fetching therapists:", error);
      setError(`Failed to fetch therapists: ${error.message || 'Unknown error'}`);
      toast({
        title: "Error Loading Therapists",
        description: "Failed to load therapist accounts. Please try again.",
        variant: "destructive",
      });
      setTherapists([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      console.log("[useTherapistApproval] Hook initialized, fetching therapists...");
      fetchTherapists();
    }
  }, [isAuthenticated, user?.id]);

  const updateApprovalStatus = async (
    therapist: TherapistProfile,
    newStatus: 'approved' | 'rejected',
    adminNotes: string
  ) => {
    setIsUpdating(true);
    setError(null);
    
    try {
      console.log(`[useTherapistApproval] Updating therapist ${therapist.id} status to ${newStatus}`);
      
      if (!user?.id) {
        throw new Error("Admin user ID is required");
      }

      if (!isAdmin) {
        throw new Error("Only administrators can approve or reject therapist applications");
      }

      // Use the updated approval utility function
      const result = await updateTherapistApprovalStatus(
        therapist.id,
        newStatus,
        user.id,
        adminNotes
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update therapist status');
      }
      
      console.log(`[useTherapistApproval] Successfully updated therapist status to ${newStatus}`);
      
      // Update local state
      setTherapists(therapists.map(t => 
        t.id === therapist.id 
          ? { ...t, approval_status: newStatus, admin_notes: adminNotes }
          : t
      ));
      
      toast({
        title: `Therapist ${newStatus}`,
        description: `Successfully ${newStatus} therapist ${therapist.full_name}`,
      });
      
      return true;
    } catch (error: any) {
      console.error(`[useTherapistApproval] Error ${newStatus}ing therapist:`, error);
      setError(`Failed to update therapist status: ${error.message || 'Unknown error'}`);
      toast({
        title: "Error",
        description: `Failed to ${newStatus} therapist. Please try again.`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const checkRoleConsistency = async () => {
    return [];
  };
  
  const fixRoleInconsistencies = async () => {
    return true;
  };

  return {
    therapists,
    isLoading,
    isUpdating,
    isAdminBypassActive: isAdmin,
    error,
    fetchTherapists,
    updateApprovalStatus,
    checkRoleConsistency,
    fixRoleInconsistencies,
    createSampleTherapist
  };
};
