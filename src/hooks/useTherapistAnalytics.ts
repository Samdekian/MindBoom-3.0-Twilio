
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useTherapistAnalytics = () => {
  const { user } = useAuthRBAC();

  return useQuery({
    queryKey: ['therapist-analytics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get total inquiries
      const { data: inquiries, error: inquiriesError } = await supabase
        .from('patient_inquiries')
        .select('id, created_at, responded_at')
        .eq('therapist_id', user.id);

      if (inquiriesError) throw inquiriesError;

      // Get total consultations
      const { data: consultations, error: consultationsError } = await supabase
        .from('initial_consultations')
        .select('id, created_at')
        .eq('therapist_id', user.id);

      if (consultationsError) throw consultationsError;

      // Get appointments for consultation bookings
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('id, created_at, is_initial_consultation')
        .eq('therapist_id', user.id)
        .eq('is_initial_consultation', true);

      if (appointmentsError) throw appointmentsError;

      const totalInquiries = inquiries?.length || 0;
      const totalConsultations = consultations?.length || 0;
      const totalConsultationBookings = appointments?.length || 0;

      // Calculate conversion rate (consultations booked / inquiries)
      const conversionRate = totalInquiries > 0 ? (totalConsultationBookings / totalInquiries) * 100 : 0;

      // Calculate average response time
      const respondedInquiries = inquiries?.filter(i => i.responded_at) || [];
      const avgResponseTime = respondedInquiries.length > 0 
        ? respondedInquiries.reduce((acc, inquiry) => {
            const responseTime = new Date(inquiry.responded_at!).getTime() - new Date(inquiry.created_at).getTime();
            return acc + (responseTime / (1000 * 60)); // Convert to minutes
          }, 0) / respondedInquiries.length
        : 0;

      // Get recent metrics (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentMetrics = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const dayInquiries = inquiries?.filter(i => 
          new Date(i.created_at).toISOString().split('T')[0] === dateStr
        ).length || 0;

        const dayConsultations = appointments?.filter(a => 
          new Date(a.created_at).toISOString().split('T')[0] === dateStr
        ).length || 0;

        const dayConversionRate = dayInquiries > 0 ? (dayConsultations / dayInquiries) * 100 : 0;

        recentMetrics.push({
          id: (i + 1).toString(),
          metric_date: date.toISOString(),
          profile_views: Math.floor(Math.random() * 20) + 5, // Mock profile views for now
          inquiry_count: dayInquiries,
          consultation_bookings: dayConsultations,
          conversion_rate: Number(dayConversionRate.toFixed(1))
        });
      }

      return {
        totalProfileViews: Math.floor(Math.random() * 200) + 100, // Mock for now
        totalInquiries,
        totalConsultations,
        averageConversionRate: Number(conversionRate.toFixed(1)),
        averageResponseTime: Math.round(avgResponseTime),
        recentMetrics
      };
    },
    enabled: !!user?.id
  });
};
