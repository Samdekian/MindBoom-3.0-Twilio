
import { useCalendarSyncService } from "@/hooks/appointment/use-calendar-sync-service";
import { useSingleAppointmentSync } from "@/hooks/appointment/use-single-appointment-sync";
import { useBulkAppointmentSync } from "@/hooks/appointment/use-bulk-appointment-sync";
import { useAppointmentUpdate } from "@/hooks/appointment/use-appointment-update";
import { useAppointmentDelete } from "@/hooks/appointment/use-appointment-delete";

/**
 * Optimized hook for syncing appointments with calendar providers
 * Features enhanced error handling, retry logic, and performance monitoring
 */
export const useOptimizedAppointmentSync = () => {
  const { syncAppointmentWithGoogleCalendar, isGoogleCalendarConnected } = useCalendarSyncService();
  const { syncAppointment, isSyncing: isSyncingSingle } = useSingleAppointmentSync();
  const { syncAllPendingAppointments, isSyncing: isSyncingBulk } = useBulkAppointmentSync();
  const { updateAppointment } = useAppointmentUpdate();
  const { deleteAppointment } = useAppointmentDelete();

  return {
    syncAppointment,
    syncAllPendingAppointments,
    updateAppointment,
    deleteAppointment,
    syncAppointmentWithGoogleCalendar,
    isSyncing: isSyncingSingle || isSyncingBulk
  };
};
