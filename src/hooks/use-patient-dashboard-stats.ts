import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

interface PatientDashboardStats {
  totalSessions: number;
  sessionsThisMonth: number;
  nextAppointment: {
    date: string;
    time: string;
    therapistName: string;
  } | null;
  completedGoals: number;
  totalGoals: number;
  daysSinceLastSession: number;
  streakDays: number;
  treatmentPlanProgress: number;
  lastActivityDate: string | null;
}

export const usePatientDashboardStats = () => {
  const { user } = useAuthRBAC();

  return useQuery({
    queryKey: ["patient-dashboard-stats", user?.id],
    queryFn: async (): Promise<PatientDashboardStats> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Get total completed sessions
      const { data: totalSessionsData, error: totalSessionsError } = await supabase
        .from("appointments")
        .select("id")
        .eq("patient_id", user.id)
        .eq("status", "completed");

      if (totalSessionsError) throw totalSessionsError;

      // Get sessions this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlySessionsData, error: monthlySessionsError } = await supabase
        .from("appointments")
        .select("id")
        .eq("patient_id", user.id)
        .eq("status", "completed")
        .gte("start_time", startOfMonth.toISOString());

      if (monthlySessionsError) throw monthlySessionsError;

      // Get next upcoming appointment with therapist info
      const { data: nextAppointmentData } = await supabase
        .from("appointments")
        .select(`
          start_time,
          end_time,
          therapist_id
        `)
        .eq("patient_id", user.id)
        .in("status", ["scheduled", "confirmed"])
        .gte("start_time", new Date().toISOString())
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();

      // Get therapist name if appointment exists
      let therapistName = "Your Therapist";
      if (nextAppointmentData?.therapist_id) {
        const { data: therapistData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", nextAppointmentData.therapist_id)
          .single();
        
        therapistName = therapistData?.full_name || "Your Therapist";
      }

      // Get last session date for calculating days since
      const { data: lastSessionData } = await supabase
        .from("appointments")
        .select("start_time")
        .eq("patient_id", user.id)
        .eq("status", "completed")
        .order("start_time", { ascending: false })
        .limit(1)
        .single();

      // Calculate days since last session
      let daysSinceLastSession = 0;
      if (lastSessionData?.start_time) {
        const lastSessionDate = new Date(lastSessionData.start_time);
        const today = new Date();
        daysSinceLastSession = Math.floor((today.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Calculate treatment plan progress (mock for now - can be enhanced with actual treatment plan data)
      const treatmentPlanProgress = totalSessionsData ? Math.min((totalSessionsData.length / 12) * 100, 100) : 0;

      // Calculate streak (simplified - consecutive days with activity)
      const streakDays = daysSinceLastSession <= 7 ? Math.max(0, 7 - daysSinceLastSession) : 0;

      return {
        totalSessions: totalSessionsData?.length || 0,
        sessionsThisMonth: monthlySessionsData?.length || 0,
        nextAppointment: nextAppointmentData ? {
          date: new Date(nextAppointmentData.start_time).toLocaleDateString(),
          time: new Date(nextAppointmentData.start_time).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          therapistName
        } : null,
        completedGoals: Math.floor((totalSessionsData?.length || 0) * 0.3), // Mock calculation
        totalGoals: Math.max(5, Math.floor((totalSessionsData?.length || 0) * 0.5)), // Mock calculation
        daysSinceLastSession,
        streakDays,
        treatmentPlanProgress,
        lastActivityDate: lastSessionData?.start_time || null
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};