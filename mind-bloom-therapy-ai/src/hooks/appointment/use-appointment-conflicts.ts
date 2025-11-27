
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleCalendarCalendars } from '@/hooks/use-google-calendar-calendars';
import { Appointment, Conflict } from '@/types/appointments';
import { toast } from '@/hooks/use-toast';

export const useAppointmentConflicts = (
  startTime: string,
  endTime: string,
  therapistId: string,
  appointmentId?: string
) => {
  const { selectedCalendarId } = useGoogleCalendarCalendars();
  const queryClient = useQueryClient();

  const conflictsQuery = useQuery({
    queryKey: ['appointment-conflicts', startTime, endTime, therapistId, appointmentId, selectedCalendarId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_google_calendar_conflicts', {
        p_start_time: startTime,
        p_end_time: endTime,
        p_therapist_id: therapistId,
        p_google_calendar_id: selectedCalendarId || '', 
        p_appointment_id: appointmentId || null
      });

      if (error) throw error;
      return data as Conflict[];
    },
    enabled: !!startTime && !!endTime && !!therapistId,
  });

  const resolveConflict = useMutation({
    mutationFn: async ({ 
      appointmentId,
      resolution
    }: { 
      appointmentId: string;
      resolution: 'reschedule' | 'keep' | 'mark_resolved';
    }) => {
      if (resolution === 'mark_resolved') {
        const { error } = await supabase
          .from('appointments')
          .update({
            conflicts: [],
            sync_status: 'synced'
          })
          .eq('id', appointmentId);
        
        if (error) throw error;
        return { success: true };
      }
      
      // For other resolution types, we'll need more complex logic
      // This would be implemented based on business requirements
      return { success: true, message: 'Conflict resolution in progress' };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment-conflicts'] });
      
      toast({
        title: "Conflict resolved",
        description: "The appointment conflict has been resolved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error resolving conflict",
        description: error instanceof Error ? error.message : "Failed to resolve conflict",
        variant: "destructive",
      });
    }
  });

  return {
    conflicts: conflictsQuery.data || [],
    isLoading: conflictsQuery.isLoading,
    error: conflictsQuery.error,
    resolveConflict
  };
};
