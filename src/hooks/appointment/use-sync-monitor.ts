
import React from 'react';
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calendarCache } from "@/utils/calendar-data-cache";

/**
 * Hook for monitoring the status of background sync operations
 */
export const useSyncMonitor = () => {
  const [isSyncing, setIsSyncing] = React.useState(false);
  const queryClient = useQueryClient();

  // Add a monitor function that polls sync status periodically
  const monitorBackgroundSync = React.useCallback(() => {
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('calendar_sync_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          const latestSync = data[0];
          
          // If a sync is currently in progress
          if (latestSync.status === 'pending' || latestSync.status === 'in_progress') {
            setIsSyncing(true);
            
            // Clear cache to ensure fresh data
            calendarCache.clear();
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['google-calendar-events'] });
          } else {
            setIsSyncing(false);
          }
        }
      } catch (error) {
        console.error('Error monitoring sync status:', error);
      }
    };
    
    // Check status immediately and then every 10 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    
    return () => clearInterval(interval);
  }, [queryClient]);
  
  // Start monitoring on mount
  React.useEffect(() => {
    const cleanup = monitorBackgroundSync();
    return cleanup;
  }, [monitorBackgroundSync]);

  return { isSyncing };
};
