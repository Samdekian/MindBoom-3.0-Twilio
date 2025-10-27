
import React from 'react';
import { useSyncOperation } from './use-sync-operation';
import { useSyncMonitor } from './use-sync-monitor';

/**
 * Combined hook for background sync operations and monitoring
 */
export const useBackgroundSync = () => {
  const { syncAllPendingAppointments, isSyncingOperation } = useSyncOperation();
  const { isSyncing: isSyncMonitoring } = useSyncMonitor();

  // Combine both sync states
  const isSyncing = React.useMemo(() => 
    isSyncingOperation || isSyncMonitoring, 
    [isSyncingOperation, isSyncMonitoring]
  );

  return {
    syncAllPendingAppointments,
    isSyncing
  };
};
