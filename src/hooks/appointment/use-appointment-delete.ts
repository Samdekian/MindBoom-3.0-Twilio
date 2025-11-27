
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointments";
import { useToast } from "@/hooks/use-toast";
import { calendarCache } from "@/utils/calendar-data-cache";

/**
 * Hook for deleting appointments from database and calendar provider
 */
export const useAppointmentDelete = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteAppointment = useMutation({
    mutationFn: async (appointment: Appointment) => {
      // First check if the appointment has a Google Calendar event ID
      if (appointment.google_calendar_event_id) {
        try {
          // Try to delete from Google Calendar first
          await supabase.functions.invoke("delete-google-calendar-event", {
            body: { eventId: appointment.google_calendar_event_id }
          });
        } catch (error) {
          console.error("Failed to delete Google Calendar event:", error);
          // Continue with deletion even if Google Calendar delete fails
        }
      }
      
      // Delete the appointment from the database
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointment.id);
      
      if (error) throw error;
      
      // Clear cache
      calendarCache.clear();
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      toast({
        title: "Appointment Deleted",
        description: "The appointment was successfully deleted",
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete appointment",
        variant: "destructive",
      });
    },
  });

  return {
    deleteAppointment,
  };
};
