
import { useAppointmentCrud } from "./appointment/use-appointment-crud";
import { useOptimizedAppointmentSync } from "./appointment/use-optimized-appointment-sync";
import { useAppointmentVideo } from "./appointment/use-appointment-video";

export type { CreateAppointmentData } from "./appointment/use-appointment-crud";
export type { Appointment, AppointmentStatus } from "@/types/appointments";

/**
 * Hook for creating appointments - simplified interface
 */
export const useCreateAppointment = () => {
  const { createAppointment } = useAppointmentCrud();
  return createAppointment;
};

/**
 * Main appointments hook that combines CRUD operations, sync functionality,
 * and video-related appointment features
 * 
 * @returns All appointment-related functionality
 */
export const useAppointments = () => {
  // Appointment CRUD operations
  const {
    appointments,
    isLoading,
    error,
    updateAppointmentStatus,
    createAppointment,
    fetchAppointment,
    getAppointment,
    updateAppointment: updateAppointmentCrud,
    deleteAppointment: deleteAppointmentCrud,
  } = useAppointmentCrud();

  // Calendar sync operations
  const {
    syncAppointment,
    updateAppointment, 
    deleteAppointment,
    syncAppointmentWithGoogleCalendar,
    syncAllPendingAppointments,
    isSyncing,
  } = useOptimizedAppointmentSync();

  // Video-related operations
  const {
    updateAppointmentVideoDetails,
  } = useAppointmentVideo();

  return {
    // Data and loading states
    appointments,
    isLoading,
    error,
    
    // CRUD operations
    updateAppointmentStatus,
    createAppointment,
    fetchAppointment,
    getAppointment,
    
    // Calendar sync operations
    syncAppointment,
    updateAppointment,
    deleteAppointment,
    syncAppointmentWithGoogleCalendar,
    syncAllPendingAppointments,
    isSyncing,
    
    // Video operations
    updateAppointmentVideoDetails,
    
    // Direct CRUD operations (alternative interface)
    updateAppointmentCrud,
    deleteAppointmentCrud,
  };
};
