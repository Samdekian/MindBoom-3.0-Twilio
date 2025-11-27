import { useCallback, useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ConnectionRecoveryOptions {
  maxRetries?: number;
  retryDelay?: number;
  exponentialBackoff?: boolean;
  onRetryAttempt?: (attempt: number, maxRetries: number) => void;
  onRecoveryFailed?: () => void;
  onRecoverySuccess?: () => void;
}

export function useEnhancedConnectionManager(
  joinSession: () => Promise<void>,
  leaveSession: () => Promise<void>,
  options: ConnectionRecoveryOptions = {}
) {
  const { toast } = useToast();
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryAttempt, setRecoveryAttempt] = useState(0);
  const recoveryTimeoutRef = useRef<NodeJS.Timeout>();
  
  const {
    maxRetries = 3,
    retryDelay = 2000,
    exponentialBackoff = true,
    onRetryAttempt,
    onRecoveryFailed,
    onRecoverySuccess
  } = options;

  const startRecovery = useCallback(async () => {
    if (isRecovering) {
      console.log('🔄 [ConnectionManager] Recovery already in progress');
      return;
    }

    console.log('🚨 [ConnectionManager] Starting connection recovery');
    setIsRecovering(true);
    setRecoveryAttempt(0);

    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      attempt += 1;
      setRecoveryAttempt(attempt);
      
      console.log(`🔄 [ConnectionManager] Recovery attempt ${attempt}/${maxRetries}`);
      onRetryAttempt?.(attempt, maxRetries);

      try {
        // First, cleanly leave current session
        await leaveSession();
        
        // Wait before retry
        const delay = exponentialBackoff 
          ? retryDelay * Math.pow(2, attempt - 1) 
          : retryDelay;
        
        await new Promise(resolve => {
          recoveryTimeoutRef.current = setTimeout(resolve, delay);
        });

        // Attempt to rejoin
        await joinSession();
        
        success = true;
        console.log('✅ [ConnectionManager] Recovery successful');
        onRecoverySuccess?.();
        
        toast({
          title: "Connection Restored",
          description: "Successfully reconnected to the session",
        });

      } catch (error) {
        console.error(`❌ [ConnectionManager] Recovery attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          console.error('❌ [ConnectionManager] All recovery attempts exhausted');
          onRecoveryFailed?.();
          
          toast({
            title: "Connection Failed",
            description: `Unable to reconnect after ${maxRetries} attempts`,
            variant: "destructive"
          });
        }
      }
    }

    setIsRecovering(false);
    setRecoveryAttempt(0);
  }, [isRecovering, maxRetries, retryDelay, exponentialBackoff, joinSession, leaveSession, onRetryAttempt, onRecoveryFailed, onRecoverySuccess, toast]);

  const stopRecovery = useCallback(() => {
    console.log('🛑 [ConnectionManager] Stopping recovery');
    setIsRecovering(false);
    setRecoveryAttempt(0);
    
    if (recoveryTimeoutRef.current) {
      clearTimeout(recoveryTimeoutRef.current);
      recoveryTimeoutRef.current = undefined;
    }
  }, []);

  // Auto-recovery for connection failures
  const handleConnectionFailure = useCallback((connectionState: string, streamHealth?: any) => {
    // Only start recovery if we're not already recovering and we detect a real failure
    if (!isRecovering && (
      connectionState === 'FAILED' || 
      connectionState === 'DISCONNECTED' ||
      (connectionState === 'CONNECTED' && streamHealth && !streamHealth.local.isValid && !streamHealth.remote.isValid)
    )) {
      console.log('🚨 [ConnectionManager] Connection failure detected, starting recovery');
      startRecovery();
    }
  }, [isRecovering, startRecovery]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recoveryTimeoutRef.current) {
        clearTimeout(recoveryTimeoutRef.current);
      }
    };
  }, []);

  return {
    isRecovering,
    recoveryAttempt,
    maxRetries,
    startRecovery,
    stopRecovery,
    handleConnectionFailure
  };
}

// Hook for intelligent connection quality monitoring
export function useConnectionQualityMonitor() {
  const [qualityHistory, setQualityHistory] = useState<{
    timestamp: number;
    quality: string;
  }[]>([]);

  const recordQuality = useCallback((quality: string) => {
    const timestamp = Date.now();
    setQualityHistory(prev => {
      const newHistory = [...prev, { timestamp, quality }];
      // Keep only last 10 minutes of history
      const cutoff = timestamp - (10 * 60 * 1000);
      return newHistory.filter(entry => entry.timestamp > cutoff);
    });
  }, []);

  const getQualityTrend = useCallback(() => {
    if (qualityHistory.length < 2) return 'stable';
    
    const recent = qualityHistory.slice(-5);
    const qualities = ['disconnected', 'poor', 'good', 'excellent'];
    
    let trend = 0;
    for (let i = 1; i < recent.length; i++) {
      const prevIndex = qualities.indexOf(recent[i - 1].quality);
      const currIndex = qualities.indexOf(recent[i].quality);
      trend += currIndex - prevIndex;
    }
    
    if (trend > 2) return 'improving';
    if (trend < -2) return 'degrading';
    return 'stable';
  }, [qualityHistory]);

  const shouldTriggerRecovery = useCallback((currentQuality: string) => {
    if (currentQuality !== 'disconnected' && currentQuality !== 'poor') {
      return false;
    }
    
    // Check if quality has been poor for the last 3 measurements
    const recentQualities = qualityHistory.slice(-3);
    return recentQualities.length >= 3 && 
           recentQualities.every(entry => 
             entry.quality === 'disconnected' || entry.quality === 'poor'
           );
  }, [qualityHistory]);

  return {
    qualityHistory,
    recordQuality,
    getQualityTrend,
    shouldTriggerRecovery
  };
}
