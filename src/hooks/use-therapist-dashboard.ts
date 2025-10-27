
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useTherapistDashboard = () => {
  const { user } = useAuthRBAC();

  const { data, isLoading, error } = useQuery({
    queryKey: ['therapist-dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Mock data for dashboard stats
      return {
        dashboardStats: {
          totalAppointments: 156,
          scheduledAppointments: 12,
          completedAppointments: 144,
          activePatients: 28,
          patientCount: 28,
          todaySessionCount: 3,
          nextSessionTime: "2:30 PM",
          weekSessionCount: 18,
          notificationCount: 5,
        },
        recentActivities: [
          {
            id: '1',
            type: 'appointment_completed',
            description: 'Session completed with John Doe',
            timestamp: new Date().toISOString(),
          }
        ],
        upcomingAppointments: [
          {
            id: '1',
            patient_name: 'Jane Smith',
            start_time: new Date(Date.now() + 3600000).toISOString(),
            appointment_type: 'therapy',
          }
        ]
      };
    },
    enabled: !!user?.id,
  });

  return {
    dashboardStats: data?.dashboardStats || {
      totalAppointments: 0,
      scheduledAppointments: 0,
      completedAppointments: 0,
      activePatients: 0,
      patientCount: 0,
      todaySessionCount: 0,
      nextSessionTime: null,
      weekSessionCount: 0,
      notificationCount: 0,
    },
    recentActivities: data?.recentActivities || [],
    upcomingAppointments: data?.upcomingAppointments || [],
    isLoading,
  };
};
