
import React from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAppointmentSync = (syncAppointmentWithGoogleCalendar: (appointment: any) => Promise<any>) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Sync specific appointment with Google Calendar
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
        
      return await syncAppointmentWithGoogleCalendar(appointment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: "Sync successful",
        description: "Appointment has been synced with Google Calendar",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to sync appointment with Google Calendar";
      let action = null;

      if (error instanceof Error) {
        if (error.message.includes("connect your Google Calendar")) {
          errorMessage = "Google Calendar is not connected";
          action = {
            component: React.createElement(
              'button',
              { 
                onClick: () => window.location.href = '/calendar-settings',
                className: "underline text-sm"
              },
              'Connect Calendar'
            )
          };
        } else if (error.message.includes("needs to be renewed")) {
          errorMessage = "Google Calendar connection expired";
          action = {
            component: React.createElement(
              'button',
              { 
                onClick: () => window.location.href = '/calendar-settings',
                className: "underline text-sm"
              },
              'Reconnect Calendar'
            )
          };
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Sync failed",
        description: errorMessage,
        action: action,
        variant: "destructive",
      });
    }
  });

  return { syncAppointment };
};
