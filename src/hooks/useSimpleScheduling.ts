
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TherapistProfile, AvailabilitySlot, SimpleAppointment } from "@/types/scheduling";

export const useSimpleScheduling = () => {
  const [therapists, setTherapists] = useState<TherapistProfile[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [appointments, setAppointments] = useState<SimpleAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch approved therapists
  const fetchTherapists = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, account_type, approval_status')
        .eq('account_type', 'therapist')
        .eq('approval_status', 'approved');

      if (error) throw error;
      setTherapists(data || []);
    } catch (error: any) {
      console.error("Error fetching therapists:", error);
      toast({
        title: "Error",
        description: "Failed to load therapists",
        variant: "destructive",
      });
    }
  };

  // Fetch availability for a specific therapist
  const fetchAvailability = async (therapistId?: string) => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('therapist_availability')
        .select('*')
        .eq('is_available', true)
        .order('day_of_week')
        .order('start_time');

      if (therapistId) {
        query = query.eq('therapist_id', therapistId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAvailability(data || []);
    } catch (error: any) {
      console.error("Error fetching availability:", error);
      toast({
        title: "Error",
        description: "Failed to load availability",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Create appointment
  const createAppointment = async (appointmentData: Omit<SimpleAppointment, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          ...appointmentData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Appointment Booked",
        description: "Your appointment has been successfully scheduled",
      });

      return data;
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Booking Failed",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Fetch user appointments
  const fetchUserAppointments = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .or(`patient_id.eq.${userId},therapist_id.eq.${userId}`)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  return {
    therapists,
    availability,
    appointments,
    isLoading,
    fetchTherapists,
    fetchAvailability,
    createAppointment,
    fetchUserAppointments,
  };
};
