
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PatientData, TreatmentPlan, TreatmentGoal } from '@/types/video-conference/types';
import { SessionNote } from '@/types/session/note';

interface UsePatientDetailResult {
  patient: PatientData | null;
  sessions: any[];
  notes: SessionNote[];
  treatmentPlan: TreatmentPlan | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const usePatientDetail = (patientId: string): UsePatientDetailResult => {
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [notes, setNotes] = useState<SessionNote[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Update the transformNoteData function to match SessionNote interface
  const transformNoteData = (note: any): SessionNote => {
    return {
      id: note.id,
      sessionId: note.session_id || note.sessionId,
      content: note.content || '',
      createdAt: note.created_at || note.createdAt,
      updatedAt: note.updated_at || note.updatedAt,
      notes: note.notes || '',
      patientId: note.patient_id || note.patientId,
      therapistId: note.therapist_id || note.therapistId,
      userId: note.user_id || note.userId,
      appointmentId: note.appointment_id || note.appointmentId || note.id,
      date: note.date || note.created_at || new Date().toISOString()
    };
  };

  // Load patient details
  const fetchPatientDetails = async () => {
    if (!patientId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch patient data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', patientId)
        .single();

      if (profileError) {
        throw new Error(`Failed to fetch patient profile: ${profileError.message}`);
      }

      // Fetch appointments/sessions data
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .order('start_time', { ascending: false })
        .limit(10);

      if (sessionsError) {
        console.error("Error fetching sessions:", sessionsError);
      }

      // Fetch patient notes
      const { data: notesData, error: notesError } = await supabase
        .from('patient_notes')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (notesError) {
        console.error("Error fetching notes:", notesError);
      }

      // Fetch treatment plans
      const { data: treatmentPlanData, error: treatmentError } = await supabase
        .from('treatment_plans')
        .select(`
          *,
          treatment_goals (*)
        `)
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (treatmentError) {
        console.error("Error fetching treatment plan:", treatmentError);
      }

      // Get last session date
      const lastSession = sessionsData?.[0];
      const lastSessionDate = lastSession?.start_time || null;

      // Get upcoming session date
      const { data: upcomingSession } = await supabase
        .from('appointments')
        .select('start_time')
        .eq('patient_id', patientId)
        .gt('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(1)
        .maybeSingle();

      // Transform patient data
      const patient: PatientData = {
        id: profileData.id,
        name: profileData.full_name || 'Unknown Patient',
        fullName: profileData.full_name || 'Unknown Patient',
        email: profileData.email || '',
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
        status: profileData.status || 'active',
        lastSessionDate: lastSessionDate,
        upcomingSessionDate: upcomingSession?.start_time || null,
        moodTrend: 'stable', // This could be calculated from session notes or mood tracking data
        activeTreatmentPlan: !!treatmentPlanData
      };
      
      // Transform sessions data
      const sessions = sessionsData?.map(session => ({
        id: session.id,
        date: session.start_time,
        duration: session.end_time ? 
          Math.round((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60)) : 
          50,
        notes: session.session_notes || session.description || ''
      })) || [];
      
      // Transform notes data
      const notes: SessionNote[] = notesData?.map(note => transformNoteData(note)) || [];
      
      // Transform treatment plan data
      let treatmentPlan: TreatmentPlan | null = null;
      if (treatmentPlanData) {
        treatmentPlan = {
          id: treatmentPlanData.id,
          title: treatmentPlanData.title,
          patientId: treatmentPlanData.patient_id,
          startDate: treatmentPlanData.start_date,
          status: treatmentPlanData.status,
          createdAt: treatmentPlanData.created_at,
          updatedAt: treatmentPlanData.updated_at,
          goals: treatmentPlanData.treatment_goals?.map((goal: any) => ({
            id: goal.id,
            description: goal.title,
            status: goal.status,
            progress: goal.progress_percentage || 0
          })) || []
        };
      }
      
      setPatient(patient);
      setSessions(sessions);
      setNotes(notes);
      setTreatmentPlan(treatmentPlan);
    } catch (error: any) {
      console.error("Error fetching patient details:", error);
      setError(error.message || "Failed to load patient details");
      toast({
        title: "Error",
        description: "Could not load patient details",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);
  
  return {
    patient,
    sessions,
    notes,
    treatmentPlan,
    isLoading,
    error,
    refresh: fetchPatientDetails
  };
};
