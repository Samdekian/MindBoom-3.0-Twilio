
import { useState, useEffect } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { updateTherapistApproval, fetchTherapists } from "@/utils/therapist/simpleApprovalUtils";

export interface SimpleTherapistProfile {
  id: string;
  full_name: string;
  admin_notes: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_request_date: string;
  account_type: string;
}

export const useSimpleTherapistApproval = () => {
  const [therapists, setTherapists] = useState<SimpleTherapistProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user, isInitialized, isAdmin } = useAuthRBAC();
  const { toast } = useToast();

  const loadTherapists = async () => {
    if (!isInitialized || !isAdmin) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const data = await fetchTherapists();
      setTherapists(data);
    } catch (error: any) {
      console.error("Error loading therapists:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load therapist accounts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateApprovalStatus = async (
    therapist: SimpleTherapistProfile,
    newStatus: 'approved' | 'rejected',
    adminNotes: string
  ): Promise<boolean> => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can update approval status",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdating(true);
      console.log(`[useSimpleTherapistApproval] Updating ${therapist.id} to ${newStatus}`);
      
      const result = await updateTherapistApproval(therapist.id, newStatus, adminNotes);
      
      if (!result.success) {
        throw new Error(result.error || 'Update failed');
      }

      // Update local state
      setTherapists(prev => prev.map(t => 
        t.id === therapist.id 
          ? { ...t, approval_status: newStatus, admin_notes: adminNotes }
          : t
      ));

      toast({
        title: `Therapist ${newStatus}`,
        description: `Successfully ${newStatus} ${therapist.full_name}`,
      });

      return true;
    } catch (error: any) {
      console.error(`Error ${newStatus}ing therapist:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${newStatus} therapist`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const createSampleTherapist = async (): Promise<boolean> => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can create sample therapists",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdating(true);
      const sampleId = crypto.randomUUID();
      const sampleName = `Dr. Sample Therapist ${new Date().toLocaleDateString()}`;
      
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: sampleId,
          full_name: sampleName,
          account_type: 'therapist',
          approval_status: 'pending',
          approval_request_date: new Date().toISOString(),
          admin_notes: 'Sample therapist for testing'
        });
        
      if (error) throw error;
      
      toast({
        title: "Sample Therapist Created",
        description: `Created ${sampleName} for testing`,
      });
      
      await loadTherapists();
      return true;
    } catch (error: any) {
      console.error("Error creating sample therapist:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create sample therapist",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      loadTherapists();
    }
  }, [isInitialized, isAdmin]);

  return {
    therapists,
    isLoading,
    isUpdating,
    updateApprovalStatus,
    createSampleTherapist,
    fetchTherapists: loadTherapists,
    isAdmin
  };
};
