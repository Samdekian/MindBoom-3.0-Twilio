import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

interface OnboardingStatus {
  hasScheduledFirstSession: boolean;
  hasSelectedTherapist: boolean;
  hasSetInitialGoals: boolean;
  isOnboardingComplete: boolean;
}

export const useOnboardingStatus = () => {
  const { user } = useAuthRBAC();

  return useQuery({
    queryKey: ["onboarding-status", user?.id],
    queryFn: async (): Promise<OnboardingStatus> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Check if user has any confirmed appointments (first session scheduled)
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id")
        .eq("patient_id", user.id)
        .in("status", ["scheduled", "confirmed", "completed"])
        .limit(1);

      if (appointmentsError) throw appointmentsError;
      const hasScheduledFirstSession = (appointmentsData?.length || 0) > 0;

      // Check if user has any patient-therapist relationships (therapist selected)
      const { data: relationshipsData, error: relationshipsError } = await supabase
        .from("patient_therapist_relationships")
        .select("id")
        .eq("patient_id", user.id)
        .eq("relationship_status", "active")
        .limit(1);

      if (relationshipsError) throw relationshipsError;
      const hasSelectedTherapist = (relationshipsData?.length || 0) > 0;

      // Check if user has any active goals (initial goals set)
      const { data: goalsData, error: goalsError } = await supabase
        .from("patient_goals")
        .select("id")
        .eq("patient_id", user.id)
        .eq("status", "active")
        .limit(1);

      if (goalsError) throw goalsError;
      const hasSetInitialGoals = (goalsData?.length || 0) > 0;

      const isOnboardingComplete = hasScheduledFirstSession && hasSelectedTherapist && hasSetInitialGoals;

      return {
        hasScheduledFirstSession,
        hasSelectedTherapist,
        hasSetInitialGoals,
        isOnboardingComplete,
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
  });
};