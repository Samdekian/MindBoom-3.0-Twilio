
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

export interface TreatmentGoal {
  id: string;
  title: string;
  description?: string;
  target_date?: string;
  is_completed: boolean;
  created_at: string;
}

export interface TreatmentMilestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  due_date?: string;
  is_completed: boolean;
  created_at: string;
}

export const useTreatmentPlans = (patientId?: string) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: treatmentPlans, isLoading, error } = useQuery({
    queryKey: ['treatment-plans', patientId],
    queryFn: async () => {
      if (!patientId) return [];

      const { data, error } = await supabase
        .from('treatment_plans')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching treatment plans:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!patientId,
  });

  const createTreatmentPlan = useMutation({
    mutationFn: async (planData: any) => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .insert([{ ...planData, therapist_id: user?.id }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans'] });
      toast({
        title: "Plan Created",
        description: "Treatment plan has been created successfully.",
      });
    },
  });

  const updateTreatmentPlan = useMutation({
    mutationFn: async (planData: any) => {
      const { data, error } = await supabase
        .from('treatment_plans')
        .update(planData)
        .eq('id', planData.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans'] });
    },
  });

  const deleteTreatmentPlan = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('treatment_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans'] });
    },
  });

  const createMilestone = useMutation({
    mutationFn: async (milestoneData: Partial<TreatmentMilestone>) => {
      const { data, error } = await supabase
        .from('treatment_milestones')
        .insert([milestoneData])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans'] });
    },
  });

  const toggleMilestoneCompletion = useMutation({
    mutationFn: async (milestoneId: string) => {
      const { data, error } = await supabase
        .from('treatment_milestones')
        .update({ is_completed: true })
        .eq('id', milestoneId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatment-plans'] });
    },
  });

  return {
    treatmentPlans: treatmentPlans || [],
    isLoading,
    error,
    createTreatmentPlan,
    updateTreatmentPlan,
    deleteTreatmentPlan,
    createMilestone,
    toggleMilestoneCompletion,
  };
};
