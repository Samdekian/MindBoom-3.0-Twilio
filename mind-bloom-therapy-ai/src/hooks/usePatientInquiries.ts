import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface PatientInquiry {
  id: string;
  patient_id: string;
  therapist_id: string;
  inquiry_type: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  preferred_contact_method: string;
  patient_phone?: string;
  patient_email?: string;
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  responded_at?: string;
  responded_by?: string;
  response_message?: string;
  created_at: string;
  updated_at: string;
  patient?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  therapist?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface PatientTherapistRelationship {
  id: string;
  patient_id: string;
  therapist_id: string;
  relationship_status: string;
  start_date?: string;
  end_date?: string;
  termination_reason?: string;
  relationship_notes?: string;
  created_at: string;
  updated_at: string;
}

interface CreateInquiryData {
  therapist_id: string;
  inquiry_type: string;
  subject: string;
  message: string;
  priority?: string;
  preferred_contact_method?: string;
  patient_phone?: string;
  patient_email?: string;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export const usePatientInquiries = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch inquiries for therapists
  const { data: therapistInquiries = [], isLoading: loadingTherapistInquiries } = useQuery({
    queryKey: ['therapist-inquiries', user?.id],
    queryFn: async (): Promise<PatientInquiry[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('patient_inquiries')
        .select(`
          *,
          patient:patient_id!inner(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch inquiries for patients
  const { data: patientInquiries = [], isLoading: loadingPatientInquiries } = useQuery({
    queryKey: ['patient-inquiries', user?.id],
    queryFn: async (): Promise<PatientInquiry[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('patient_inquiries')
        .select(`
          *,
          therapist:therapist_id!inner(
            id,
            full_name,
            avatar_url
          )
        `)
        .eq('patient_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Fetch patient-therapist relationships
  const { data: relationships = [], isLoading: loadingRelationships } = useQuery({
    queryKey: ['patient-therapist-relationships', user?.id],
    queryFn: async (): Promise<PatientTherapistRelationship[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('patient_therapist_relationships')
        .select('*')
        .or(`patient_id.eq.${user.id},therapist_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  // Create inquiry mutation
  const createInquiryMutation = useMutation({
    mutationFn: async (data: CreateInquiryData) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data: inquiry, error } = await supabase
        .from('patient_inquiries')
        .insert({
          patient_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      // The trigger will automatically create/update the relationship
      return inquiry;
    },
    onSuccess: () => {
      toast({
        title: "Inquiry Sent Successfully! 🚀",
        description: "Your inquiry has been sent to the therapist. You'll be notified when they respond.",
      });
      queryClient.invalidateQueries({ queryKey: ['patient-inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['patient-therapist-relationships'] });
    },
    onError: (error: any) => {
      console.error('Inquiry creation error:', error);
      toast({
        title: "Failed to Send Inquiry",
        description: error.message || "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Respond to inquiry mutation
  const respondToInquiryMutation = useMutation({
    mutationFn: async ({ inquiryId, response }: { inquiryId: string; response: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('patient_inquiries')
        .update({
          status: 'responded',
          responded_at: new Date().toISOString(),
          responded_by: user.id,
          response_message: response
        })
        .eq('id', inquiryId)
        .eq('therapist_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Response Sent Successfully! ✅",
        description: "Your response has been sent to the patient. They will be notified automatically.",
      });
      queryClient.invalidateQueries({ queryKey: ['therapist-inquiries'] });
      queryClient.invalidateQueries({ queryKey: ['patient-therapist-relationships'] });
    },
    onError: (error: any) => {
      console.error('Response error:', error);
      toast({
        title: "Failed to Send Response",
        description: error.message || "Failed to send response. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update relationship status mutation
  const updateRelationshipMutation = useMutation({
    mutationFn: async ({ relationshipId, status, notes }: { 
      relationshipId: string; 
      status: string; 
      notes?: string 
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('patient_therapist_relationships')
        .update({
          relationship_status: status,
          relationship_notes: notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', relationshipId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Relationship Updated",
        description: "The relationship status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['patient-therapist-relationships'] });
    },
    onError: (error: any) => {
      console.error('Relationship update error:', error);
      toast({
        title: "Failed to Update Relationship",
        description: error.message || "Failed to update relationship. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    therapistInquiries,
    patientInquiries,
    relationships,
    loadingTherapistInquiries,
    loadingPatientInquiries,
    loadingRelationships,
    createInquiry: createInquiryMutation.mutate,
    isCreatingInquiry: createInquiryMutation.isPending,
    respondToInquiry: respondToInquiryMutation.mutate,
    isResponding: respondToInquiryMutation.isPending,
    updateRelationship: updateRelationshipMutation.mutate,
    isUpdatingRelationship: updateRelationshipMutation.isPending
  };
};
