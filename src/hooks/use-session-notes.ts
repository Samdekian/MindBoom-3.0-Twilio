
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface SessionNote {
  id: string;
  appointment_id: string;
  therapist_id: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export const useSessionNotes = (appointmentId: string) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const { data: sessionNotes, isLoading, error } = useQuery({
    queryKey: ['session-notes', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;

      const { data, error } = await supabase
        .from('session_notes')
        .select('*')
        .eq('appointment_id', appointmentId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching session notes:", error);
        throw error;
      }

      return data;
    },
    enabled: !!appointmentId,
  });

  useEffect(() => {
    if (sessionNotes?.notes) {
      setNotes(sessionNotes.notes);
    }
  }, [sessionNotes]);

  useEffect(() => {
    setHasChanges(notes !== (sessionNotes?.notes || ''));
  }, [notes, sessionNotes?.notes]);

  const saveNotesMutation = useMutation({
    mutationFn: async (noteContent: string) => {
      if (!appointmentId || !user?.id) return;

      const { data, error } = await supabase
        .from('session_notes')
        .upsert({
          appointment_id: appointmentId,
          therapist_id: user.id,
          notes: noteContent,
        })
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-notes'] });
      setHasChanges(false);
      setLastSavedAt(new Date());
      toast({
        title: "Notes Saved",
        description: "Session notes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save session notes.",
        variant: "destructive",
      });
    },
  });

  const saveNotes = () => {
    saveNotesMutation.mutate(notes);
  };

  const toggleAutoSave = () => {
    setAutoSaveEnabled(prev => !prev);
  };

  return {
    notes,
    setNotes,
    isLoading,
    isSaving: saveNotesMutation.isPending,
    hasChanges,
    saveNotes,
    autoSaveEnabled,
    toggleAutoSave,
    lastSavedAt,
    error,
  };
};
