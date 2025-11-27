import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionState {
  id: string;
  sessionId: string;
  userId: string;
  stateData: Record<string, any>;
  connectionState: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenSharing: boolean;
  lastHeartbeat: Date;
}

interface UseSessionPersistenceOptions {
  sessionId: string;
  userId: string;
  heartbeatInterval?: number;
  maxReconnectAttempts?: number;
}

export function useSessionPersistence({
  sessionId,
  userId,
  heartbeatInterval = 30000, // 30 seconds
  maxReconnectAttempts = 5
}: UseSessionPersistenceOptions) {
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [isRecovering, setIsRecovering] = useState(false);
  const { toast } = useToast();
  
  const heartbeatRef = useRef<NodeJS.Timeout>();
  const reconnectRef = useRef<NodeJS.Timeout>();

  // Initialize or recover session state
  const initializeSession = useCallback(async () => {
    try {
      // Try to recover existing session state
      const { data: existingState, error } = await supabase
        .from('session_states')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching session state:', error);
        return;
      }

      if (existingState) {
        // Recover from existing state
        setIsRecovering(true);
        const recoveredState: SessionState = {
          id: existingState.id,
          sessionId: existingState.session_id,
          userId: existingState.user_id,
          stateData: existingState.state_data || {},
          connectionState: 'reconnecting',
          videoEnabled: existingState.video_enabled || false,
          audioEnabled: existingState.audio_enabled || false,
          screenSharing: existingState.screen_sharing || false,
          lastHeartbeat: new Date(existingState.last_heartbeat)
        };

        setSessionState(recoveredState);
        
        toast({
          title: "Session Recovered",
          description: "Restoring your previous session state...",
        });

        // Update to connected state
        setTimeout(() => {
          updateConnectionState('connected');
          setIsRecovering(false);
        }, 1000);
      } else {
        // Create new session state
        await createSessionState();
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      logError('session_initialization', error as Error);
    }
  }, [sessionId, userId]);

  // Create new session state
  const createSessionState = useCallback(async () => {
    try {
      const newState = {
        session_id: sessionId,
        user_id: userId,
        state_data: {},
        connection_state: 'connecting',
        video_enabled: false,
        audio_enabled: false,
        screen_sharing: false,
        last_heartbeat: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('session_states')
        .insert(newState)
        .select()
        .single();

      if (error) throw error;

      const sessionState: SessionState = {
        id: data.id,
        sessionId: data.session_id,
        userId: data.user_id,
        stateData: data.state_data || {},
        connectionState: 'connecting',
        videoEnabled: data.video_enabled,
        audioEnabled: data.audio_enabled,
        screenSharing: data.screen_sharing,
        lastHeartbeat: new Date(data.last_heartbeat)
      };

      setSessionState(sessionState);
    } catch (error) {
      console.error('Error creating session state:', error);
      logError('session_creation', error as Error);
    }
  }, [sessionId, userId]);

  // Update connection state
  const updateConnectionState = useCallback(async (state: SessionState['connectionState']) => {
    if (!sessionState) return;

    try {
      const { error } = await supabase
        .from('session_states')
        .update({
          connection_state: state,
          last_heartbeat: new Date().toISOString()
        })
        .eq('id', sessionState.id);

      if (error) throw error;

      setSessionState(prev => prev ? { ...prev, connectionState: state, lastHeartbeat: new Date() } : null);
      setIsConnected(state === 'connected');

      if (state === 'connected') {
        setReconnectAttempt(0);
        startHeartbeat();
      }
    } catch (error) {
      console.error('Error updating connection state:', error);
      logError('connection_state_update', error as Error);
    }
  }, [sessionState]);

  // Update session state
  const updateSessionState = useCallback(async (updates: Partial<Pick<SessionState, 'videoEnabled' | 'audioEnabled' | 'screenSharing' | 'stateData'>>) => {
    if (!sessionState) return;

    try {
      const updateData: any = {
        last_heartbeat: new Date().toISOString()
      };

      if (updates.videoEnabled !== undefined) updateData.video_enabled = updates.videoEnabled;
      if (updates.audioEnabled !== undefined) updateData.audio_enabled = updates.audioEnabled;
      if (updates.screenSharing !== undefined) updateData.screen_sharing = updates.screenSharing;
      if (updates.stateData !== undefined) updateData.state_data = updates.stateData;

      const { error } = await supabase
        .from('session_states')
        .update(updateData)
        .eq('id', sessionState.id);

      if (error) throw error;

      setSessionState(prev => prev ? { ...prev, ...updates, lastHeartbeat: new Date() } : null);
    } catch (error) {
      console.error('Error updating session state:', error);
      logError('session_state_update', error as Error);
    }
  }, [sessionState]);

  // Start heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(async () => {
      if (!sessionState) return;

      try {
        const { error } = await supabase
          .from('session_states')
          .update({ last_heartbeat: new Date().toISOString() })
          .eq('id', sessionState.id);

        if (error) {
          console.error('Heartbeat error:', error);
          // Trigger reconnection if heartbeat fails
          handleConnectionLoss();
        }
      } catch (error) {
        console.error('Heartbeat error:', error);
        handleConnectionLoss();
      }
    }, heartbeatInterval);
  }, [sessionState, heartbeatInterval]);

  // Handle connection loss
  const handleConnectionLoss = useCallback(async () => {
    setIsConnected(false);
    await updateConnectionState('reconnecting');

    if (reconnectAttempt < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempt), 30000); // Exponential backoff
      
      reconnectRef.current = setTimeout(async () => {
        setReconnectAttempt(prev => prev + 1);
        
        toast({
          title: "Reconnecting...",
          description: `Attempt ${reconnectAttempt + 1} of ${maxReconnectAttempts}`,
        });

        try {
          // Test connection
          const { error } = await supabase
            .from('session_states')
            .select('id')
            .eq('id', sessionState?.id)
            .limit(1);

          if (!error) {
            await updateConnectionState('connected');
            toast({
              title: "Reconnected",
              description: "Successfully restored connection",
            });
          } else {
            handleConnectionLoss();
          }
        } catch (error) {
          handleConnectionLoss();
        }
      }, delay);
    } else {
      await updateConnectionState('disconnected');
      toast({
        title: "Connection Failed",
        description: "Unable to restore connection. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [reconnectAttempt, maxReconnectAttempts, sessionState, updateConnectionState]);

  // Log errors
  const logError = useCallback(async (errorType: string, error: Error) => {
    try {
      await supabase
        .from('session_errors')
        .insert({
          session_id: sessionId,
          user_id: userId,
          error_type: errorType,
          error_message: error.message,
          error_context: {
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        });
    } catch (logError) {
      console.error('Error logging session error:', logError);
    }
  }, [sessionId, userId]);

  // Cleanup session
  const cleanupSession = useCallback(async () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
    if (reconnectRef.current) {
      clearTimeout(reconnectRef.current);
    }

    if (sessionState) {
      try {
        await supabase
          .from('session_states')
          .update({
            connection_state: 'disconnected',
            last_heartbeat: new Date().toISOString()
          })
          .eq('id', sessionState.id);
      } catch (error) {
        console.error('Error cleaning up session:', error);
      }
    }
  }, [sessionState]);

  // Initialize on mount
  useEffect(() => {
    initializeSession();
    return () => {
      cleanupSession();
    };
  }, [initializeSession]);

  // Handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, reduce heartbeat frequency
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
        }
      } else {
        // Page is visible, resume normal heartbeat
        if (isConnected) {
          startHeartbeat();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isConnected, startHeartbeat]);

  return {
    sessionState,
    isConnected,
    isRecovering,
    reconnectAttempt,
    updateConnectionState,
    updateSessionState,
    logError,
    cleanupSession
  };
}