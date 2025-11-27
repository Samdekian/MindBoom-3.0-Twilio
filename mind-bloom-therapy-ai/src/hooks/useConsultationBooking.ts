import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface ConsultationType {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  is_free: boolean;
}

interface ConsultationBookingData {
  therapistId: string;
  consultationType: 'free' | 'paid';
  selectedDate: Date;
  selectedTime: string;
  reasonForSeeking: string;
  previousTherapy: boolean;
  urgencyLevel: string;
  preferredCommunication: string;
  specificConcerns: string;
  goals: string;
}

export const useConsultationBooking = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch consultation types
  const { data: consultationTypes = [] } = useQuery({
    queryKey: ['consultation-types'],
    queryFn: async (): Promise<ConsultationType[]> => {
      const { data, error } = await supabase
        .from('consultation_types')
        .select('*')
        .eq('is_active', true)
        .order('duration_minutes');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Book consultation mutation
  const bookConsultationMutation = useMutation({
    mutationFn: async (data: ConsultationBookingData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Find the consultation type
      const consultationType = consultationTypes.find(ct => 
        data.consultationType === 'free' ? ct.is_free : !ct.is_free
      );
      
      if (!consultationType) throw new Error('Consultation type not found');

      // Create appointment first
      const appointmentStartTime = new Date(data.selectedDate);
      const [hours, minutes] = data.selectedTime.split(':');
      const isPM = data.selectedTime.includes('PM');
      let hour24 = parseInt(hours);
      
      if (isPM && hour24 !== 12) hour24 += 12;
      if (!isPM && hour24 === 12) hour24 = 0;
      
      appointmentStartTime.setHours(hour24, parseInt(minutes) || 0, 0, 0);
      
      const appointmentEndTime = new Date(appointmentStartTime);
      appointmentEndTime.setMinutes(appointmentEndTime.getMinutes() + consultationType.duration_minutes);

      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          therapist_id: data.therapistId,
          title: `Initial Consultation - ${consultationType.name}`,
          description: `Consultation type: ${consultationType.name}`,
          start_time: appointmentStartTime.toISOString(),
          end_time: appointmentEndTime.toISOString(),
          status: 'scheduled',
          is_initial_consultation: true,
          consultation_type: data.consultationType,
          consultation_notes: data.specificConcerns
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Create initial consultation record
      const { data: consultation, error: consultationError } = await supabase
        .from('initial_consultations')
        .insert({
          patient_id: user.id,
          therapist_id: data.therapistId,
          consultation_type_id: consultationType.id,
          appointment_id: appointment.id,
          reason_for_seeking: data.reasonForSeeking,
          previous_therapy: data.previousTherapy,
          urgency_level: data.urgencyLevel,
          preferred_communication: data.preferredCommunication,
          specific_concerns: data.specificConcerns,
          goals: data.goals
        })
        .select()
        .single();

      if (consultationError) throw consultationError;

      return { appointment, consultation };
    },
    onSuccess: () => {
      toast({
        title: "Consultation Booked Successfully",
        description: "Your consultation has been scheduled. You'll receive a confirmation notification.",
      });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error: any) => {
      console.error('Consultation booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book consultation. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    consultationTypes,
    bookConsultation: bookConsultationMutation.mutate,
    isBooking: bookConsultationMutation.isPending
  };
};
