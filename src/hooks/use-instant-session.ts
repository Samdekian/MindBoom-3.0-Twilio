
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InstantSessionDetails {
  id: string;
  session_name: string;
  session_token: string;
  therapist_id: string;
  expires_at: string;
  is_active: boolean;
  waiting_room_enabled: boolean;
  recording_enabled: boolean;
  max_participants: number;
  session_status: string;
  session_type: string;
  sfu_room_id?: string;
  host_user_id?: string;
  created_at: string;
  updated_at: string;
}

export const useInstantSession = (sessionId: string) => {
  const [sessionDetails, setSessionDetails] = useState<InstantSessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId || sessionId.trim() === '' || sessionId === 'mock-appointment-id') {
        setSessionDetails(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('instant_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('Session not found');
          } else {
            setError(fetchError.message);
          }
          setSessionDetails(null);
        } else {
          setSessionDetails(data);
        }
      } catch (err) {
        console.error('Error fetching session details:', err);
        setError('Failed to load session details');
        setSessionDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();

    // Set up real-time subscription for session updates
    if (sessionId && sessionId.trim() !== '' && sessionId !== 'mock-appointment-id') {
      const channel = supabase
        .channel(`session-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'instant_sessions',
            filter: `id=eq.${sessionId}`,
          },
          (payload) => {
            setSessionDetails(payload.new as InstantSessionDetails);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [sessionId]);

  const updateSession = async (updates: Partial<InstantSessionDetails>) => {
    if (!sessionId || !sessionDetails) return;

    try {
      const { error: updateError } = await supabase
        .from('instant_sessions')
        .update(updates)
        .eq('id', sessionId);

      if (updateError) throw updateError;

      setSessionDetails(prev => prev ? { ...prev, ...updates } : null);
    } catch (err) {
      console.error('Error updating session:', err);
      setError('Failed to update session');
    }
  };

  return {
    sessionDetails,
    isLoading,
    error,
    updateSession,
  };
};
