
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

export interface PatientAssignment {
  id: string;
  patient_id: string;
  therapist_id: string;
  assigned_by: string;
  start_date: string;
  end_date?: string;
  status: string;
  priority_level: string;
  assignment_reason?: string;
  created_at: string;
  updated_at: string;
}

export const usePatientAssignments = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patientAssignments, isLoading, error } = useQuery({
    queryKey: ['patient-assignments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('patient_assignments')
        .select('*')
        .eq('therapist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching patient assignments:", error);
        throw error;
      }

      return data as PatientAssignment[];
    },
    enabled: !!user?.id,
  });

  const assignPatient = useMutation({
    mutationFn: async ({ patientId }: { patientId: string }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('patient_assignments')
        .insert([{
          patient_id: patientId,
          therapist_id: user.id,
          assigned_by: user.id,
          start_date: new Date().toISOString().split('T')[0],
          status: 'active',
          priority_level: 'medium'
        }])
        .select();

      if (error) {
        console.error("Error assigning patient:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-assignments'] });
      toast({
        title: "Patient Assigned",
        description: "Patient has been successfully assigned to you.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign patient.",
        variant: "destructive",
      });
    },
  });

  const unassignPatient = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase
        .from('patient_assignments')
        .update({ 
          status: 'inactive',
          end_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', assignmentId);

      if (error) {
        console.error("Error unassigning patient:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-assignments'] });
      toast({
        title: "Patient Unassigned",
        description: "Patient assignment has been ended.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unassignment Failed",
        description: error.message || "Failed to unassign patient.",
        variant: "destructive",
      });
    },
  });

  const updateAssignmentStatus = useMutation({
    mutationFn: async ({ assignmentId, status }: { assignmentId: string; status: string }) => {
      const { error } = await supabase
        .from('patient_assignments')
        .update({ status })
        .eq('id', assignmentId);

      if (error) {
        console.error("Error updating assignment status:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-assignments'] });
      toast({
        title: "Status Updated",
        description: "Assignment status has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update assignment status.",
        variant: "destructive",
      });
    },
  });

  const updatePriorityLevel = useMutation({
    mutationFn: async ({ assignmentId, priorityLevel }: { assignmentId: string; priorityLevel: string }) => {
      const { error } = await supabase
        .from('patient_assignments')
        .update({ priority_level: priorityLevel })
        .eq('id', assignmentId);

      if (error) {
        console.error("Error updating priority level:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient-assignments'] });
      toast({
        title: "Priority Updated",
        description: "Assignment priority has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update priority level.",
        variant: "destructive",
      });
    },
  });

  return {
    patientAssignments: patientAssignments || [],
    assignments: patientAssignments || [], // Alias for backward compatibility
    isLoading,
    error,
    assignPatient,
    unassignPatient,
    updateAssignmentStatus,
    updatePriorityLevel,
  };
};
