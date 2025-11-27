import { useState, useCallback, useEffect, useRef } from 'react';
import { WebRTCManager, WebRTCManagerOptions } from '@/lib/webrtc/webrtc-manager';
import { useToast } from '@/hooks/use-toast';

interface UseWebRTCManagerOptions {
  sessionId: string;
  userId: string;
  enabled?: boolean;
}

export function useWebRTCManager({ sessionId, userId, enabled = true }: UseWebRTCManagerOptions) {
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionState, setConnectionState] = useState<'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED'>('IDLE');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [connectionStates, setConnectionStates] = useState<Record<string, RTCPeerConnectionState>>({});

  const webrtcManagerRef = useRef<WebRTCManager | null>(null);
  
  // Throttling refs for logging to prevent spam
  const remoteStreamLogsRef = useRef<Map<string, string>>(new Map());
  const connectionStateLogsRef = useRef<Map<string, string>>(new Map());

  // Initialize WebRTC Manager
  const initialize = useCallback(async (): Promise<boolean> => {
    if (!enabled || webrtcManagerRef.current || !sessionId || !userId) {
      return false;
    }

    try {
      console.log('🚀 [useWebRTCManager] Initializing WebRTC Manager...');
      setConnectionState('CONNECTING');

      const options: WebRTCManagerOptions = {
        sessionId,
        userId,
        onRemoteStream: (stream: MediaStream, remoteUserId: string) => {
          // Validate stream has active tracks
          const hasActiveVideo = stream.getVideoTracks().some(track => track.readyState === 'live' && track.enabled);
          const hasActiveAudio = stream.getAudioTracks().some(track => track.readyState === 'live' && track.enabled);
          
          // Throttled logging - only log significant changes
          const streamKey = `${stream.id}-${hasActiveVideo}-${hasActiveAudio}`;
          const lastLoggedStream = remoteStreamLogsRef.current.get(remoteUserId);
          
          if (lastLoggedStream !== streamKey) {
            console.log('📺 [useWebRTCManager] Remote stream from:', remoteUserId, '- Video:', hasActiveVideo, 'Audio:', hasActiveAudio);
            remoteStreamLogsRef.current.set(remoteUserId, streamKey);
          }
          
          setRemoteStreams(prev => {
            const newStreams = { ...prev, [remoteUserId]: stream };
            
            // Update connection state to CONNECTED only when we have media flow
            if (hasActiveVideo || hasActiveAudio) {
              setConnectionState('CONNECTED');
              if (lastLoggedStream !== streamKey) {
                console.log('✅ [useWebRTCManager] Connected with media flow');
              }
            }
            
            return newStreams;
          });
        },
        onConnectionStateChange: (state: RTCPeerConnectionState, remoteUserId: string) => {
          // Throttled connection state logging
          const lastLoggedState = connectionStateLogsRef.current.get(remoteUserId);
          if (lastLoggedState !== state) {
            console.log('🔗 [useWebRTCManager] Connection:', state, 'for', remoteUserId);
            connectionStateLogsRef.current.set(remoteUserId, state);
          }
          
          setConnectionStates(prevStates => {
            const newStates = { ...prevStates, [remoteUserId]: state };
            
            // Update overall connection state based on any connected peer
            const allStates = Object.values(newStates);
            if (allStates.some(s => s === 'connected')) {
              setConnectionState('CONNECTED');
            } else if (allStates.some(s => s === 'connecting')) {
              setConnectionState('CONNECTING');
            } else if (allStates.some(s => s === 'failed')) {
              setConnectionState('FAILED');
            } else {
              setConnectionState('DISCONNECTED');
            }
            
            return newStates;
          });
        },
        onIceConnectionStateChange: (state: RTCIceConnectionState, remoteUserId: string) => {
          // Minimal ICE logging - only for critical states
          if (state === 'failed' || state === 'disconnected') {
            console.warn('🧊 [useWebRTCManager] ICE:', state, 'for', remoteUserId);
          }
        }
      };

      const manager = new WebRTCManager(options);
      const success = await manager.initialize();
      
      if (success) {
        webrtcManagerRef.current = manager;
        setIsInitialized(true);
        // Don't set as CONNECTED until we have actual media flow
        setConnectionState('IDLE');
        console.log('✅ [useWebRTCManager] WebRTC Manager initialized successfully');
        return true;
      } else {
        throw new Error('Failed to initialize WebRTC Manager');
      }
    } catch (error) {
      console.error('❌ [useWebRTCManager] Initialization failed:', error);
      setConnectionState('FAILED');
      toast({
        title: "Connection Failed",
        description: "Failed to initialize video connection",
        variant: "destructive"
      });
      return false;
    }
  }, [enabled, sessionId, userId, toast]);

  // Get local stream and start WebRTC connection
  const startSession = useCallback(async (constraints?: MediaStreamConstraints): Promise<boolean> => {
    if (!webrtcManagerRef.current) {
      console.error('❌ [useWebRTCManager] WebRTC Manager not initialized');
      return false;
    }

    try {
      console.log('🎬 [useWebRTCManager] Starting session with local stream...');
      const stream = await webrtcManagerRef.current.getLocalStream(constraints);
      
      if (stream) {
        setLocalStream(stream);
        console.log('✅ [useWebRTCManager] Local stream acquired, session ready');
        return true;
      } else {
        throw new Error('Failed to get local stream');
      }
    } catch (error) {
      console.error('❌ [useWebRTCManager] Failed to start session:', error);
      toast({
        title: "Media Error",
        description: "Unable to access camera or microphone",
        variant: "destructive"
      });
      return false;
    }
  }, [toast]);

  // Toggle video
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    if (!webrtcManagerRef.current) return false;
    return await webrtcManagerRef.current.toggleVideo();
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(async (): Promise<boolean> => {
    if (!webrtcManagerRef.current) return false;
    return await webrtcManagerRef.current.toggleAudio();
  }, []);

  // Get current connection states
  const getCurrentConnectionStates = useCallback((): Record<string, RTCPeerConnectionState> => {
    if (!webrtcManagerRef.current) return {};
    return webrtcManagerRef.current.getConnectionStates();
  }, []);

  // Cleanup
  const destroy = useCallback(async () => {
    if (webrtcManagerRef.current) {
      console.log('🧹 [useWebRTCManager] Destroying WebRTC Manager...');
      await webrtcManagerRef.current.destroy();
      webrtcManagerRef.current = null;
    }
    
    setIsInitialized(false);
    setConnectionState('IDLE');
    setLocalStream(null);
    setRemoteStreams({});
    setConnectionStates({});
  }, []);

  // Cleanup on unmount or when disabled
  useEffect(() => {
    return () => {
      if (webrtcManagerRef.current) {
        webrtcManagerRef.current.destroy();
      }
    };
  }, []);

  // Auto-initialize when enabled and dependencies are ready
  useEffect(() => {
    if (enabled && sessionId && userId && !isInitialized) {
      initialize();
    }
  }, [enabled, sessionId, userId, isInitialized, initialize]);

  return {
    // State
    isInitialized,
    connectionState,
    localStream,
    remoteStreams,
    connectionStates,
    
    // Actions
    initialize,
    startSession,
    toggleVideo,
    toggleAudio,
    destroy,
    getCurrentConnectionStates,
    
    // Manager reference (for advanced usage)
    manager: webrtcManagerRef.current
  };
}