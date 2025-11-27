import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface PatientGoal {
  id: string;
  patient_id: string;
  therapist_id?: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress_percentage: number;
  created_at: string;
  updated_at: string;
}

export const usePatientGoals = (patientId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['patient-goals', patientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_goals')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PatientGoal[];
    },
    enabled: !!patientId,
  });

  // Update goal progress mutation
  const updateGoalProgress = useMutation({
    mutationFn: async ({ goalId, progress }: { goalId: string; progress: number }) => {
      const { data, error } = await supabase
        .from('patient_goals')
        .update({ 
          progress_percentage: progress,
          status: progress >= 100 ? 'completed' : 'active'
        })
        .eq('id', goalId)
        .eq('patient_id', patientId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Real-time updates will handle invalidation
      queryClient.invalidateQueries({ queryKey: ['patient-goals', patientId] });
      
      // Show immediate feedback, real-time will handle completion celebration
      if (data.status !== 'completed') {
        toast({
          title: "Goal updated",
          description: "Your progress has been saved.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error updating goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');

  return {
    goals,
    activeGoals,
    completedGoals,
    isLoading,
    updateGoalProgress: updateGoalProgress.mutate,
    isUpdating: updateGoalProgress.isPending,
  };
};