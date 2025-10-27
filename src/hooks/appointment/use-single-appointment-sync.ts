
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Appointment } from "@/types/appointments";
import { useSyncMonitoring } from "./use-sync-monitoring";
import { useSyncRetry } from "./use-sync-retry";
import { calendarCache } from "@/utils/calendar-data-cache";

/**
 * Hook for syncing a single appointment with calendar provider
 */
export const useSingleAppointmentSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { monitorSync, completeSync, failSync } = useSyncMonitoring();
  const { retrySync } = useSyncRetry();

  const syncAppointment = useMutation({
    mutationFn: async (appointment: Appointment) => {
      // Start monitoring this sync operation
      const { operationId } = await monitorSync.mutateAsync(appointment);
      
      try {
        const response = await retrySync.mutateAsync(appointment);
        
        // Mark operation as complete
        completeSync(operationId);
        
        // Clear cache
        calendarCache.clear();
        
        return response.data;
      } catch (error) {
        // Mark operation as failed
        failSync(
          operationId, 
          error instanceof Error ? error.message : String(error)
        );
        
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-events'] });
      
      toast({
        title: "Appointment Synced",
        description: "The appointment was successfully synchronized",
      });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync appointment",
        variant: "destructive",
      });
    }
  });

  return {
    syncAppointment,
    isSyncing: syncAppointment.isPending || monitorSync.isPending || retrySync.isPending
  };
};
