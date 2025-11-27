import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

export interface TreatmentPlan {
  id: string;
  title: string;
  description: string;
  goals: string[];
  start_date: string;
  end_date: string | null;
  status: string;
  progress_percentage: number;
  therapist_id: string;
  therapist_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target_date: string | null;
  status: string;
  progress_notes: string | null;
  created_at: string;
}

// Note: Since treatment_plans table doesn't exist yet, we'll simulate this with session data
export const usePatientTreatmentPlans = () => {
  const { user } = useAuthRBAC();

  return useQuery({
    queryKey: ["patient-treatment-plans", user?.id],
    queryFn: async (): Promise<TreatmentPlan[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      // For now, we'll create a mock treatment plan based on actual data
      // In a real implementation, this would query a treatment_plans table
      const { data: therapistData } = await supabase
        .from("appointments")
        .select("therapist_id")
        .eq("patient_id", user.id)
        .limit(1)
        .maybeSingle();

      let therapistName = "Your Therapist";
      if (therapistData?.therapist_id) {
        const { data: therapist } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", therapistData.therapist_id)
          .single();
        
        therapistName = therapist?.full_name || "Your Therapist";
      }

      const { data: sessionCount } = await supabase
        .from("appointments")
        .select("id")
        .eq("patient_id", user.id)
        .eq("status", "completed");

      const completedSessions = sessionCount?.length || 0;
      const progress = Math.min((completedSessions / 12) * 100, 100);

      // Mock treatment plan data
      const mockPlan: TreatmentPlan = {
        id: "1",
        title: "Anxiety Management and Coping Strategies",
        description: "A comprehensive treatment plan focused on developing healthy coping mechanisms and reducing anxiety symptoms through evidence-based therapeutic approaches.",
        goals: [
          "Identify personal anxiety triggers",
          "Learn and practice breathing techniques",
          "Develop cognitive restructuring skills",
          "Establish healthy daily routines",
          "Build confidence in social situations"
        ],
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days from now
        status: completedSessions > 0 ? "active" : "pending",
        progress_percentage: progress,
        therapist_id: therapistData?.therapist_id || "",
        therapist_name: therapistName,
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      };

      return completedSessions > 0 || therapistData ? [mockPlan] : [];
    },
    enabled: !!user?.id,
  });
};

export const usePatientGoals = () => {
  const { user } = useAuthRBAC();

  return useQuery({
    queryKey: ["patient-goals", user?.id],
    queryFn: async (): Promise<Goal[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      // Mock goals data based on session progress
      const { data: sessionCount } = await supabase
        .from("appointments")
        .select("id")
        .eq("patient_id", user.id)
        .eq("status", "completed");

      const completedSessions = sessionCount?.length || 0;

      const mockGoals: Goal[] = [
        {
          id: "1",
          title: "Complete initial assessment",
          description: "Participate in comprehensive initial therapy session",
          target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: completedSessions > 0 ? "completed" : "in_progress",
          progress_notes: completedSessions > 0 ? "Assessment completed successfully" : "Scheduled for next session",
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          title: "Learn breathing techniques",
          description: "Master 3 different breathing exercises for anxiety management",
          target_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          status: completedSessions > 2 ? "completed" : completedSessions > 0 ? "in_progress" : "pending",
          progress_notes: completedSessions > 2 ? "All techniques learned and practiced" : completedSessions > 0 ? "Making good progress" : null,
          created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          title: "Develop daily mindfulness routine",
          description: "Establish a consistent 10-minute daily mindfulness practice",
          target_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          status: completedSessions > 4 ? "completed" : completedSessions > 1 ? "in_progress" : "pending",
          progress_notes: completedSessions > 4 ? "Routine established successfully" : completedSessions > 1 ? "Started practicing regularly" : null,
          created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      return mockGoals;
    },
    enabled: !!user?.id,
  });
};