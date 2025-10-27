import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export interface SessionHistory {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  therapist_name?: string;
  patient_name?: string;
  session_notes?: string;
  appointment_type?: string;
}

export function useSessionHistory() {
  const { user, primaryRole } = useAuthRBAC();
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionHistory = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('appointments')
          .select(`
            id,
            title,
            start_time,
            end_time,
            status,
            session_notes,
            appointment_type,
            therapist_id,
            patient_id
          `)
          .order('start_time', { ascending: false });

        // Filter based on user role
        if (primaryRole === 'therapist') {
          query = query.eq('therapist_id', user.id);
        } else {
          query = query.eq('patient_id', user.id);
        }

        const { data: appointments, error: appointmentsError } = await query;

        if (appointmentsError) throw appointmentsError;

        // Get therapist/patient names for each appointment
        const sessionsWithNames = await Promise.all(
          (appointments || []).map(async (appointment) => {
            const session: SessionHistory = {
              id: appointment.id,
              title: appointment.title || 'Therapy Session',
              start_time: appointment.start_time,
              end_time: appointment.end_time,
              status: appointment.status,
              session_notes: appointment.session_notes,
              appointment_type: appointment.appointment_type || 'Individual Therapy',
            };

            // Get therapist name if user is patient
            if (primaryRole === 'patient' && appointment.therapist_id) {
              const { data: therapist } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', appointment.therapist_id)
                .single();
              
              session.therapist_name = therapist?.full_name || 'Dr. Smith';
            }

            // Get patient name if user is therapist
            if (primaryRole === 'therapist' && appointment.patient_id) {
              const { data: patient } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', appointment.patient_id)
                .single();
              
              session.patient_name = patient?.full_name || 'Patient';
            }

            return session;
          })
        );

        setSessions(sessionsWithNames);
      } catch (error) {
        console.error('Error fetching session history:', error);
        setError('Failed to load session history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionHistory();
  }, [user?.id, primaryRole]);

  return { sessions, isLoading, error };
}