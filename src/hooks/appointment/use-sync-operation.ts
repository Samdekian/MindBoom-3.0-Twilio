
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { calendarCache } from "@/utils/calendar-data-cache";
import { retryWithBackoff } from "@/utils/retry-mechanism";

/**
 * Hook for initiating background sync operations
 */
export const useSyncOperation = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const syncAllPendingAppointments = useMutation({
    mutationFn: async () => {
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
        
        return response.data;
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
    isSyncingOperation: syncAllPendingAppointments.isPending
  };
};
