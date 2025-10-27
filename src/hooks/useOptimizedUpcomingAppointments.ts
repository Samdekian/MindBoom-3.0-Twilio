
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useOptimizedUpcomingAppointments = (userRole?: string) => {
  const { user } = useAuthRBAC();

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['upcoming-appointments', user?.id, userRole],
    queryFn: async () => {
      if (!user?.id) return [];

      const columnName = userRole === 'therapist' ? 'therapist_id' : 'patient_id';
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq(columnName, user.id)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) {
        console.error("Error fetching upcoming appointments:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });
  
  return {
    appointments: appointments || [],
    data: appointments || [], // Alias for backward compatibility
    isLoading,
    error,
  };
};
