
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calendarCache } from "@/utils/calendar-data-cache";
import { retryWithBackoff } from "@/utils/retry-mechanism";
import { syncMonitoring } from "@/utils/calendar-sync-monitoring";

/**
 * Hook for syncing all pending appointments in bulk
 */
export const useBulkAppointmentSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncAllPendingAppointments = useMutation({
    mutationFn: async () => {
      // Start monitoring this bulk operation
      const operationId = syncMonitoring.startOperation("bulk_sync");
      
      try {
        const response = await retryWithBackoff(
          async () => supabase.functions.invoke("sync-calendar-background"),
          3, // maxRetries
          2000, // initialDelay
          2 // backoffFactor
        );
        
        if (response.error) {
          throw response.error;
        }
        
        // Record successful sync in monitoring
        syncMonitoring.endOperation(
          operationId, 
          true, 
          response.data?.synced || 0
        );
        
        return response.data;
      } catch (error) {
        // Record failed sync in monitoring
        syncMonitoring.endOperation(
          operationId, 
          false, 
          0, 
          error instanceof Error ? error.message : String(error)
        );
        
        throw error;
      } finally {
        // Clear cache to ensure fresh data after sync
        calendarCache.clear();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-events'] });
      
      if (data.synced > 0 || data.failed > 0) {
        toast({
          title: "Calendar Sync Complete",
          description: `${data.synced} appointments synced, ${data.failed} failed`,
          variant: data.failed > 0 ? "destructive" : "default",
        });
      } else {
        toast({
          title: "No sync needed",
          description: "All appointments are already synced",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync appointments",
        variant: "destructive",
      });
    }
  });

  return {
    syncAllPendingAppointments,
    isSyncing: syncAllPendingAppointments.isPending
  };
};
