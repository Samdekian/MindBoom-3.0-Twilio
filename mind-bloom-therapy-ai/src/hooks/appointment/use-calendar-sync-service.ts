
import { useMutation } from "@tanstack/react-query";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import { Appointment } from "@/types/appointments";
import { useSyncMonitoring } from "./use-sync-monitoring";
import { useSyncRetry } from "./use-sync-retry";

export const useCalendarSyncService = () => {
  const { isConnected: isGoogleCalendarConnected } = useGoogleCalendar();
  const { monitorSync } = useSyncMonitoring();
  const { retrySync } = useSyncRetry();

  const syncAppointmentWithGoogleCalendar = async (appointment: Appointment) => {
    if (!isGoogleCalendarConnected) {
      throw new Error("Google Calendar is not connected");
    }
    
    const { operationId } = await monitorSync.mutateAsync(appointment);
    
    try {
      const response = await retrySync.mutateAsync(appointment);
      
      if (response.error) {
        const errorData = response.error;
        throw new Error(errorData.message || "Failed to sync with Google Calendar");
      }
      
      return response.data;
    } catch (error) {
      console.error("Google Calendar sync error:", error);
      throw error;
    }
  };

  return {
    syncAppointmentWithGoogleCalendar,
    isGoogleCalendarConnected,
  };
};
