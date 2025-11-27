import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface ParticipantUpdate {
  id: string;
  session_id: string;
  user_id: string | null;
  participant_name: string | null;
  is_active: boolean;
  joined_at: string;
  left_at: string | null;
}

interface SessionUpdate {
  id: string;
  session_name: string;
  is_active: boolean;
  session_status: string;
  updated_at: string;
}

interface UseRealtimeSessionUpdatesProps {
  sessionId: string;
  onParticipantUpdate?: (update: ParticipantUpdate, type: 'insert' | 'update' | 'delete') => void;
  onSessionUpdate?: (update: SessionUpdate, type: 'update') => void;
}

export const useRealtimeSessionUpdates = ({
  sessionId,
  onParticipantUpdate,
  onSessionUpdate
}: UseRealtimeSessionUpdatesProps) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const subscribe = useCallback(() => {
    if (!sessionId || isSubscribed) return;

    try {
      console.log('🔄 Setting up realtime subscriptions for session:', sessionId);
      
      const sessionChannel = supabase.channel(`session-${sessionId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'instant_session_participants',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            console.log('📡 Participant update received:', payload);
            
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
              onParticipantUpdate?.(
                payload.new as ParticipantUpdate || payload.old as ParticipantUpdate,
                payload.eventType.toLowerCase() as 'insert' | 'update' | 'delete'
              );
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'instant_sessions',
            filter: `id=eq.${sessionId}`
          },
          (payload) => {
            console.log('📡 Session update received:', payload);
            
            if (payload.new) {
              onSessionUpdate?.(payload.new as SessionUpdate, 'update');
            }
          }
        )
        .subscribe((status) => {
          console.log('📡 Realtime subscription status:', status);
          
          if (status === 'SUBSCRIBED') {
            setIsSubscribed(true);
            setError(null);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            setError(`Subscription failed: ${status}`);
            setIsSubscribed(false);
          }
        });

      setChannel(sessionChannel);
    } catch (err) {
      console.error('❌ Failed to setup realtime subscription:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [sessionId, isSubscribed, onParticipantUpdate, onSessionUpdate]);

  const unsubscribe = useCallback(() => {
    if (channel) {
      console.log('🛑 Unsubscribing from realtime updates');
      supabase.removeChannel(channel);
      setChannel(null);
      setIsSubscribed(false);
    }
  }, [channel]);

  useEffect(() => {
    subscribe();
    
    return () => {
      unsubscribe();
    };
  }, [subscribe, unsubscribe]);

  return {
    isSubscribed,
    error,
    subscribe,
    unsubscribe
  };
};