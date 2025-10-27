import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useParams } from 'react-router-dom';

export const usePatientAnalytics = () => {
  const { user } = useAuthRBAC();
  const { patientId } = useParams();

  const { data: sessionData, isLoading: sessionLoading } = useQuery({
    queryKey: ['patient-session-analytics', patientId, user?.id],
    queryFn: async () => {
      if (!patientId || !user?.id) return [];

      const { data, error } = await supabase
        .from('appointments')
        .select('start_time, status')
        .eq('patient_id', patientId)
        .eq('therapist_id', user.id)
        .eq('status', 'completed')
        .order('start_time', { ascending: true });

      if (error) throw error;

      // Group by month for chart
      const monthlyData = data.reduce((acc: { [key: string]: number }, appointment) => {
        const month = new Date(appointment.start_time).toLocaleDateString('en-US', { month: 'short' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {});

      return Object.entries(monthlyData).map(([date, value]) => ({ date, value }));
    },
    enabled: !!patientId && !!user?.id
  });

  const { data: goalProgress } = useQuery({
    queryKey: ['patient-goal-progress', patientId, user?.id],
    queryFn: async () => {
      if (!patientId || !user?.id) return 0;

      // For now, return a calculated progress based on completed sessions
      const totalSessions = sessionData?.reduce((sum, item) => sum + item.value, 0) || 0;
      const targetSessions = 20; // Could be from treatment plan
      return Math.min((totalSessions / targetSessions) * 100, 100);
    },
    enabled: !!patientId && !!user?.id && !!sessionData
  });

  return {
    sessionData: sessionData || [],
    goalProgress: goalProgress || 0,
    isLoading: sessionLoading
  };
};