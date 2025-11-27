
import React from 'react'; // Add React import for JSX
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast"; // Fixed import path
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import { Appointment } from "@/types/appointments";

export const useAppointmentSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isConnected: isGoogleCalendarConnected } = useGoogleCalendar();

  const syncAppointmentWithGoogleCalendar = async (appointment: Appointment) => {
    if (!isGoogleCalendarConnected) {
      throw new Error("Google Calendar is not connected");
    }
    
    try {
      const response = await supabase.functions.invoke("sync-appointment-to-calendar", {
        body: { appointment },
      });
      
      if (response.error) {
        const errorData = response.error;
        
        // Handle specific error cases
        switch(errorData.code) {
          case "NOT_CONNECTED":
            throw new Error("Please connect your Google Calendar before syncing appointments");
          case "TOKEN_REFRESH_FAILED":
            throw new Error("Your Google Calendar connection needs to be renewed. Please reconnect.");
          case "GOOGLE_API_ERROR":
            throw new Error(`Google Calendar sync failed: ${errorData.message}`);
          default:
            throw new Error(errorData.message || "Failed to sync with Google Calendar");
        }
      }
      
      return response.data;
    } catch (error) {
      console.error("Google Calendar sync error:", error);
      throw error;
    }
  };

  const syncAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (fetchError) {
        throw new Error(`Error fetching appointment: ${fetchError.message}`);
      }

      if (!appointment) {
        throw new Error("Appointment not found");
      }
      
      return syncAppointmentWithGoogleCalendar(appointment as unknown as Appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Sync successful",
        description: "Appointment has been synced with Google Calendar",
      });
    },
    onError: (error) => {
      console.error("Error syncing appointment:", error);
      
      let errorMessage = "Failed to sync appointment with Google Calendar";
      let action = null;

      // Customize error message and action based on error type
      if (error instanceof Error) {
        if (error.message.includes("connect your Google Calendar")) {
          errorMessage = "Google Calendar is not connected";
          action = (
            <button 
              onClick={() => window.location.href = '/calendar-settings'} 
              className="underline text-sm"
            >
              Connect Calendar
            </button>
          );
        } else if (error.message.includes("needs to be renewed")) {
          errorMessage = "Google Calendar connection expired";
          action = (
            <button 
              onClick={() => window.location.href = '/calendar-settings'} 
              className="underline text-sm"
            >
              Reconnect Calendar
            </button>
          );
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Sync failed",
        description: errorMessage,
        action,
        variant: "destructive",
      });
    }
  });

  return {
    syncAppointment,
    syncAppointmentWithGoogleCalendar,
  };
};
