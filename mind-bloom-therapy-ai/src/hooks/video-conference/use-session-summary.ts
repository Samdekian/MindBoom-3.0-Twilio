
import { useState, useCallback } from "react";
import { useToast } from "../use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type SessionSummaryData = {
  appointmentId: string;
  duration: number;
  startTime: string;
  endTime: string;
  participantNames: string[];
  wasRecorded: boolean;
  recordingUrl?: string;
  notes?: string;
};

export function useSessionSummary() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<SessionSummaryData | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate session summary
  const generateSummary = useCallback(async (
    appointmentId: string, 
    sessionDuration: number,
    participantNames: string[],
    wasRecorded: boolean
  ) => {
    try {
      setIsGenerating(true);

      // Get appointment details - mocked for now
      const mockAppointment = {
        id: appointmentId,
        start_time: new Date(Date.now() - sessionDuration * 1000).toISOString(),
        end_time: new Date().toISOString(),
        title: "Therapy Session",
        description: "Regular weekly session",
        recording_url: wasRecorded ? "https://example.com/recordings/mock-recording.mp4" : undefined,
        patient: { full_name: participantNames[0] || "Patient" },
        therapist: { full_name: participantNames[1] || "Therapist" }
      };
      
      /* This would be the actual implementation once table exists
      const { data: appointment, error } = await supabase
        .from("appointments")
        .select(`
          id,
          start_time,
          end_time,
          title,
          description,
          recording_url,
          patient:patient_id(full_name),
          therapist:therapist_id(full_name)
        `)
        .eq("id", appointmentId)
        .single();
      
      if (error || !appointment) {
        throw new Error("Failed to fetch appointment details");
      }
      */
      
      // Get any session notes - mocked for now
      const mockNotes = "Patient showed good progress with anxiety management techniques. Continue practicing deep breathing exercises.";
      
      /* This would be the actual implementation once table exists
      const { data: notes } = await supabase
        .from("session_notes")
        .select("content")
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      */
      
      // Create the summary
      const summaryData: SessionSummaryData = {
        appointmentId,
        duration: sessionDuration,
        startTime: mockAppointment.start_time,
        endTime: mockAppointment.end_time,
        participantNames,
        wasRecorded,
        recordingUrl: mockAppointment.recording_url,
        notes: mockNotes
      };
      
      // Store summary in database - mocked for now
      console.log("Storing session summary:", summaryData);
      
      /* This would be the actual implementation once table exists
      await supabase
        .from("session_summaries")
        .insert({
          appointment_id: appointmentId,
          summary_data: summaryData,
          created_at: new Date().toISOString()
        });
      */
      
      // Log the session completion
      console.log("Logging session completion");
      
      /* This would be the actual implementation once user_id is available
      await supabase
        .from("audit_logs")
        .insert({
          user_id: auth.userId, 
          activity_type: "session_completed",
          resource_type: "appointments",
          resource_id: appointmentId,
          metadata: {
            duration_seconds: sessionDuration,
            was_recorded: wasRecorded
          }
        });
      */
      
      // Update state
      setSummary(summaryData);
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      
      toast({
        title: "Session Summary",
        description: "Session summary has been generated",
      });
      
      return summaryData;
    } catch (error) {
      console.error("Error generating session summary:", error);
      toast({
        title: "Error",
        description: "Failed to generate session summary",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast, queryClient]);

  // Fetch an existing summary
  const fetchSummary = useCallback(async (appointmentId: string) => {
    try {
      setIsGenerating(true);
      
      // Mock fetching summary for now
      const mockSummary: SessionSummaryData = {
        appointmentId,
        duration: 3600, // 1 hour
        startTime: new Date(Date.now() - 3600 * 1000).toISOString(),
        endTime: new Date().toISOString(),
        participantNames: ["Patient Name", "Therapist Name"],
        wasRecorded: false,
        notes: "Mock session notes for demonstration"
      };
      
      /* This would be the actual implementation once table exists
      const { data, error } = await supabase
        .from("session_summaries")
        .select("summary_data")
        .eq("appointment_id", appointmentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
        
      if (error) throw error;
      
      return data?.summary_data as SessionSummaryData;
      */
      
      setSummary(mockSummary);
      return mockSummary;
    } catch (error) {
      console.error("Error fetching session summary:", error);
      toast({
        title: "Error",
        description: "Failed to fetch session summary",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [toast]);

  return {
    generateSummary,
    fetchSummary,
    summary,
    isGenerating
  };
}
