import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface SessionParticipant {
  id: string;
  sessionId: string;
  userId: string | null;
  participantName: string | null;
  role: string;
  isActive: boolean;
  joinedAt: Date;
  leftAt: Date | null;
}

interface ParticipantUpdate {
  userId: string;
  sessionId: string;
  isActive: boolean;
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'disconnected';
}

interface UseRealtimeSyncOptions {
  sessionId: string;
  enabled?: boolean;
}

export function useRealtimeSync({ sessionId, enabled = true }: UseRealtimeSyncOptions) {
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [participantStates, setParticipantStates] = useState<Map<string, any>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Subscribe to real-time updates
  const subscribeToUpdates = useCallback(() => {
    if (!enabled || !sessionId) return;

    console.log('🔄 Subscribing to real-time updates for session:', sessionId);

    const realtimeChannel = supabase
      .channel(`session_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'instant_session_participants',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('📥 Participant update received:', payload);
          handleParticipantUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'session_states',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('📥 Session state update received:', payload);
          handleSessionStateUpdate(payload);
        }
      )
      .on(
        'presence',
        { event: 'sync' },
        () => {
          console.log('👥 Presence sync');
          const presenceState = realtimeChannel.presenceState();
          console.log('Current presence state:', presenceState);
        }
      )
      .on(
        'presence',
        { event: 'join' },
        ({ key, newPresences }) => {
          console.log('👋 User joined:', key, newPresences);
        }
      )
      .on(
        'presence',
        { event: 'leave' },
        ({ key, leftPresences }) => {
          console.log('👋 User left:', key, leftPresences);
        }
      )
      .subscribe((status) => {
        console.log('📡 Real-time subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates');
          // Load initial data
          loadInitialData();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time subscription error');
          // Retry connection after delay
          setTimeout(subscribeToUpdates, 5000);
        }
      });

    setChannel(realtimeChannel);

    return () => {
      console.log('🔌 Unsubscribing from real-time updates');
      realtimeChannel.unsubscribe();
    };
  }, [enabled, sessionId]);

  // Handle participant updates
  const handleParticipantUpdate = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setParticipants(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, transformParticipant(newRecord)];
          
        case 'UPDATE':
          return prev.map(p => 
            p.id === newRecord.id ? transformParticipant(newRecord) : p
          );
          
        case 'DELETE':
          return prev.filter(p => p.id !== oldRecord.id);
          
        default:
          return prev;
      }
    });
  }, []);

  // Handle session state updates
  const handleSessionStateUpdate = useCallback((payload: any) => {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'UPDATE' || eventType === 'INSERT') {
      setParticipantStates(prev => {
        const updated = new Map(prev);
        updated.set(newRecord.user_id, {
          connectionState: newRecord.connection_state,
          videoEnabled: newRecord.video_enabled,
          audioEnabled: newRecord.audio_enabled,
          screenSharing: newRecord.screen_sharing,
          lastHeartbeat: new Date(newRecord.last_heartbeat),
          stateData: newRecord.state_data || {}
        });
        return updated;
      });
    }
  }, []);

  // Transform database participant to component format
  const transformParticipant = useCallback((record: any): SessionParticipant => ({
    id: record.id,
    sessionId: record.session_id,
    userId: record.user_id,
    participantName: record.participant_name,
    role: record.role,
    isActive: record.is_active,
    joinedAt: new Date(record.joined_at),
    leftAt: record.left_at ? new Date(record.left_at) : null
  }), []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('instant_session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .order('joined_at', { ascending: true });

      if (participantsError) throw participantsError;

      setParticipants(participantsData.map(transformParticipant));

      // Load session states
      const { data: statesData, error: statesError } = await supabase
        .from('session_states')
        .select('*')
        .eq('session_id', sessionId);

      if (statesError) throw statesError;

      const statesMap = new Map();
      statesData.forEach(state => {
        statesMap.set(state.user_id, {
          connectionState: state.connection_state,
          videoEnabled: state.video_enabled,
          audioEnabled: state.audio_enabled,
          screenSharing: state.screen_sharing,
          lastHeartbeat: new Date(state.last_heartbeat),
          stateData: state.state_data || {}
        });
      });
      setParticipantStates(statesMap);

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, [sessionId, transformParticipant]);

  // Broadcast participant update
  const broadcastParticipantUpdate = useCallback(async (update: ParticipantUpdate) => {
    if (!channel || !isConnected) return;

    try {
      await channel.send({
        type: 'broadcast',
        event: 'participant_update',
        payload: update
      });
    } catch (error) {
      console.error('Error broadcasting participant update:', error);
    }
  }, [channel, isConnected]);

  // Track user presence
  const trackPresence = useCallback(async (userData: any) => {
    if (!channel || !isConnected) return;

    try {
      await channel.track({
        user_id: userData.userId,
        participant_name: userData.name,
        online_at: new Date().toISOString(),
        ...userData
      });
    } catch (error) {
      console.error('Error tracking presence:', error);
    }
  }, [channel, isConnected]);

  // Untrack presence
  const untrackPresence = useCallback(async () => {
    if (!channel) return;

    try {
      await channel.untrack();
    } catch (error) {
      console.error('Error untracking presence:', error);
    }
  }, [channel]);

  // Get participant state
  const getParticipantState = useCallback((userId: string) => {
    return participantStates.get(userId) || null;
  }, [participantStates]);

  // Get active participants count
  const getActiveParticipantsCount = useCallback(() => {
    return participants.filter(p => p.isActive).length;
  }, [participants]);

  // Subscribe to updates on mount
  useEffect(() => {
    const unsubscribe = subscribeToUpdates();
    return unsubscribe;
  }, [subscribeToUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) {
        untrackPresence();
        channel.unsubscribe();
      }
    };
  }, [channel, untrackPresence]);

  return {
    participants,
    participantStates,
    isConnected,
    broadcastParticipantUpdate,
    trackPresence,
    untrackPresence,
    getParticipantState,
    getActiveParticipantsCount,
    loadInitialData
  };
}