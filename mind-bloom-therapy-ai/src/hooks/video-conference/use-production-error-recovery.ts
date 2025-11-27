import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ErrorRecoveryState {
  isRecovering: boolean;
  retryCount: number;
  maxRetries: number;
  lastError: Error | null;
  connectionType: 'initial' | 'reconnection' | 'recovery';
}

export interface NetworkQualityInfo {
  quality: 'excellent' | 'good' | 'poor' | 'disconnected';
  latency: number;
  jitter: number;
  packetLoss: number;
  bandwidth: number;
}

export function useProductionErrorRecovery() {
  const { toast } = useToast();
  
  const [recoveryState, setRecoveryState] = useState<ErrorRecoveryState>({
    isRecovering: false,
    retryCount: 0,
    maxRetries: 3,
    lastError: null,
    connectionType: 'initial'
  });

  const [networkQuality, setNetworkQuality] = useState<NetworkQualityInfo>({
    quality: 'excellent',
    latency: 0,
    jitter: 0,
    packetLoss: 0,
    bandwidth: 0
  });

  // Auto-reconnection with exponential backoff
  const attemptRecovery = useCallback(async (
    errorType: 'network' | 'permission' | 'server' | 'token',
    recoveryFunction: () => Promise<boolean>
  ): Promise<boolean> => {
    const { retryCount, maxRetries } = recoveryState;
    
    if (retryCount >= maxRetries) {
      console.log('🛑 Max recovery attempts reached');
      toast({
        title: "Connection Failed",
        description: "Unable to restore connection after multiple attempts. Please refresh the page.",
        variant: "destructive",
        duration: 10000
      });
      return false;
    }

    setRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      retryCount: prev.retryCount + 1,
      connectionType: 'recovery'
    }));

    // Exponential backoff: 1s, 2s, 4s, 8s
    const delay = Math.pow(2, retryCount) * 1000;
    console.log(`🔄 Recovery attempt ${retryCount + 1}/${maxRetries} in ${delay}ms`);
    
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const success = await recoveryFunction();
      
      if (success) {
        console.log('✅ Recovery successful');
        setRecoveryState(prev => ({
          ...prev,
          isRecovering: false,
          retryCount: 0,
          lastError: null,
          connectionType: 'reconnection'
        }));
        
        toast({
          title: "Connection Restored",
          description: "Successfully reconnected to the session",
          duration: 3000
        });
        
        return true;
      } else {
        console.log('❌ Recovery attempt failed');
        return false;
      }
    } catch (error) {
      console.error('Recovery attempt error:', error);
      setRecoveryState(prev => ({
        ...prev,
        lastError: error instanceof Error ? error : new Error('Unknown recovery error')
      }));
      return false;
    }
  }, [recoveryState, toast]);

  // Network quality monitoring
  const updateNetworkQuality = useCallback(async () => {
    try {
      const startTime = performance.now();
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      const endTime = performance.now();
      
      const latency = endTime - startTime;
      
      // Estimate quality based on latency
      let quality: NetworkQualityInfo['quality'] = 'excellent';
      if (latency > 200) quality = 'poor';
      else if (latency > 100) quality = 'good';
      
      setNetworkQuality(prev => ({
        ...prev,
        quality,
        latency: Math.round(latency)
      }));
      
    } catch (error) {
      console.error('Network quality check failed:', error);
      setNetworkQuality(prev => ({
        ...prev,
        quality: 'disconnected',
        latency: 9999
      }));
    }
  }, []);

  // Connection health checker
  const checkConnectionHealth = useCallback(async (): Promise<boolean> => {
    try {
      // Check network connectivity
      await updateNetworkQuality();
      
      // Check WebRTC capabilities
      const hasWebRTC = !!(
        window.RTCPeerConnection &&
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia
      );
      
      if (!hasWebRTC) {
        throw new Error('WebRTC not supported');
      }
      
      return networkQuality.quality !== 'disconnected';
    } catch (error) {
      console.error('Connection health check failed:', error);
      return false;
    }
  }, [networkQuality.quality, updateNetworkQuality]);

  // Specific error handlers
  const handleTokenExpiry = useCallback(async (
    refreshTokenFunction: () => Promise<string>
  ): Promise<boolean> => {
    console.log('🔑 Handling token expiry...');
    
    try {
      const newToken = await refreshTokenFunction();
      if (newToken) {
        console.log('✅ Token refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  const handleNetworkDisconnection = useCallback(async (
    reconnectFunction: () => Promise<boolean>
  ): Promise<boolean> => {
    console.log('🌐 Handling network disconnection...');
    
    return await attemptRecovery('network', async () => {
      const isHealthy = await checkConnectionHealth();
      if (!isHealthy) return false;
      
      return await reconnectFunction();
    });
  }, [attemptRecovery, checkConnectionHealth]);

  const handlePermissionError = useCallback(async (
    requestPermissionsFunction: () => Promise<boolean>
  ): Promise<boolean> => {
    console.log('🔒 Handling permission error...');
    
    try {
      return await requestPermissionsFunction();
    } catch (error) {
      console.error('Permission recovery failed:', error);
      
      toast({
        title: "Permission Required",
        description: "Please manually grant camera and microphone permissions in your browser settings",
        variant: "destructive",
        duration: 10000
      });
      
      return false;
    }
  }, [toast]);

  // Reset recovery state (used when user manually retries)
  const resetRecovery = useCallback(() => {
    setRecoveryState({
      isRecovering: false,
      retryCount: 0,
      maxRetries: 3,
      lastError: null,
      connectionType: 'initial'
    });
  }, []);

  // Provide user feedback based on error type
  const getErrorGuidance = useCallback((errorType: string): string => {
    switch (errorType) {
      case 'NotAllowedError':
        return 'Please allow camera and microphone access in your browser settings';
      case 'NetworkError':
        return 'Please check your internet connection and try again';
      case 'TokenExpired':
        return 'Session token has expired. Attempting to refresh...';
      case 'ServerError':
        return 'Server connection issue. Retrying automatically...';
      default:
        return 'An unexpected error occurred. Attempting recovery...';
    }
  }, []);

  return {
    recoveryState,
    networkQuality,
    attemptRecovery,
    handleTokenExpiry,
    handleNetworkDisconnection,
    handlePermissionError,
    checkConnectionHealth,
    updateNetworkQuality,
    resetRecovery,
    getErrorGuidance
  };
}