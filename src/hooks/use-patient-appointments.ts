
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  title: string;
  videoUrl?: string;
}

export function usePatientAppointments(patientId: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const fetchAppointments = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id,
            start_time,
            end_time,
            status,
            title,
            video_url
          `)
          .eq('patient_id', patientId)
          .order('start_time', { ascending: false });
          
        if (error) throw error;
        
        const formattedAppointments: Appointment[] = data.map(appt => ({
          id: appt.id,
          startTime: appt.start_time,
          endTime: appt.end_time,
          status: appt.status,
          title: appt.title || 'Therapy Session',
          videoUrl: appt.video_url
        }));
        
        setAppointments(formattedAppointments);
        
      } catch (error) {
        console.error('Error fetching patient appointments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [patientId]);

  return { 
    appointments,
    isLoading
  };
}
