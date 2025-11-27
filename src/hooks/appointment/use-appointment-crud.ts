
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export interface CreateAppointmentData {
  patient_id: string;
  therapist_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  video_enabled?: boolean;
  video_url?: string;
  video_meeting_id?: string;
  is_initial_consultation?: boolean;
  appointment_type?: string;
  location?: string;
}

export const useAppointmentCrud = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuthRBAC();

  // Fetch appointments
  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .or(`patient_id.eq.${user.id},therapist_id.eq.${user.id}`)
        .order('start_time', { ascending: true });

      if (error) {
        console.error("Error fetching appointments:", error);
        throw new Error(`Failed to fetch appointments: ${error.message}`);
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  const createAppointment = useMutation({
    mutationFn: async (appointmentData: CreateAppointmentData) => {
      console.log('Creating appointment with data:', appointmentData);
      
      // Validate required fields
      if (!appointmentData.patient_id || !appointmentData.therapist_id) {
        throw new Error('Patient ID and Therapist ID are required');
      }
      
      if (!appointmentData.start_time || !appointmentData.end_time) {
        throw new Error('Start time and end time are required');
      }

      // Prepare appointment data with video session details if video is enabled
      const finalAppointmentData = { ...appointmentData };
      
      if (appointmentData.video_enabled) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        finalAppointmentData.video_meeting_id = sessionId;
        finalAppointmentData.video_url = `/video-conference/${sessionId}`;
        finalAppointmentData.appointment_type = 'video';
      }

      const { data, error } = await supabase
        .from('appointments')
        .insert([finalAppointmentData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create appointment: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to create appointment: No data returned');
      }

      // If video is enabled, create the instant session for WebRTC signaling
      if (appointmentData.video_enabled && finalAppointmentData.video_meeting_id) {
        try {
          await supabase
            .from('instant_sessions')
            .insert({
              id: finalAppointmentData.video_meeting_id,
              session_name: `${appointmentData.title} - Video Session`,
              session_token: btoa(`${finalAppointmentData.video_meeting_id}_${Math.random().toString(36).substr(2, 9)}`),
              therapist_id: appointmentData.therapist_id,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
              is_active: false, // Will be activated when session starts
              waiting_room_enabled: true,
              recording_enabled: false,
              max_participants: 2
            });
        } catch (sessionError) {
          console.warn('Failed to create instant session, but appointment was created:', sessionError);
          // Don't fail the appointment creation if session creation fails
        }
      }

      console.log('Appointment created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      console.log('Appointment creation successful, data:', data);
    },
    onError: (error: any) => {
      console.error('Appointment creation failed:', error);
      toast({
        title: 'Error Creating Appointment',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const updateAppointment = useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string } & Partial<CreateAppointmentData>) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update appointment: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Appointment Updated',
        description: 'Your appointment has been updated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Updating Appointment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteAppointment = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete appointment: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast({
        title: 'Appointment Deleted',
        description: 'Your appointment has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error Deleting Appointment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add fetch single appointment function
  const fetchAppointment = async (id: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch appointment: ${error.message}`);
    }

    return data;
  };

  // Add get appointment function for immediate access
  const getAppointment = (id: string) => {
    return appointments?.find(app => app.id === id);
  };

  // Add update appointment status function
  const updateAppointmentStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update appointment status: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });

  return { 
    appointments,
    isLoading,
    error,
    createAppointment, 
    updateAppointment, 
    deleteAppointment,
    fetchAppointment,
    getAppointment,
    updateAppointmentStatus
  };
};
