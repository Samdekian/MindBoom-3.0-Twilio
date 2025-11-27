
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useAppointmentReminders = (appointmentId: string) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reminders, isLoading, error } = useQuery({
    queryKey: ['appointment-reminders', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return [];

      const { data, error } = await supabase
        .from('appointment_reminders')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!appointmentId,
  });

  return {
    reminders: reminders || [],
    isLoading,
    error,
  };
};
