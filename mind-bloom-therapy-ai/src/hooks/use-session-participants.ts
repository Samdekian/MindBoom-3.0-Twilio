
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SessionParticipant {
  id: string;
  session_id: string;
  user_id: string | null;
  participant_name: string | null;
  role: string;
  joined_at: string;
  left_at: string | null;
  is_active: boolean;
}

export const useSessionParticipants = (sessionId: string | null) => {
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchParticipants = useCallback(async () => {
    // Guard against invalid sessionId
    if (!sessionId || sessionId.trim() === '' || sessionId === 'mock-appointment-id') {
      setParticipants([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('instant_session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) {
        console.error('Error fetching participants:', error);
        setParticipants([]);
      } else {
        setParticipants(data || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const admitParticipant = useCallback(async (participantId: string) => {
    if (!sessionId) return;

    try {
      // Update the instant session status to active when first participant is admitted
      const { error: sessionError } = await supabase
        .from('instant_sessions')
        .update({ session_status: 'active' })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      toast({
        title: 'Participant Admitted',
        description: 'The participant has been admitted to the session.',
      });

      // Refresh participants list
      await fetchParticipants();
    } catch (error) {
      console.error('Error admitting participant:', error);
      toast({
        title: 'Error',
        description: 'Failed to admit participant',
        variant: 'destructive',
      });
    }
  }, [sessionId, toast, fetchParticipants]);

  const removeParticipant = useCallback(async (participantId: string) => {
    try {
      const { error } = await supabase
        .from('instant_session_participants')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('id', participantId);

      if (error) throw error;

      toast({
        title: 'Participant Removed',
        description: 'The participant has been removed from the session.',
      });

      await fetchParticipants();
    } catch (error) {
      console.error('Error removing participant:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove participant',
        variant: 'destructive',
      });
    }
  }, [toast, fetchParticipants]);

  // Set up realtime subscription only for valid sessionIds
  useEffect(() => {
    if (!sessionId || sessionId.trim() === '' || sessionId === 'mock-appointment-id') {
      setParticipants([]);
      return;
    }

    fetchParticipants();

    const channel = supabase
      .channel(`session-participants-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instant_session_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, fetchParticipants]);

  return {
    participants,
    loading,
    admitParticipant,
    removeParticipant,
    refetch: fetchParticipants,
  };
};
