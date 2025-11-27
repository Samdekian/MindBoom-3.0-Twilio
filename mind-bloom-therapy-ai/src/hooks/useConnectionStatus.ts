
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConnectionState {
  isOnline: boolean;
  supabaseConnected: boolean | null;
  realtimeConnected: boolean;
  connectionAttempts: number;
  lastConnectionCheck: number;
}

export const useConnectionStatus = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    supabaseConnected: null,
    realtimeConnected: false,
    connectionAttempts: 0,
    lastConnectionCheck: 0
  });

  const checkTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;
  const retryDelay = 2000;

  const checkSupabaseConnection = useCallback(async () => {
    const now = Date.now();
    
    // Throttle connection checks to prevent spam
    if (now - connectionState.lastConnectionCheck < 5000) {
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);
      
      clearTimeout(timeoutId);
      
      setConnectionState(prev => ({
        ...prev,
        supabaseConnected: !error,
        connectionAttempts: 0,
        lastConnectionCheck: now
      }));
    } catch (error) {
      console.warn('Supabase connection check failed:', error);
      
      setConnectionState(prev => {
        const newAttempts = prev.connectionAttempts + 1;
        return {
          ...prev,
          supabaseConnected: false,
          connectionAttempts: newAttempts,
          lastConnectionCheck: now
        };
      });

      // Exponential backoff for retries
      if (connectionState.connectionAttempts < maxRetries) {
        const delay = retryDelay * Math.pow(2, connectionState.connectionAttempts);
        
        if (checkTimeoutRef.current) {
          clearTimeout(checkTimeoutRef.current);
        }
        
        checkTimeoutRef.current = setTimeout(() => {
          checkSupabaseConnection();
        }, delay);
      }
    }
  }, [connectionState.lastConnectionCheck, connectionState.connectionAttempts]);

  const handleOnline = useCallback(() => {
    console.log('🌐 Network came online');
    setConnectionState(prev => ({ ...prev, isOnline: true, connectionAttempts: 0 }));
    
    // Debounce connection check when coming online
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
    
    checkTimeoutRef.current = setTimeout(() => {
      checkSupabaseConnection();
    }, 1000);
  }, [checkSupabaseConnection]);

  const handleOffline = useCallback(() => {
    console.log('🌐 Network went offline');
    setConnectionState(prev => ({
      ...prev,
      isOnline: false,
      supabaseConnected: false,
      realtimeConnected: false
    }));
    
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    // Initial connection check with delay to prevent immediate spam
    const initialTimeout = setTimeout(() => {
      checkSupabaseConnection();
    }, 1000);

    // Listen for network changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(initialTimeout);
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  const updateRealtimeStatus = useCallback((connected: boolean) => {
    setConnectionState(prev => ({ ...prev, realtimeConnected: connected }));
  }, []);

  return {
    isOnline: connectionState.isOnline,
    supabaseConnected: connectionState.supabaseConnected,
    realtimeConnected: connectionState.realtimeConnected,
    hasConnection: connectionState.isOnline && connectionState.supabaseConnected !== false,
    connectionAttempts: connectionState.connectionAttempts,
    updateRealtimeStatus,
    retryConnection: checkSupabaseConnection
  };
};
