import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConnectionMetrics {
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
  packetLoss: number;
  bandwidth: number;
  jitter: number;
}

interface ErrorRecoveryState {
  isRecovering: boolean;
  errorCount: number;
  lastError: Error | null;
  recoveryAttempt: number;
  maxRecoveryAttempts: number;
}

interface UseErrorRecoveryOptions {
  sessionId: string;
  userId: string;
  onRecoverySuccess?: () => void;
  onRecoveryFailed?: (error: Error) => void;
  maxRetries?: number;
  retryDelay?: number;
}

export function useErrorRecovery({
  sessionId,
  userId,
  onRecoverySuccess,
  onRecoveryFailed,
  maxRetries = 3,
  retryDelay = 2000
}: UseErrorRecoveryOptions) {
  const [recoveryState, setRecoveryState] = useState<ErrorRecoveryState>({
    isRecovering: false,
    errorCount: 0,
    lastError: null,
    recoveryAttempt: 0,
    maxRecoveryAttempts: maxRetries
  });

  const [connectionMetrics, setConnectionMetrics] = useState<ConnectionMetrics>({
    quality: 'disconnected',
    latency: 0,
    packetLoss: 0,
    bandwidth: 0,
    jitter: 0
  });

  const { toast } = useToast();
  const recoveryTimeoutRef = useRef<NodeJS.Timeout>();
  const metricsIntervalRef = useRef<NodeJS.Timeout>();

  // Log error to database
  const logError = useCallback(async (error: Error, context: Record<string, any> = {}) => {
    try {
      await supabase
        .from('session_errors')
        .insert({
          session_id: sessionId,
          user_id: userId,
          error_type: error.name || 'UnknownError',
          error_message: error.message,
          error_context: {
            ...context,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }, [sessionId, userId]);

  // Start error recovery process
  const startRecovery = useCallback(async (error: Error, context: Record<string, any> = {}) => {
    setRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      lastError: error,
      errorCount: prev.errorCount + 1
    }));

    // Log the error
    await logError(error, context);

    console.log(`🔄 Starting error recovery for: ${error.message}`);

    // Show user notification
    toast({
      title: "Connection Issue Detected",
      description: "Attempting to recover connection...",
      variant: "default"
    });

    // Start recovery attempts
    attemptRecovery(error);
  }, [logError, toast]);

  // Attempt recovery with exponential backoff
  const attemptRecovery = useCallback(async (error: Error) => {
    const currentAttempt = recoveryState.recoveryAttempt + 1;

    if (currentAttempt > maxRetries) {
      // Recovery failed
      setRecoveryState(prev => ({
        ...prev,
        isRecovering: false,
        recoveryAttempt: 0
      }));

      toast({
        title: "Recovery Failed",
        description: "Unable to recover from connection error. Please refresh the page.",
        variant: "destructive"
      });

      onRecoveryFailed?.(error);
      return;
    }

    setRecoveryState(prev => ({
      ...prev,
      recoveryAttempt: currentAttempt
    }));

    const delay = retryDelay * Math.pow(2, currentAttempt - 1); // Exponential backoff

    console.log(`🔄 Recovery attempt ${currentAttempt}/${maxRetries} in ${delay}ms`);

    recoveryTimeoutRef.current = setTimeout(async () => {
      try {
        // Test database connectivity
        const { error: dbError } = await supabase
          .from('session_states')
          .select('id')
          .limit(1);

        if (dbError) throw dbError;

        // Test real-time connectivity
        const testChannel = supabase.channel('test_connection');
        const isSubscribed = await new Promise<boolean>((resolve) => {
          const timeout = setTimeout(() => resolve(false), 5000);
          
          testChannel.subscribe((status) => {
            clearTimeout(timeout);
            testChannel.unsubscribe();
            resolve(status === 'SUBSCRIBED');
          });
        });

        if (!isSubscribed) {
          throw new Error('Real-time connection test failed');
        }

        // Recovery successful
        setRecoveryState(prev => ({
          ...prev,
          isRecovering: false,
          recoveryAttempt: 0,
          lastError: null
        }));

        toast({
          title: "Connection Recovered",
          description: "Successfully restored connection",
        });

        onRecoverySuccess?.(
        );

        console.log('✅ Error recovery successful');

      } catch (recoveryError) {
        console.log(`❌ Recovery attempt ${currentAttempt} failed:`, recoveryError);
        attemptRecovery(error);
      }
    }, delay);
  }, [recoveryState.recoveryAttempt, maxRetries, retryDelay, toast, onRecoverySuccess, onRecoveryFailed]);

  // Monitor connection quality
  const startConnectionMonitoring = useCallback(() => {
    const updateMetrics = async () => {
      try {
        const startTime = performance.now();
        
        // Test database response time
        const { error } = await supabase
          .from('session_states')
          .select('id')
          .limit(1);

        const endTime = performance.now();
        const latency = endTime - startTime;

        if (error) {
          setConnectionMetrics(prev => ({
            ...prev,
            quality: 'disconnected',
            latency: 0
          }));
          return;
        }

        // Determine quality based on latency
        let quality: ConnectionMetrics['quality'];
        if (latency < 100) quality = 'excellent';
        else if (latency < 300) quality = 'good';
        else if (latency < 1000) quality = 'poor';
        else quality = 'disconnected';

        setConnectionMetrics(prev => ({
          ...prev,
          quality,
          latency: Math.round(latency)
        }));

      } catch (error) {
        setConnectionMetrics(prev => ({
          ...prev,
          quality: 'disconnected',
          latency: 0
        }));
      }
    };

    // Initial check
    updateMetrics();

    // Set up interval
    metricsIntervalRef.current = setInterval(updateMetrics, 10000); // Every 10 seconds
  }, []);

  // Handle network connectivity changes
  const handleOnlineStatusChange = useCallback(() => {
    if (navigator.onLine) {
      console.log('🌐 Network connection restored');
      toast({
        title: "Network Restored",
        description: "Internet connection is back online",
      });
      
      // Test connection after a brief delay
      setTimeout(() => {
        startConnectionMonitoring();
      }, 1000);
    } else {
      console.log('🌐 Network connection lost');
      setConnectionMetrics(prev => ({
        ...prev,
        quality: 'disconnected'
      }));
      
      toast({
        title: "Network Disconnected",
        description: "Internet connection lost. Waiting for reconnection...",
        variant: "destructive"
      });
    }
  }, [startConnectionMonitoring, toast]);

  // Clear recovery timeout
  const clearRecovery = useCallback(() => {
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = undefined;
    }
  }, []);

  // Reset error state
  const resetErrorState = useCallback(() => {
    setRecoveryState({
      isRecovering: false,
      errorCount: 0,
      lastError: null,
      recoveryAttempt: 0,
      maxRecoveryAttempts: maxRetries
    });
  }, [maxRetries]);

  // Initialize monitoring
  useEffect(() => {
    startConnectionMonitoring();

    // Listen for online/offline events
    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      clearRecovery();
      
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, [startConnectionMonitoring, handleOnlineStatusChange, clearRecovery]);

  return {
    recoveryState,
    connectionMetrics,
    startRecovery,
    clearRecovery,
    resetErrorState,
    logError
  };
}