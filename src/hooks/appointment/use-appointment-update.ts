
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAppointment as updateAppointmentApi } from "@/lib/api/appointments";
import { Appointment, Conflict } from "@/types/appointments";
import { useToast } from "@/hooks/use-toast";
import { useCalendarSyncService } from "./use-calendar-sync-service";
import { calendarCache } from "@/utils/calendar-data-cache";

/**
 * Hook for updating appointments with calendar provider sync
 */
export const useAppointmentUpdate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { syncAppointmentWithGoogleCalendar, isGoogleCalendarConnected } = useCalendarSyncService();

  const updateAppointment = useMutation({
    mutationFn: async (appointment: Appointment) => {
      // Convert appointment to the format expected by the API
      // Cast the status to match the API's expected type
      const appointmentData = {
        id: appointment.id,
        title: appointment.title,
        description: appointment.description,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: appointment.status as any, // Cast to bypass the type incompatibility
        therapist_id: appointment.therapist_id,
        patient_id: appointment.patient_id,
        video_enabled: appointment.video_enabled
      };
      
      // Update the appointment in the database
      const updatedAppointmentData = await updateAppointmentApi(appointment.id, appointmentData);
      
      // Convert the returned data to match our Appointment type
      const updatedAppointment: Appointment = {
        ...updatedAppointmentData,
        conflicts: Array.isArray(updatedAppointmentData.conflicts) 
          ? updatedAppointmentData.conflicts.map((conflict: any): Conflict => ({
              conflict_id: conflict.conflict_id || '',
              event_summary: conflict.event_summary || '',
              conflict_start: conflict.conflict_start || '',
              conflict_end: conflict.conflict_end || ''
            }))
          : []
      } as Appointment;
      
      // If Google Calendar is connected, sync the appointment
      if (isGoogleCalendarConnected) {
        try {
          await syncAppointmentWithGoogleCalendar(updatedAppointment);
        } catch (error) {
          console.error("Failed to sync appointment with Google Calendar:", error);
          // We don't throw here since the appointment was saved successfully
          // We just notify the user about the sync failure
          toast({
            title: "Sync Warning",
            description: "Appointment saved but not synced with Google Calendar",
            variant: "warning",
          });
        }
      }
      
      // Clear cache
      calendarCache.clear();
      
      return updatedAppointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      toast({
        title: "Appointment Updated",
        description: "The appointment was successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update appointment",
        variant: "destructive",
      });
    },
  });

  return {
    updateAppointment,
  };
};
