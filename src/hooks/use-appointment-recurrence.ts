
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Appointment } from '@/types/appointments';

export const useAppointmentRecurrence = () => {
  const [isCreatingRecurrence, setIsCreatingRecurrence] = useState(false);
  const { toast } = useToast();

  const createRecurringAppointments = async (
    appointmentId: string,
    recurrenceRule: string,
    endDate: Date
  ) => {
    try {
      setIsCreatingRecurrence(true);
      const seriesId = crypto.randomUUID();

      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointmentId)
        .single();

      if (fetchError) throw fetchError;

      // Call the stored procedure to generate recurring instances
      const { error: generateError } = await supabase.rpc(
        'generate_recurring_appointments',
        {
          p_parent_id: appointmentId,
          p_series_id: seriesId,
          p_start_time: appointment.start_time,
          p_end_time: appointment.end_time,
          p_recurrence_rule: recurrenceRule,
          p_recurrence_end_date: endDate.toISOString()
        }
      );

      if (generateError) throw generateError;

      toast({
        title: "Recurring appointments created",
        description: "The appointment series has been scheduled successfully."
      });

      return {
        success: true,
        seriesId
      };

    } catch (error) {
      console.error('Error creating recurring appointments:', error);
      toast({
        title: "Error",
        description: "Failed to create recurring appointments. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreatingRecurrence(false);
    }
  };

  return {
    createRecurringAppointments,
    isCreatingRecurrence
  };
};
