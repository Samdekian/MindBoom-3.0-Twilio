import { useState, useEffect, useRef, useCallback } from 'react';
import { SimpleConnectionManager } from '@/lib/connection/SimpleConnectionManager';
import { useConnectionStatus } from './useConnectionStatus';
import { useToast } from './use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

interface RealtimeSubscription {
  channelId: string;
  callbacks: Record<string, Function>;
  priority: 'high' | 'medium' | 'low';
  lazy: boolean;
}

interface OptimizedRealtimeOptions {
  priority?: 'high' | 'medium' | 'low';
  lazy?: boolean;
  retryAttempts?: number;
  gracefulDegradation?: boolean;
}

export const useOptimizedRealtime = (
  channelId: string,
  options: OptimizedRealtimeOptions = {}
) => {
  const {
    priority = 'medium',
    lazy = false,
    retryAttempts = 3,
    gracefulDegradation = true
  } = options;

  const { hasConnection } = useConnectionStatus();
  const { toast } = useToast();
  const { isAuthenticated, isInitialized, loading } = useAuthRBAC();
  const connectionManager = SimpleConnectionManager.getInstance();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDegraded, setIsDegraded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  const channelRef = useRef<any>(null);
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const callbacksRef = useRef<Record<string, Function>>({});
  const retryTimeoutRef = useRef<NodeJS.Timeout>();

  // Smart subscription management
  const subscribe = useCallback(async (forceConnect = false) => {
    // Wait for authentication before connecting
    if (!hasConnection && !forceConnect) {
      if (gracefulDegradation) {
        setIsDegraded(true);
        console.log(`📡 [Realtime] Gracefully degrading for ${channelId}`);
        return;
      }
      return;
    }

    // Ensure auth is ready before connecting
    if (!isAuthenticated || !isInitialized || loading) {
      console.log(`📡 [Realtime] Waiting for auth to be ready for ${channelId}`);
      return;
    }

    if (lazy && !forceConnect) {
      console.log(`📡 [Realtime] Lazy loading enabled for ${channelId}, skipping auto-connect`);
      return;
    }

    setIsConnecting(true);
    setIsDegraded(false);

    try {
      const channel = await connectionManager.getConnection(channelId);
      
      if (!channel) {
        console.warn(`📡 [Realtime] Could not get connection for ${channelId}`);
        handleConnectionFailure();
        return;
      }

      channelRef.current = channel;

      // Apply all stored callbacks
      Object.entries(callbacksRef.current).forEach(([event, callback]) => {
        channel.on(event, callback);
      });

      // Subscribe with status monitoring
      const subscription = await channel.subscribe((status: string) => {
        console.log(`📡 [Realtime] ${channelId} status: ${status}`);
        
        switch (status) {
          case 'SUBSCRIBED':
            setIsConnected(true);
            setIsConnecting(false);
            setRetryCount(0);
            setIsDegraded(false);
            break;
          case 'CHANNEL_ERROR':
          case 'TIMED_OUT':
            handleConnectionFailure();
            break;
          case 'CLOSED':
            setIsConnected(false);
            setIsConnecting(false);
            break;
        }
      });

      subscriptionRef.current = {
        channelId,
        callbacks: { ...callbacksRef.current },
        priority,
        lazy
      };

    } catch (error) {
      console.error(`📡 [Realtime] Subscription error for ${channelId}:`, error);
      handleConnectionFailure();
    }
  }, [channelId, hasConnection, priority, lazy, gracefulDegradation, isAuthenticated, isInitialized, loading, connectionManager]);

  const handleConnectionFailure = useCallback(() => {
    setIsConnected(false);
    setIsConnecting(false);
    
    if (retryCount < retryAttempts) {
      const delay = Math.min(1000 * Math.pow(2, retryCount) + Math.random() * 1000, 10000);
      
      console.log(`📡 [Realtime] Retrying ${channelId} in ${delay}ms (attempt ${retryCount + 1}/${retryAttempts})`);
      
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        subscribe(true);
      }, delay);
    } else {
      if (gracefulDegradation) {
        setIsDegraded(true);
        toast({
          title: "Connection Issues",
          description: "Some features may be limited due to connectivity issues",
          variant: "destructive"
        });
      }
    }
  }, [retryCount, retryAttempts, channelId, subscribe, gracefulDegradation, toast]);

  // Connection event handlers
  const on = useCallback((event: string, callback: Function) => {
    callbacksRef.current[event] = callback;
    
    if (channelRef.current) {
      channelRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback((event: string) => {
    delete callbacksRef.current[event];
    
    if (channelRef.current) {
      channelRef.current.off(event);
    }
  }, []);

  const send = useCallback((event: string, payload: any) => {
    if (channelRef.current && isConnected) {
      return channelRef.current.send({
        type: 'broadcast',
        event,
        payload
      });
    } else if (isDegraded) {
      console.warn(`📡 [Realtime] Cannot send ${event} - connection degraded`);
      return false;
    }
    return false;
  }, [isConnected, isDegraded]);

  // Force connect for lazy subscriptions
  const connect = useCallback(() => {
    if (lazy && !isConnected && !isConnecting) {
      subscribe(true);
    }
  }, [lazy, isConnected, isConnecting, subscribe]);

  // Cleanup
  const unsubscribe = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    if (channelRef.current) {
      connectionManager.removeConnection(channelId);
      channelRef.current = null;
    }

    subscriptionRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setIsDegraded(false);
  }, [channelId, connectionManager]);

  // Auto-subscribe on mount (unless lazy)
  useEffect(() => {
    // Only subscribe when auth is ready
    if (!lazy && isAuthenticated && isInitialized && !loading) {
      const timer = setTimeout(subscribe, 100);
      return () => clearTimeout(timer);
    }
    
    return unsubscribe;
  }, [subscribe, unsubscribe, lazy, isAuthenticated, isInitialized, loading]);

  // Reconnect when connection is restored
  useEffect(() => {
    if (hasConnection && isDegraded && retryCount < retryAttempts) {
      console.log(`📡 [Realtime] Connection restored, attempting to reconnect ${channelId}`);
      setRetryCount(0);
      subscribe(true);
    }
  }, [hasConnection, isDegraded, retryCount, retryAttempts, channelId, subscribe]);

  return {
    isConnected,
    isConnecting,
    isDegraded,
    retryCount,
    on,
    off,
    send,
    connect, // For lazy subscriptions
    unsubscribe,
    // Metrics access
    status: connectionManager.getStatus(),
  };
};