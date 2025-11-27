import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface InstantSessionDetails {
  id: string;
  session_name: string;
  session_token: string;
  therapist_id: string;
  is_active: boolean;
  recording_enabled: boolean;
  waiting_room_enabled: boolean;
  expires_at: string;
  max_participants: number;
}

export function useInstantSessionByToken(token: string) {
  const [sessionDetails, setSessionDetails] = useState<InstantSessionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionByToken = async () => {
      console.log('🔍 Fetching session details for token:', token);
      
      if (!token) {
        console.error('❌ Session token is missing');
        setError("Session token is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log('📡 Querying instant_sessions table by token...');
        
        const { data, error: sessionError } = await supabase
          .from('instant_sessions')
          .select('id, session_name, session_token, therapist_id, is_active, recording_enabled, waiting_room_enabled, expires_at, max_participants')
          .eq('session_token', token)
          .eq('is_active', true)
          .single();

        console.log('📊 Query result:', { data, error: sessionError });

        if (sessionError) {
          console.error('❌ Session query error:', sessionError);
          if (sessionError.code === 'PGRST116') {
            setError('Session not found or expired');
          } else {
            throw sessionError;
          }
          return;
        }

        // Check if session is still valid
        const expiresAt = new Date(data.expires_at);
        const now = new Date();
        console.log('⏰ Session expires at:', expiresAt, 'Current time:', now);
        
        if (expiresAt < now) {
          console.error('❌ Session has expired');
          setError('Session has expired');
          return;
        }

        console.log('✅ Session loaded successfully:', data);
        setSessionDetails(data);
      } catch (error) {
        console.error('❌ Error fetching session details:', error);
        setError('Failed to load session details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionByToken();
  }, [token]);

  return { sessionDetails, isLoading, error };
}