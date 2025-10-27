import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { SimpleConnectionManager } from '@/lib/connection/SimpleConnectionManager';

interface RealtimeOptions {
  enabled?: boolean;
  retryOnFailure?: boolean;
  gracefulDegradation?: boolean;
}

interface RealtimeState {
  isConnected: boolean;
  isConnecting: boolean;
  isDegraded: boolean;
  error: string | null;
  retryCount: number;
}

/**
 * Simplified realtime hook that delays connection until auth is ready
 * Replaces the complex useOptimizedRealtime
 */
export const useSimplifiedRealtime = (
  channelId: string,
  options: RealtimeOptions = {}
) => {
  const { isAuthenticated, isInitialized, loading } = useAuthRBAC();
  const connectionManager = SimpleConnectionManager.getInstance();
  
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isConnecting: false,
    isDegraded: false,
    error: null,
    retryCount: 0,
  });

  const channelRef = useRef<any>(null);
  const eventHandlers = useRef<Map<string, Function>>(new Map());
  const mountedRef = useRef(true);

  const {
    enabled = true,
    retryOnFailure = true,
    gracefulDegradation = true,
  } = options;

  // Connect function
  const connect = useCallback(async () => {
    if (!enabled || !channelId || !isAuthenticated || !isInitialized || loading) {
      console.log('[SimplifiedRealtime] Skipping connection - conditions not met:', {
        enabled,
        channelId: !!channelId,
        isAuthenticated,
        isInitialized,
        loading,
      });
      return;
    }

    if (state.isConnecting || state.isConnected) {
      console.log('[SimplifiedRealtime] Already connecting or connected');
      return;
    }

    console.log(`[SimplifiedRealtime] Connecting to channel: ${channelId}`);
    
    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const channel = await connectionManager.getConnection(channelId);
      
      if (!mountedRef.current) return;

      // Set up event handlers
      eventHandlers.current.forEach((handler, event) => {
        channel.on(event, handler);
      });

      // Subscribe to channel
      const subscribeResult = channel.subscribe((status: string) => {
        if (!mountedRef.current) return;

        console.log(`[SimplifiedRealtime] Channel ${channelId} status: ${status}`);
        
        setState(prev => {
          const newState = {
            ...prev,
            isConnecting: false,
            isConnected: status === 'SUBSCRIBED',
            isDegraded: status === 'CHANNEL_ERROR' && gracefulDegradation,
            error: status === 'CHANNEL_ERROR' && !gracefulDegradation ? 'Connection failed' : null,
          };

          // Handle retry logic
          if (status === 'CHANNEL_ERROR' && retryOnFailure && prev.retryCount < 3) {
            console.log(`[SimplifiedRealtime] Retrying connection (${prev.retryCount + 1}/3)`);
            setTimeout(() => {
              setState(current => ({ ...current, retryCount: current.retryCount + 1 }));
              connect();
            }, 1000 * (prev.retryCount + 1));
          }

          return newState;
        });
      });

      channelRef.current = channel;
      
      console.log(`[SimplifiedRealtime] Connection initiated for: ${channelId}`);

    } catch (error) {
      console.error(`[SimplifiedRealtime] Connection failed for ${channelId}:`, error);
      
      if (!mountedRef.current) return;

      setState(prev => ({
        ...prev,
        isConnecting: false,
        isConnected: false,
        isDegraded: gracefulDegradation,
        error: gracefulDegradation ? null : (error as Error).message,
      }));

      // Handle Cloudflare errors specifically
      if (error instanceof Error && error.message.includes('__cf_bm')) {
        console.log('[SimplifiedRealtime] Cloudflare Bot Management detected, using degraded mode');
        setState(prev => ({ ...prev, isDegraded: true, error: null }));
      }
    }
  }, [channelId, enabled, isAuthenticated, isInitialized, loading, connectionManager, state.isConnecting, state.isConnected, retryOnFailure, gracefulDegradation]);

  // Disconnect function
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      console.log(`[SimplifiedRealtime] Disconnecting from: ${channelId}`);
      connectionManager.removeConnection(channelId);
      channelRef.current = null;
    }
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      isConnecting: false,
      isDegraded: false,
      error: null,
      retryCount: 0,
    }));
  }, [channelId, connectionManager]);

  // Event handler registration
  const on = useCallback((event: string, callback: Function) => {
    eventHandlers.current.set(event, callback);
    
    if (channelRef.current) {
      channelRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string) => {
    eventHandlers.current.delete(event);
    
    if (channelRef.current) {
      channelRef.current.off(event);
    }
  }, []);

  const send = useCallback((event: string, payload: any): boolean => {
    if (!state.isConnected || !channelRef.current) {
      console.warn(`[SimplifiedRealtime] Cannot send ${event}: not connected`);
      return false;
    }

    try {
      channelRef.current.send({
        type: 'broadcast',
        event,
        payload,
      });
      return true;
    } catch (error) {
      console.error(`[SimplifiedRealtime] Send failed:`, error);
      return false;
    }
  }, [state.isConnected]);

  // Auto-connect when conditions are met
  useEffect(() => {
    if (enabled && isAuthenticated && isInitialized && !loading) {
      // Delay connection slightly to ensure auth is fully settled
      const timer = setTimeout(connect, 100);
      return () => clearTimeout(timer);
    }
  }, [enabled, isAuthenticated, isInitialized, loading, connect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    on,
    off,
    send,
  };
};