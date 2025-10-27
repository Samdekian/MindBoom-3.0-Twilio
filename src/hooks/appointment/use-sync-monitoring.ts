
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { syncMonitoring } from "@/utils/calendar-sync-monitoring";
import { Appointment } from "@/types/appointments";

/**
 * Hook for monitoring calendar sync operations
 */
export const useSyncMonitoring = () => {
  const queryClient = useQueryClient();

  // Start monitoring sync operation
  const monitorSync = useMutation({
    mutationFn: async (appointment: Appointment) => {
      // Generate an operation ID to track this sync
      const operationId = syncMonitoring.startOperation(
        appointment.sync_status === 'pending' ? 'initial_sync' : 'update_sync'
      );
      
      return { operationId, appointment };
    }
  });
  
  // End monitoring sync operation (success)
  const completeSync = (operationId: string, itemCount: number = 1) => {
    syncMonitoring.endOperation(operationId, true, itemCount);
  };
  
  // End monitoring sync operation (failure)
  const failSync = (operationId: string, error: string) => {
    syncMonitoring.endOperation(operationId, false, 0, error);
  };

  return {
    monitorSync,
    completeSync,
    failSync
  };
};
