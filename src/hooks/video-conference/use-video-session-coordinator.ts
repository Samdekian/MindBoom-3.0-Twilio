import { useState, useCallback, useEffect, useRef } from 'react';
import { useUnifiedPermissionHandler } from './use-unified-permission-handler';
import { useEnhancedErrorHandling } from './use-enhanced-error-handling';
import { useVideoStreamManager } from '../webrtc/useVideoStreamManager';
import { useWebRTCConnection } from '../webrtc/useWebRTCConnection';
import { useConnectionQualityMonitor } from './use-connection-quality-monitor';
import { useToast } from '../use-toast';

export interface VideoSessionCoordinatorState {
  phase: 'initializing' | 'checking-permissions' | 'preparing-devices' | 'ready' | 'connecting' | 'connected' | 'error';
  isReady: boolean;
  canProceed: boolean;
  activeError: string | null;
  deviceValidationStatus: {
    camera: 'unknown' | 'checking' | 'valid' | 'invalid';
    microphone: 'unknown' | 'checking' | 'valid' | 'invalid';
  };
}

export function useVideoSessionCoordinator(sessionId?: string) {
  const { toast } = useToast();
  const [coordinatorState, setCoordinatorState] = useState<VideoSessionCoordinatorState>({
    phase: 'initializing',
    isReady: false,
    canProceed: false,
    activeError: null,
    deviceValidationStatus: {
      camera: 'unknown',
      microphone: 'unknown'
    }
  });

  const initializationRef = useRef(false);

  // Initialize all subsystems
  const permissionHandler = useUnifiedPermissionHandler();
  const errorHandler = useEnhancedErrorHandling();
  const streamManager = useVideoStreamManager();
  const webrtcConnection = useWebRTCConnection(sessionId);
  const qualityMonitor = useConnectionQualityMonitor(webrtcConnection.peerConnection);

  // Synchronize permission states
  const syncPermissionState = useCallback(() => {
    const { permissionState } = permissionHandler;
    
    if (!permissionState.bothGranted && permissionState.hasRequestedBefore) {
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'error',
        activeError: 'Camera and microphone permissions required',
        canProceed: false
      }));
      return;
    }

    if (permissionState.bothGranted) {
      setCoordinatorState(prev => ({
        ...prev,
        phase: prev.phase === 'checking-permissions' ? 'preparing-devices' : prev.phase
      }));
    }
  }, [permissionHandler]);

  // Synchronize device validation
  const syncDeviceState = useCallback(() => {
    const { localStream, isLocalVideoReady } = streamManager;
    
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      const audioTracks = localStream.getAudioTracks();
      
      setCoordinatorState(prev => ({
        ...prev,
        deviceValidationStatus: {
          camera: videoTracks.length > 0 && videoTracks[0].enabled ? 'valid' : 'invalid',
          microphone: audioTracks.length > 0 && audioTracks[0].enabled ? 'valid' : 'invalid'
        }
      }));

      // If we have valid devices and video is ready, we can proceed
      if (isLocalVideoReady && videoTracks.length > 0 && audioTracks.length > 0) {
        setCoordinatorState(prev => ({
          ...prev,
          phase: 'ready',
          isReady: true,
          canProceed: true
        }));
      }
    }
  }, [streamManager]);

  // Synchronize WebRTC connection state
  const syncConnectionState = useCallback(() => {
    const { isConnecting, isConnected, connectionState } = webrtcConnection;
    
    if (isConnecting) {
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'connecting',
        canProceed: false
      }));
    } else if (isConnected) {
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'connected',
        canProceed: true
      }));
    } else if (connectionState === 'failed') {
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'error',
        activeError: 'Connection failed',
        canProceed: false
      }));
    }
  }, [webrtcConnection]);

  // Initialize the session preparation process
  const initializeSession = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'checking-permissions',
        activeError: null
      }));

      // Step 1: Check and request permissions
      console.log('🎯 Coordinator: Checking permissions...');
      const permissionsGranted = await permissionHandler.requestPermissions();
      
      if (!permissionsGranted) {
        setCoordinatorState(prev => ({
          ...prev,
          phase: 'error',
          activeError: 'Permissions required to continue',
          canProceed: false
        }));
        return false;
      }

      // Step 2: Initialize devices
      console.log('🎯 Coordinator: Initializing devices...');
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'preparing-devices'
      }));

      await streamManager.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: { echoCancellation: true, noiseSuppression: true }
      });

      console.log('✅ Coordinator: Session initialization completed');
      return true;

    } catch (error) {
      console.error('❌ Coordinator: Session initialization failed:', error);
      errorHandler.handleError(error, 'all');
      
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'error',
        activeError: errorHandler.currentError?.message || 'Session preparation failed',
        canProceed: false
      }));

      return false;
    }
  }, [permissionHandler, streamManager, errorHandler, toast]);

  // Start video call
  const startCall = useCallback(async () => {
    if (!coordinatorState.isReady) {
      console.warn('⚠️ Coordinator: Cannot start call - session not ready');
      return false;
    }

    try {
      console.log('📞 Coordinator: Starting video call...');
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'connecting'
      }));

      // Ensure WebRTC has the local stream
      if (streamManager.localStream) {
        await webrtcConnection.addLocalStream(streamManager.localStream);
      }

      const success = await webrtcConnection.initiateCall();
      
      if (!success) {
        setCoordinatorState(prev => ({
          ...prev,
          phase: 'error',
          activeError: 'Failed to start call',
          canProceed: false
        }));
      }

      return success;
    } catch (error) {
      console.error('❌ Coordinator: Failed to start call:', error);
      setCoordinatorState(prev => ({
        ...prev,
        phase: 'error',
        activeError: 'Failed to start call',
        canProceed: false
      }));
      return false;
    }
  }, [coordinatorState.isReady, streamManager, webrtcConnection]);

  // End call and cleanup
  const endCall = useCallback(() => {
    console.log('🔚 Coordinator: Ending call...');
    webrtcConnection.closePeerConnection();
    streamManager.cleanup();
    
    setCoordinatorState({
      phase: 'initializing',
      isReady: false,
      canProceed: false,
      activeError: null,
      deviceValidationStatus: {
        camera: 'unknown',
        microphone: 'unknown'
      }
    });

    initializationRef.current = false;
  }, [webrtcConnection, streamManager]);

  // Reset to initial state
  const resetSession = useCallback(() => {
    console.log('🔄 Coordinator: Resetting session...');
    endCall();
    permissionHandler.resetRecoveryFlow();
    errorHandler.clearError();
  }, [endCall, permissionHandler, errorHandler]);

  // Sync states when subsystems change
  useEffect(() => {
    syncPermissionState();
  }, [syncPermissionState, permissionHandler.permissionState.bothGranted, permissionHandler.permissionState.hasRequestedBefore]);

  useEffect(() => {
    syncDeviceState();
  }, [syncDeviceState, streamManager.localStream, streamManager.isLocalVideoReady]);

  useEffect(() => {
    syncConnectionState();
  }, [syncConnectionState, webrtcConnection.isConnecting, webrtcConnection.isConnected, webrtcConnection.connectionState]);

  return {
    // State
    coordinatorState,
    
    // Subsystem access
    permissionHandler,
    errorHandler,
    streamManager,
    webrtcConnection,
    qualityMonitor,
    
    // Coordinated actions
    initializeSession,
    startCall,
    endCall,
    resetSession,
    
    // Convenience getters
    get isInitializing() { return coordinatorState.phase === 'initializing'; },
    get isCheckingPermissions() { return coordinatorState.phase === 'checking-permissions'; },
    get isPreparingDevices() { return coordinatorState.phase === 'preparing-devices'; },
    get isReady() { return coordinatorState.phase === 'ready'; },
    get isConnecting() { return coordinatorState.phase === 'connecting'; },
    get isConnected() { return coordinatorState.phase === 'connected'; },
    get hasError() { return coordinatorState.phase === 'error'; },
    get canStartCall() { return coordinatorState.isReady && coordinatorState.canProceed; }
  };
}