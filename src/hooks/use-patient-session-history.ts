import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

export interface SessionHistoryItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  appointment_type: string;
  session_notes: string | null;
  therapist_id: string;
  therapist_name?: string;
  duration?: number;
}

export interface SessionNote {
  id: string;
  title: string;
  content: string;
  note_type: string;
  created_at: string;
  is_private: boolean;
  therapist_name?: string;
}

export const usePatientSessionHistory = () => {
  const { user } = useAuthRBAC();

  return useQuery({
    queryKey: ["patient-session-history", user?.id],
    queryFn: async (): Promise<SessionHistoryItem[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          title,
          start_time,
          end_time,
          status,
          appointment_type,
          session_notes,
          therapist_id
        `)
        .eq("patient_id", user.id)
        .in("status", ["completed", "cancelled"])
        .order("start_time", { ascending: false });

      if (error) throw error;

      // Get therapist names separately
      const therapistIds = [...new Set(data?.map(s => s.therapist_id))];
      const { data: therapists } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", therapistIds);

      const therapistMap = new Map(therapists?.map(t => [t.id, t.full_name]) || []);

      return data?.map(session => {
        const startTime = new Date(session.start_time);
        const endTime = new Date(session.end_time);
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

        return {
          ...session,
          therapist_name: therapistMap.get(session.therapist_id) || "Therapist",
          duration
        };
      }) || [];
    },
    enabled: !!user?.id,
  });
};

export const usePatientSessionNotes = () => {
  const { user } = useAuthRBAC();

  return useQuery({
    queryKey: ["patient-session-notes", user?.id],
    queryFn: async (): Promise<SessionNote[]> => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("patient_notes")
        .select(`
          id,
          title,
          content,
          note_type,
          created_at,
          is_private,
          therapist_id
        `)
        .eq("patient_id", user.id)
        .eq("is_private", false) // Only show non-private notes to patients
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get therapist names separately
      const therapistIds = [...new Set(data?.map(n => n.therapist_id))];
      const { data: therapists } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", therapistIds);

      const therapistMap = new Map(therapists?.map(t => [t.id, t.full_name]) || []);

      return data?.map(note => ({
        ...note,
        therapist_name: therapistMap.get(note.therapist_id) || "Therapist"
      })) || [];
    },
    enabled: !!user?.id,
  });
};