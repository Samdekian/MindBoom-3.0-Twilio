
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Appointment } from "@/types/appointments";
import { retryWithBackoff } from "@/utils/retry-mechanism";

/**
 * Hook for retrying sync operations with exponential backoff
 */
export const useSyncRetry = () => {
  // Retry sync with exponential backoff
  const retrySync = useMutation({
    mutationFn: async (appointment: Appointment) => {
      // Use retry mechanism with backoff
      return await retryWithBackoff(
        async () => {
          const response = await supabase.functions.invoke("sync-appointment-to-calendar", {
            body: { appointment }
          });
          
          if (response.error) {
            throw new Error(response.error.message || "Failed to sync appointment");
          }
          
          return response;
        },
        3, // Maximum retry attempts
        1000, // Initial delay in ms
        2 // Backoff multiplier
      );
    }
  });

  return {
    retrySync
  };
};
