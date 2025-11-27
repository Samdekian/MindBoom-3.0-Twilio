
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useOptimizedRealtime } from '../useOptimizedRealtime';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate';
  content: any;
  senderId: string;
}

export const useRealtimeSignaling = (sessionId: string) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const signalHandlerRef = useRef<((message: SignalingMessage) => void) | null>(null);
  const {
    isConnected,
    isDegraded,
    on: onSignaling,
    send: sendSignaling,
    connect: connectSignaling
  } = useOptimizedRealtime(`session-${sessionId}`, {
    priority: 'high',
    gracefulDegradation: true
  });

  const setupSignalingChannel = useCallback(() => {
    if (!sessionId || !user?.id) return;

    console.log(`🔗 [Signaling] Setting up optimized signaling for session: ${sessionId}`);
    
    // Set up message handler
    onSignaling('signaling', (payload: any) => {
      console.log('🔗 [Signaling] Message received:', payload);
      if (signalHandlerRef.current && payload.payload) {
        signalHandlerRef.current(payload.payload);
      }
    });

    return () => {
      console.log('🔗 [Signaling] Cleaning up signaling channel');
    };
  }, [sessionId, user?.id, onSignaling]);

  useEffect(() => {
    const cleanup = setupSignalingChannel();
    return cleanup;
  }, [setupSignalingChannel]);

  const sendSignal = async (type: 'offer' | 'answer' | 'ice-candidate', content: any): Promise<boolean> => {
    const message: SignalingMessage = {
      type,
      content,
      senderId: user?.id || '',
    };
    
    return sendSignaling('signaling', message);
  };

  const registerSignalHandler = (handler: (message: SignalingMessage) => void) => {
    signalHandlerRef.current = handler;
  };

  return {
    isConnected,
    sendSignal,
    registerSignalHandler,
    state: { connected: isConnected, degraded: isDegraded },
  };
};
