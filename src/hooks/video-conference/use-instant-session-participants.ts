import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InstantSessionParticipant {
  id: string;
  session_id: string;
  user_id: string | null;
  participant_name: string | null;
  role: string;
  joined_at: string;
  left_at: string | null;
  is_active: boolean;
}

export const useInstantSessionParticipants = (sessionId: string | null, enabled: boolean = true) => {
  const [participants, setParticipants] = useState<InstantSessionParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const participantIdRef = useRef<string | null>(null);
  const isCleaningUpRef = useRef(false);

  // Enhanced participant fetching with immediate cleanup of stale entries
  const fetchParticipants = useCallback(async () => {
    if (!sessionId || sessionId.trim() === '' || !enabled) {
      setParticipants([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 Fetching participants for session:', sessionId);
      
      // First, cleanup stale participants (inactive for more than 2 minutes)
      const staleThreshold = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      await supabase
        .from('instant_session_participants')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .lt('joined_at', staleThreshold);

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
        console.log('✅ Found active participants:', data);
        setParticipants(data || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    } finally {
      setLoading(false);
    }
  }, [sessionId, enabled]);

  // Enhanced participant addition with duplicate prevention
  const addParticipant = useCallback(async (participantName: string, userId?: string, role?: string) => {
    if (!sessionId || !enabled) return;

    try {
      console.log('👤 Adding participant:', { participantName, userId, role });

      // Check for existing active participant
      const { data: existing } = await supabase
        .from('instant_session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .or(userId ? `user_id.eq.${userId}` : `participant_name.eq.${participantName}`)
        .single();

      if (existing) {
        console.log('📝 Participant already exists, updating their status');
        participantIdRef.current = existing.id;
        await fetchParticipants();
        return;
      }

      // Clean up any previous inactive records for this user/name
      if (userId) {
        await supabase
          .from('instant_session_participants')
          .update({ is_active: false, left_at: new Date().toISOString() })
          .eq('session_id', sessionId)
          .eq('user_id', userId)
          .eq('is_active', false);
      }

      const { data, error } = await supabase
        .from('instant_session_participants')
        .insert({
          session_id: sessionId,
          user_id: userId || null,
          participant_name: participantName,
          role: role || 'participant',
          is_active: true
        })
        .select('id')
        .single();

      if (error) throw error;

      if (data) {
        participantIdRef.current = data.id;
        console.log('✅ Participant added successfully:', data.id);
      }

      await fetchParticipants();
    } catch (error) {
      console.error('❌ Error adding participant:', error);
      toast({
        title: 'Error',
        description: 'Failed to join session',
        variant: 'destructive',
      });
    }
  }, [sessionId, enabled, toast, fetchParticipants]);

  // Immediate participant removal
  const removeParticipant = useCallback(async (participantId: string) => {
    try {
      console.log('🚪 Removing participant:', participantId);
      
      const { error } = await supabase
        .from('instant_session_participants')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('id', participantId);

      if (error) throw error;

      console.log('✅ Participant removed successfully');
      await fetchParticipants();
    } catch (error) {
      console.error('❌ Error removing participant:', error);
    }
  }, [fetchParticipants]);

  // Enhanced cleanup for current participant
  const cleanupCurrentParticipant = useCallback(async () => {
    if (isCleaningUpRef.current || !participantIdRef.current) return;
    
    isCleaningUpRef.current = true;
    
    try {
      console.log('🧹 Cleaning up current participant:', participantIdRef.current);
      
      await supabase
        .from('instant_session_participants')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('id', participantIdRef.current);
        
      participantIdRef.current = null;
      console.log('✅ Current participant cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up participant:', error);
    } finally {
      isCleaningUpRef.current = false;
    }
  }, []);

  // Enhanced heartbeat with proper error handling
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(async () => {
      if (participantIdRef.current && sessionId && enabled) {
        try {
          await supabase
            .from('instant_session_participants')
            .update({ joined_at: new Date().toISOString() })
            .eq('id', participantIdRef.current)
            .eq('is_active', true);
            
          console.log('💓 Heartbeat sent for participant:', participantIdRef.current);
        } catch (error) {
          console.error('💔 Heartbeat failed:', error);
        }
      }
    }, 15000); // Send heartbeat every 15 seconds
  }, [sessionId, enabled]);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
      console.log('💔 Heartbeat stopped');
    }
  }, []);

  // Enhanced session management functions
  const joinSession = useCallback(async () => {
    console.log('🚀 Joining instant session:', sessionId);
    if (!sessionId || !enabled) return;
    
    try {
      // Check if session exists and is active
      const { data: session } = await supabase
        .from('instant_sessions')
        .select('max_participants, is_active, expires_at')
        .eq('id', sessionId)
        .single();
        
      if (!session || !session.is_active || new Date(session.expires_at) < new Date()) {
        throw new Error('Session is not available');
      }
      
      // Check current participant count
      const { count } = await supabase
        .from('instant_session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('is_active', true);
        
      if (count && count >= session.max_participants) {
        throw new Error('Session is full');
      }
      
      console.log('✅ Session is available for joining');
    } catch (error) {
      console.error('❌ Cannot join session:', error);
      throw error;
    }
  }, [sessionId, enabled]);
  
  const leaveSession = useCallback(async () => {
    console.log('👋 Leaving instant session:', sessionId);
    await cleanupCurrentParticipant();
    stopHeartbeat();
  }, [sessionId, cleanupCurrentParticipant, stopHeartbeat]);

  // Enhanced real-time subscription with better error handling
  useEffect(() => {
    if (!sessionId || sessionId.trim() === '' || !enabled) {
      setParticipants([]);
      return;
    }

    fetchParticipants();

    const channel = supabase
      .channel(`instant-session-participants-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instant_session_participants',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          console.log('📡 Real-time participant change:', payload);
          // Slight delay to allow database consistency
          setTimeout(() => {
            fetchParticipants();
          }, 500);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    // Enhanced cleanup listeners
    const handleBeforeUnload = () => {
      console.log('🚪 Page unloading, cleaning up...');
      cleanupCurrentParticipant();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ Page hidden, cleaning up...');
        cleanupCurrentParticipant();
      }
    };

    // Add focus/blur listeners for better cleanup
    const handleWindowBlur = () => {
      console.log('🔄 Window blur, stopping heartbeat...');
      stopHeartbeat();
    };

    const handleWindowFocus = () => {
      console.log('🔄 Window focus, restarting heartbeat...');
      if (participantIdRef.current) {
        startHeartbeat();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      console.log('🧹 Cleaning up participant hook...');
      supabase.removeChannel(channel);
      stopHeartbeat();
      cleanupCurrentParticipant();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [sessionId, enabled, fetchParticipants, cleanupCurrentParticipant, stopHeartbeat, startHeartbeat]);

  // Calculate session status
  const sessionFull = participants.length >= 10; // Max 10 participants
  const isSessionActive = participants.length > 0;
  
  return {
    participants,
    loading,
    addParticipant,
    removeParticipant,
    refetch: fetchParticipants,
    startHeartbeat,
    stopHeartbeat,
    cleanupCurrentParticipant,
    joinSession,
    leaveSession,
    sessionFull,
    isSessionActive,
    participantCount: participants.length,
    currentParticipantId: participantIdRef.current,
  };
};