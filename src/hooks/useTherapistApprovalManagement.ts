import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface TherapistProfile {
  id: string;
  full_name: string;
  email: string;
  admin_notes: string | null;
  approval_status: 'pending' | 'approved' | 'rejected';
  approval_request_date: string;
  account_type: string;
}

export const useTherapistApprovalManagement = () => {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAdmin } = useAuthRBAC();
  const { toast } = useToast();

  const canManageTherapists = isAdmin;

  const fetchTherapists = async () => {
    if (!canManageTherapists) {
      setError('Access denied');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_therapist_profiles_for_admin');

      if (error) throw error;

      const formattedData = (data || []).map((therapist: any) => ({
        ...therapist,
        approval_status: therapist.approval_status as 'pending' | 'approved' | 'rejected'
      }));

      setTherapists(formattedData);
    } catch (err: any) {
      console.error('Error fetching therapists:', err);
      setError(err.message || 'Failed to load therapist profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const updateApprovalStatus = async (
    therapist: TherapistProfile,
    action: 'approve' | 'reject',
    adminNotes?: string
  ): Promise<boolean> => {
    if (!canManageTherapists || !user) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage therapist approvals.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdating(true);
      
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      
      const { error } = await supabase.rpc('update_therapist_approval_simple', {
        therapist_id: therapist.id,
        new_status: newStatus,
        admin_user_id: user.id,
        admin_notes: adminNotes || null
      });

      if (error) throw error;

      // Refresh the therapists list
      await fetchTherapists();
      
      return true;
    } catch (err: any) {
      console.error('Error updating approval status:', err);
      toast({
        title: "Update Failed",
        description: err.message || "Failed to update therapist approval status",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const createSampleTherapist = async (): Promise<boolean> => {
    if (!canManageTherapists) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to create sample therapists.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsUpdating(true);

      // Create a sample user first
      const sampleEmail = `sample.therapist.${Date.now()}@example.com`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: sampleEmail,
        password: 'temporarypassword123',
        options: {
          data: {
            full_name: 'Dr. Sarah Wilson',
            accountType: 'therapist'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Update the profile to set approval request date
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            approval_request_date: new Date().toISOString(),
            approval_status: 'pending'
          })
          .eq('id', authData.user.id);

        if (profileError) throw profileError;

        await fetchTherapists();
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error creating sample therapist:', err);
      toast({
        title: "Creation Failed",
        description: err.message || "Failed to create sample therapist",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, [canManageTherapists]);

  return {
    therapists,
    isLoading,
    isUpdating,
    error,
    updateApprovalStatus,
    createSampleTherapist,
    canManageTherapists,
    refreshTherapists: fetchTherapists,
    fetchTherapists
  };
};
