
import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useWebRTCSignaling } from './useWebRTCSignaling';
import { useVideoStreamManager } from './useVideoStreamManager';

export interface WebRTCConnectionState {
  peerConnection: RTCPeerConnection | null;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
}

export function useWebRTCConnection(sessionId?: string) {
  const { toast } = useToast();
  const [state, setState] = useState<WebRTCConnectionState>({
    peerConnection: null,
    connectionState: 'new',
    iceConnectionState: 'new',
    isConnected: false,
    isConnecting: false
  });

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const {
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    isLocalVideoReady,
    isRemoteVideoReady,
    setLocalStream,
    setRemoteStream,
    getUserMedia,
    cleanup: cleanupStreams
  } = useVideoStreamManager();

  // Handle remote stream from signaling
  const handleRemoteStream = useCallback((stream: MediaStream) => {
    console.log('📺 Received remote stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
    setRemoteStream(stream);
  }, [setRemoteStream]);

  // Set up signaling
  const { 
    signalingState, 
    currentSignalingState, 
    initiateCall: signalingInitiateCall, 
    reset: resetSignaling 
  } = useWebRTCSignaling({
    sessionId: sessionId || '',
    peerConnection: peerConnectionRef.current,
    onRemoteStream: handleRemoteStream
  });

  // Create peer connection
  const createPeerConnection = useCallback((): RTCPeerConnection | null => {
    try {
      // Close existing connection
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      });

      // Set up event handlers
      pc.oniceconnectionstatechange = () => {
        console.log('🧊 ICE connection state:', pc.iceConnectionState);
        setState(prev => ({
          ...prev,
          iceConnectionState: pc.iceConnectionState,
          isConnected: pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed',
          isConnecting: pc.iceConnectionState === 'checking'
        }));

        // Show connection status
        if (pc.iceConnectionState === 'connected') {
          toast({
            title: "Connected",
            description: "Video call connected successfully",
          });
        } else if (pc.iceConnectionState === 'failed') {
          toast({
            title: "Connection Failed",
            description: "Video connection failed",
            variant: "destructive"
          });
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('🔗 Connection state:', pc.connectionState);
        setState(prev => ({
          ...prev,
          connectionState: pc.connectionState
        }));
      };

      peerConnectionRef.current = pc;
      setState(prev => ({ ...prev, peerConnection: pc }));
      
      console.log('✅ Peer connection created');
      return pc;
    } catch (error) {
      console.error('❌ Error creating peer connection:', error);
      toast({
        title: "Connection Error",
        description: "Failed to create peer connection",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Add local stream to peer connection
  const addLocalStream = useCallback(async (stream: MediaStream): Promise<void> => {
    let pc = peerConnectionRef.current;
    if (!pc) {
      console.log('🔧 Creating peer connection for stream addition');
      pc = createPeerConnection();
      if (!pc) {
        throw new Error('Failed to create peer connection');
      }
    }
    
    if (!stream) {
      throw new Error('Cannot add stream: missing stream');
    }

    try {
      console.log('➕ Adding local stream to peer connection, tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      // Remove any existing tracks first
      const senders = pc.getSenders();
      for (const sender of senders) {
        if (sender.track) {
          console.log('🗑️ Removing existing track:', sender.track.kind);
          pc.removeTrack(sender);
        }
      }
      
      // Add all tracks from the stream
      stream.getTracks().forEach(track => {
        console.log('➕ Adding track:', track.kind, 'enabled:', track.enabled);
        pc.addTrack(track, stream);
      });
      
      console.log('✅ Local stream added to peer connection');
    } catch (error) {
      console.error('❌ Error adding local stream:', error);
      throw error;
    }
  }, [createPeerConnection]);

  // Start local media and add to peer connection
  const startLocalMedia = useCallback(async (constraints?: MediaStreamConstraints): Promise<MediaStream | null> => {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await getUserMedia(constraints || defaultConstraints);
      
      if (stream) {
        await addLocalStream(stream);
      }
      
      return stream;
    } catch (error) {
      console.error('❌ Error starting local media:', error);
      throw error;
    }
  }, [getUserMedia, addLocalStream]);

  // Initiate call with retry logic
  const initiateCall = useCallback(async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isConnecting: true }));
      
      // Ensure we have a peer connection
      if (!peerConnectionRef.current) {
        createPeerConnection();
      }

      // Ensure we have local media
      if (!localStream) {
        console.log('🎥 Starting local media before call');
        await startLocalMedia();
      }

      const success = await signalingInitiateCall();
      
      if (!success) {
        setState(prev => ({ ...prev, isConnecting: false }));
      }
      
      return success;
    } catch (error) {
      console.error('❌ Error initiating call:', error);
      setState(prev => ({ ...prev, isConnecting: false }));
      return false;
    }
  }, [localStream, startLocalMedia, signalingInitiateCall, createPeerConnection]);

  // Close peer connection and cleanup
  const closePeerConnection = useCallback(() => {
    console.log('🔒 Closing peer connection');
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    cleanupStreams();
    resetSignaling();
    
    setState({
      peerConnection: null,
      connectionState: 'new',
      iceConnectionState: 'new',
      isConnected: false,
      isConnecting: false
    });
  }, [cleanupStreams, resetSignaling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      closePeerConnection();
    };
  }, [closePeerConnection]);

  return {
    ...state,
    localStream,
    remoteStream,
    localVideoRef,
    remoteVideoRef,
    isLocalVideoReady,
    isRemoteVideoReady,
    signalingState,
    currentSignalingState,
    createPeerConnection,
    startLocalMedia,
    initiateCall,
    closePeerConnection,
    addLocalStream
  };
}
