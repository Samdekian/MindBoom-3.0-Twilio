import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useWorkloadMetrics = () => {
  const { user } = useAuthRBAC();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['workload-metrics', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Get active patient assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('patient_assignments')
        .select('patient_id')
        .eq('therapist_id', user.id)
        .eq('status', 'active');

      if (assignmentsError) throw assignmentsError;

      const caseloadSize = assignments?.length || 0;

      // Get this week's appointments
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const { data: weeklyAppointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('therapist_id', user.id)
        .gte('start_time', startOfWeek.toISOString())
        .lte('start_time', endOfWeek.toISOString())
        .in('status', ['scheduled', 'completed']);

      if (appointmentsError) throw appointmentsError;

      const weeklyHours = weeklyAppointments?.reduce((total, apt) => {
        const start = new Date(apt.start_time);
        const end = new Date(apt.end_time);
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0) || 0;

      const averageSessionDuration = weeklyAppointments?.length 
        ? (weeklyHours * 60) / weeklyAppointments.length 
        : 0;

      // Get intake forms to analyze primary concerns
      const { data: intakeForms, error: intakeError } = await supabase
        .from('patient_intake_forms')
        .select('primary_concerns')
        .eq('therapist_id', user.id)
        .not('primary_concerns', 'is', null);

      if (intakeError) throw intakeError;

      // Simple categorization of concerns
      const concernCategories = intakeForms?.reduce((acc: { [key: string]: number }, form) => {
        const concerns = form.primary_concerns?.toLowerCase() || '';
        if (concerns.includes('anxiety')) acc['Anxiety'] = (acc['Anxiety'] || 0) + 1;
        else if (concerns.includes('depression')) acc['Depression'] = (acc['Depression'] || 0) + 1;
        else if (concerns.includes('stress')) acc['Stress'] = (acc['Stress'] || 0) + 1;
        else if (concerns.includes('relationship')) acc['Relationship Issues'] = (acc['Relationship Issues'] || 0) + 1;
        else acc['Other'] = (acc['Other'] || 0) + 1;
        return acc;
      }, {}) || {};

      const caseloadData = Object.entries(concernCategories).map(([name, value]) => ({
        name,
        value
      }));

      return {
        caseloadSize,
        averageSessionDuration: Math.round(averageSessionDuration),
        weeklyHoursWorked: Math.round(weeklyHours),
        patientSatisfaction: 0.85, // This would come from satisfaction surveys
        caseloadData
      };
    },
    enabled: !!user?.id
  });

  return {
    metrics: metrics || {
      caseloadSize: 0,
      averageSessionDuration: 0,
      weeklyHoursWorked: 0,
      patientSatisfaction: 0,
      caseloadData: []
    },
    isLoading
  };
};