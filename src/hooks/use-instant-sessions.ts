import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';

export interface InstantSession {
  id: string;
  therapist_id: string;
  session_token: string;
  session_name: string;
  max_participants: number;
  expires_at: string;
  is_active: boolean;
  recording_enabled: boolean;
  waiting_room_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateInstantSessionData {
  session_name: string;
  max_participants?: number;
  duration_hours?: number;
  recording_enabled?: boolean;
  waiting_room_enabled?: boolean;
}

export const useInstantSessions = () => {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<InstantSession[]>([]);
  const { toast } = useToast();

  const createInstantSession = useCallback(async (data: CreateInstantSessionData): Promise<InstantSession | null> => {
    setLoading(true);
    try {
      console.log('🚀 Creating instant session with data:', data);
      
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('❌ User authentication failed:', userError);
        throw new Error('User not authenticated');
      }
      console.log('✅ User authenticated:', user.id);

      const sessionToken = nanoid(12);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (data.duration_hours || 2));

      console.log('📅 Session expires at:', expiresAt.toISOString());

      // Make session name unique by appending a short ID
      const uniqueSessionName = `${data.session_name}-${nanoid(6)}`;
      console.log('📝 Unique session name:', uniqueSessionName);

      const { data: session, error } = await supabase
        .from('instant_sessions')
        .insert({
          therapist_id: user.id,
          session_token: sessionToken,
          session_name: uniqueSessionName,
          max_participants: data.max_participants || 2,
          expires_at: expiresAt.toISOString(),
          recording_enabled: data.recording_enabled || false,
          waiting_room_enabled: data.waiting_room_enabled || true,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Database error creating session:', error);
        throw new Error(`Failed to create session: ${error.message}`);
      }

      console.log('✅ Session created successfully:', session);

      toast({
        title: 'Session Created',
        description: 'Instant session created successfully!',
      });

      return session as InstantSession;
    } catch (error) {
      console.error('❌ Error creating instant session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create instant session';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error; // Re-throw so the component can handle it
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const getActiveSessionsByTherapist = useCallback(async (therapistId: string) => {
    try {
      const { data, error } = await supabase
        .from('instant_sessions')
        .select('*')
        .eq('therapist_id', therapistId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSessions(data as InstantSession[]);
      return data as InstantSession[];
    } catch (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }
  }, []);

  const getSessionByToken = useCallback(async (token: string) => {
    try {
      const { data, error } = await supabase
        .from('instant_sessions')
        .select('*')
        .eq('session_token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) throw error;
      return data as InstantSession;
    } catch (error) {
      console.error('Error fetching session by token:', error);
      return null;
    }
  }, []);

  const endSession = useCallback(async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('instant_sessions')
        .update({ 
          is_active: false
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Also update all participants as inactive
      await supabase
        .from('instant_session_participants')
        .update({ 
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      toast({
        title: 'Session Ended',
        description: 'The session has been ended successfully.',
      });

      // Refresh sessions list
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await getActiveSessionsByTherapist(user.user.id);
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: 'Error',
        description: 'Failed to end session',
        variant: 'destructive',
      });
    }
  }, [toast, getActiveSessionsByTherapist]);

  const joinSession = useCallback(async (sessionId: string, participantName?: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('instant_session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.user?.id || null,
          participant_name: participantName || user.user?.email || 'Anonymous',
          role: 'participant'
        });

      if (error) throw error;

      toast({
        title: 'Joined Session',
        description: 'Successfully joined the session!',
      });
    } catch (error) {
      console.error('Error joining session:', error);
      toast({
        title: 'Error',
        description: 'Failed to join session',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const generateShareableLink = useCallback((sessionToken: string) => {
    const baseUrl = window.location.origin;
    // Find session ID from token to create direct video conference link
    const session = sessions.find(s => s.session_token === sessionToken);
    if (session) {
      return `${baseUrl}/video-conference/${session.id}?join=true`;
    }
    // Fallback to token-based link
    return `${baseUrl}/session/instant/${sessionToken}`;
  }, [sessions]);

  return {
    loading,
    sessions,
    createInstantSession,
    getActiveSessionsByTherapist,
    getSessionByToken,
    endSession,
    joinSession,
    generateShareableLink,
  };
};
