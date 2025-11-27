import { useCallback, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useEnhancedDeviceManager } from './use-enhanced-device-manager';
import { useUnifiedPermissionHandler } from './use-unified-permission-handler';

export interface ConnectionRecoveryState {
  isRecovering: boolean;
  recoveryAttempts: number;
  maxAttempts: number;
  lastRecoveryTime: Date | null;
  recoveryMode: 'auto' | 'manual' | 'disabled';
  backoffDelay: number;
}

export interface RecoveryResult {
  success: boolean;
  mode: 'both' | 'video-only' | 'audio-only' | 'none';
  error?: string;
  fallbackUsed?: boolean;
}

export function useEnhancedConnectionRecovery() {
  const { toast } = useToast();
  const { deviceState, requestPermissions, enumerateDevices } = useEnhancedDeviceManager();
  const { permissionState, requestPermissions: requestPermissionsFallback } = useUnifiedPermissionHandler();
  
  const [recoveryState, setRecoveryState] = useState<ConnectionRecoveryState>({
    isRecovering: false,
    recoveryAttempts: 0,
    maxAttempts: 5,
    lastRecoveryTime: null,
    recoveryMode: 'auto',
    backoffDelay: 1000, // Start with 1 second
  });

  // Calculate exponential backoff delay
  const getBackoffDelay = useCallback((attempt: number): number => {
    return Math.min(1000 * Math.pow(2, attempt), 30000); // Max 30 seconds
  }, []);

  // Comprehensive connection recovery with multiple strategies
  const attemptRecovery = useCallback(async (
    options: {
      onJoinSession: () => Promise<void>;
      forceReset?: boolean;
      specificIssue?: 'permissions' | 'devices' | 'connection' | 'media';
    }
  ): Promise<RecoveryResult> => {
    const { onJoinSession, forceReset = false, specificIssue } = options;

    if (recoveryState.isRecovering && !forceReset) {
      console.log('🔄 [ConnectionRecovery] Recovery already in progress');
      return { success: false, mode: 'none', error: 'Recovery already in progress' };
    }

    if (recoveryState.recoveryAttempts >= recoveryState.maxAttempts && !forceReset) {
      console.log('🔄 [ConnectionRecovery] Max recovery attempts reached');
      return { 
        success: false, 
        mode: 'none', 
        error: 'Maximum recovery attempts reached. Please refresh the page.' 
      };
    }

    setRecoveryState(prev => ({
      ...prev,
      isRecovering: true,
      recoveryAttempts: forceReset ? 0 : prev.recoveryAttempts + 1,
      lastRecoveryTime: new Date(),
      backoffDelay: getBackoffDelay(forceReset ? 0 : prev.recoveryAttempts)
    }));

    try {
      console.log(`🔄 [ConnectionRecovery] Starting recovery attempt ${recoveryState.recoveryAttempts + 1}/${recoveryState.maxAttempts}`);
      
      // Wait for backoff delay (except on first attempt)
      if (recoveryState.recoveryAttempts > 0 && !forceReset) {
        console.log(`⏳ [ConnectionRecovery] Waiting ${recoveryState.backoffDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, recoveryState.backoffDelay));
      }

      // Step 1: Re-enumerate devices to detect changes
      console.log('📱 [ConnectionRecovery] Re-enumerating devices...');
      await enumerateDevices();
      
      // Give a moment for device state to update
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Analyze current state and determine recovery strategy
      const hasDevices = deviceState.availability.hasCameras || deviceState.availability.hasMicrophones;
      const hasPermissions = permissionState.bothGranted || permissionState.camera === 'granted' || permissionState.microphone === 'granted';

      console.log('🔍 [ConnectionRecovery] Current state analysis:', {
        hasDevices,
        hasPermissions,
        deviceAvailability: deviceState.availability,
        permissionState,
        specificIssue
      });

      if (!hasDevices) {
        // No devices available - this is a critical issue
        setRecoveryState(prev => ({ ...prev, isRecovering: false }));
        
        toast({
          title: "Device Detection Failed",
          description: "No camera or microphone devices detected. Please check device connections.",
          variant: "destructive"
        });
        
        return { 
          success: false, 
          mode: 'none', 
          error: 'No media devices available' 
        };
      }

      // Step 3: Attempt permission recovery with fallback modes
      let permissionResult;
      
      if (!hasPermissions || specificIssue === 'permissions') {
        console.log('🔒 [ConnectionRecovery] Attempting permission recovery...');
        
        // Use enhanced device manager for permission handling
        permissionResult = await requestPermissions({
          requestVideo: deviceState.availability.hasCameras,
          requestAudio: deviceState.availability.hasMicrophones,
          fallbackToAudioOnly: true,
          fallbackToVideoOnly: true
        });
      } else {
        // Permissions seem OK, test if we can still get media
        console.log('🎯 [ConnectionRecovery] Testing media access...');
        permissionResult = await requestPermissions({
          requestVideo: deviceState.availability.hasCameras && permissionState.camera === 'granted',
          requestAudio: deviceState.availability.hasMicrophones && permissionState.microphone === 'granted',
          fallbackToAudioOnly: true,
          fallbackToVideoOnly: true
        });
      }

      if (!permissionResult.success) {
        setRecoveryState(prev => ({ ...prev, isRecovering: false }));
        
        toast({
          title: "Media Access Failed",
          description: permissionResult.error || "Unable to access camera or microphone",
          variant: "destructive"
        });
        
        return { 
          success: false, 
          mode: 'none', 
          error: permissionResult.error || 'Media access failed',
          fallbackUsed: permissionResult.mode !== 'both'
        };
      }

      // Step 4: Attempt to rejoin session
      console.log('🚀 [ConnectionRecovery] Attempting to rejoin session...');
      await onJoinSession();

      // Step 5: Success - reset recovery state
      setRecoveryState(prev => ({
        ...prev,
        isRecovering: false,
        recoveryAttempts: 0,
        backoffDelay: 1000
      }));

      const fallbackUsed = permissionResult.mode !== 'both';
      
      toast({
        title: "Connection Recovered",
        description: fallbackUsed 
          ? `Reconnected in ${permissionResult.mode} mode`
          : "Successfully reconnected with full audio and video",
      });

      console.log('✅ [ConnectionRecovery] Recovery successful:', {
        mode: permissionResult.mode,
        fallbackUsed,
        hasVideo: permissionResult.hasVideo,
        hasAudio: permissionResult.hasAudio
      });

      return { 
        success: true, 
        mode: permissionResult.mode,
        fallbackUsed
      };

    } catch (error) {
      console.error('❌ [ConnectionRecovery] Recovery attempt failed:', error);
      
      setRecoveryState(prev => ({ ...prev, isRecovering: false }));
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during recovery';
      
      // Show different messages based on attempt number
      if (recoveryState.recoveryAttempts >= recoveryState.maxAttempts - 1) {
        toast({
          title: "Recovery Failed",
          description: "Unable to restore connection. Please refresh the page and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Recovery Attempt Failed",
          description: `Attempt ${recoveryState.recoveryAttempts + 1}/${recoveryState.maxAttempts} failed. Retrying...`,
          variant: "destructive"
        });
      }
      
      return { 
        success: false, 
        mode: 'none', 
        error: errorMessage
      };
    }
  }, [
    deviceState, 
    permissionState, 
    recoveryState, 
    requestPermissions, 
    enumerateDevices, 
    getBackoffDelay, 
    toast
  ]);

  // Auto-recovery logic for connection failures
  const enableAutoRecovery = useCallback((
    onJoinSession: () => Promise<void>,
    triggerConditions: {
      connectionLost?: boolean;
      permissionDenied?: boolean;
      deviceIssues?: boolean;
    }
  ) => {
    if (recoveryState.recoveryMode !== 'auto') {
      return;
    }

    const shouldTriggerRecovery = 
      triggerConditions.connectionLost || 
      triggerConditions.permissionDenied || 
      triggerConditions.deviceIssues;

    if (shouldTriggerRecovery && !recoveryState.isRecovering) {
      console.log('🤖 [ConnectionRecovery] Auto-recovery triggered:', triggerConditions);
      
      const specificIssue = 
        triggerConditions.permissionDenied ? 'permissions' :
        triggerConditions.deviceIssues ? 'devices' :
        triggerConditions.connectionLost ? 'connection' :
        undefined;

      // Slight delay before auto-recovery to avoid rapid cycling
      setTimeout(() => {
        attemptRecovery({ 
          onJoinSession, 
          specificIssue 
        });
      }, 2000);
    }
  }, [recoveryState, attemptRecovery]);

  // Reset recovery state (useful for manual refresh)
  const resetRecoveryState = useCallback(() => {
    setRecoveryState({
      isRecovering: false,
      recoveryAttempts: 0,
      maxAttempts: 5,
      lastRecoveryTime: null,
      recoveryMode: 'auto',
      backoffDelay: 1000,
    });
  }, []);

  // Disable/enable auto-recovery
  const setRecoveryMode = useCallback((mode: 'auto' | 'manual' | 'disabled') => {
    setRecoveryState(prev => ({ ...prev, recoveryMode: mode }));
  }, []);

  return {
    recoveryState,
    attemptRecovery,
    enableAutoRecovery,
    resetRecoveryState,
    setRecoveryMode,
  };
}