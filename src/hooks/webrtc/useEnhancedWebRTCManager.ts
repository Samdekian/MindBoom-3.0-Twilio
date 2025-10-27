// Enhanced WebRTC Manager with Connection Pool Integration
import { useState, useEffect, useRef, useCallback } from 'react';
import { useOptimizedRealtime } from '../useOptimizedRealtime';
import { ConnectionPool } from '@/lib/connection/ConnectionPool';
import { useToast } from '../use-toast';

interface WebRTCConnectionState {
  peerConnection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  signalingState: RTCSignalingState;
}

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'connection-state';
  content: any;
  senderId: string;
  timestamp: number;
}

export const useEnhancedWebRTCManager = (sessionId: string) => {
  const { toast } = useToast();
  const connectionPool = ConnectionPool.getInstance();
  
  const [connectionState, setConnectionState] = useState<WebRTCConnectionState>({
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    connectionState: 'new',
    iceConnectionState: 'new',
    signalingState: 'stable'
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'disconnected'>('disconnected');
  
  const messageQueueRef = useRef<SignalingMessage[]>([]);
  const statsIntervalRef = useRef<NodeJS.Timeout>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Use optimized realtime with high priority for signaling
  const {
    isConnected: signalingConnected,
    isDegraded: signalingDegraded,
    on: onSignaling,
    send: sendSignaling,
    connect: connectSignaling
  } = useOptimizedRealtime(`webrtc-${sessionId}`, {
    priority: 'high',
    lazy: false,
    gracefulDegradation: true
  });

  // WebRTC Configuration with optimized settings
  const rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ],
    iceTransportPolicy: 'all',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require'
  };

  // Initialize WebRTC connection
  const initializePeerConnection = useCallback(() => {
    try {
      const pc = new RTCPeerConnection(rtcConfig);
      
      // Connection state monitoring
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`🎥 [WebRTC] Connection state: ${state}`);
        
        setConnectionState(prev => ({ ...prev, connectionState: state }));
        
        switch (state) {
          case 'connected':
            setConnectionQuality('excellent');
            reconnectAttempts.current = 0;
            startQualityMonitoring();
            break;
          case 'disconnected':
            setConnectionQuality('disconnected');
            handleDisconnection();
            break;
          case 'failed':
            setConnectionQuality('disconnected');
            handleConnectionFailure();
            break;
        }
      };

      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        console.log(`🎥 [WebRTC] ICE connection state: ${state}`);
        setConnectionState(prev => ({ ...prev, iceConnectionState: state }));
      };

      pc.onsignalingstatechange = () => {
        const state = pc.signalingState;
        console.log(`🎥 [WebRTC] Signaling state: ${state}`);
        setConnectionState(prev => ({ ...prev, signalingState: state }));
      };

      // Stream handling
      pc.ontrack = (event) => {
        console.log('🎥 [WebRTC] Remote stream received');
        setConnectionState(prev => ({ ...prev, remoteStream: event.streams[0] }));
      };

      // ICE candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const message: SignalingMessage = {
            type: 'ice-candidate',
            content: event.candidate.toJSON(),
            senderId: 'local',
            timestamp: Date.now()
          };
          
          if (signalingConnected) {
            sendSignaling('webrtc-signal', message);
          } else {
            messageQueueRef.current.push(message);
          }
        }
      };

      setConnectionState(prev => ({ ...prev, peerConnection: pc }));
      setIsInitialized(true);
      
      return pc;
    } catch (error) {
      console.error('🎥 [WebRTC] Failed to initialize peer connection:', error);
      toast({
        title: "WebRTC Error",
        description: "Failed to initialize video connection",
        variant: "destructive"
      });
      return null;
    }
  }, [signalingConnected, sendSignaling, toast]);

  // Handle signaling messages with queuing
  const handleSignalingMessage = useCallback(async (message: SignalingMessage) => {
    const { peerConnection } = connectionState;
    
    if (!peerConnection) {
      console.warn('🎥 [WebRTC] No peer connection for signaling message');
      return;
    }

    try {
      switch (message.type) {
        case 'offer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.content));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          sendSignaling('webrtc-signal', {
            type: 'answer',
            content: answer,
            senderId: 'local',
            timestamp: Date.now()
          });
          break;

        case 'answer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(message.content));
          break;

        case 'ice-candidate':
          await peerConnection.addIceCandidate(new RTCIceCandidate(message.content));
          break;
      }
    } catch (error) {
      console.error('🎥 [WebRTC] Error handling signaling message:', error);
    }
  }, [connectionState, sendSignaling]);

  // Process queued messages when signaling reconnects
  const processMessageQueue = useCallback(() => {
    if (signalingConnected && messageQueueRef.current.length > 0) {
      console.log(`🎥 [WebRTC] Processing ${messageQueueRef.current.length} queued messages`);
      
      messageQueueRef.current.forEach(message => {
        sendSignaling('webrtc-signal', message);
      });
      
      messageQueueRef.current = [];
    }
  }, [signalingConnected, sendSignaling]);

  // Connection quality monitoring
  const startQualityMonitoring = useCallback(() => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
    }

    statsIntervalRef.current = setInterval(async () => {
      const { peerConnection } = connectionState;
      if (!peerConnection) return;

      try {
        const stats = await peerConnection.getStats();
        let bytesReceived = 0;
        let bytesSent = 0;
        let packetsLost = 0;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp') {
            bytesReceived += report.bytesReceived || 0;
            packetsLost += report.packetsLost || 0;
          } else if (report.type === 'outbound-rtp') {
            bytesSent += report.bytesSent || 0;
          }
        });

        // Simple quality assessment
        if (packetsLost > 100) {
          setConnectionQuality('poor');
        } else if (packetsLost > 10) {
          setConnectionQuality('good');
        } else {
          setConnectionQuality('excellent');
        }

      } catch (error) {
        console.warn('🎥 [WebRTC] Stats collection failed:', error);
      }
    }, 5000);
  }, [connectionState]);

  // Handle disconnection with smart reconnect
  const handleDisconnection = useCallback(() => {
    console.log('🎥 [WebRTC] Connection disconnected, attempting recovery');
    
    if (reconnectAttempts.current < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttempts.current++;
        console.log(`🎥 [WebRTC] Reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
        
        // Reinitialize connection
        initializePeerConnection();
      }, delay);
    } else {
      toast({
        title: "Connection Lost",
        description: "Unable to restore video connection. Please refresh.",
        variant: "destructive"
      });
    }
  }, [initializePeerConnection, toast]);

  const handleConnectionFailure = useCallback(() => {
    console.error('🎥 [WebRTC] Connection failed permanently');
    setConnectionQuality('disconnected');
    
    toast({
      title: "Video Connection Failed",
      description: "Please check your network and try again",
      variant: "destructive"
    });
  }, [toast]);

  // Set up signaling listeners
  useEffect(() => {
    if (signalingConnected) {
      onSignaling('webrtc-signal', handleSignalingMessage);
      processMessageQueue();
    }
  }, [signalingConnected, onSignaling, handleSignalingMessage, processMessageQueue]);

  // Initialize on mount
  useEffect(() => {
    initializePeerConnection();
    
    return () => {
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      const { peerConnection } = connectionState;
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, []);

  // Create offer
  const createOffer = useCallback(async () => {
    const { peerConnection } = connectionState;
    if (!peerConnection) return false;

    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      const message: SignalingMessage = {
        type: 'offer',
        content: offer,
        senderId: 'local',
        timestamp: Date.now()
      };

      if (signalingConnected) {
        sendSignaling('webrtc-signal', message);
      } else {
        messageQueueRef.current.push(message);
      }
      
      return true;
    } catch (error) {
      console.error('🎥 [WebRTC] Failed to create offer:', error);
      return false;
    }
  }, [connectionState, signalingConnected, sendSignaling]);

  // Add local stream
  const addLocalStream = useCallback(async (stream: MediaStream) => {
    const { peerConnection } = connectionState;
    if (!peerConnection) return false;

    try {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      setConnectionState(prev => ({ ...prev, localStream: stream }));
      return true;
    } catch (error) {
      console.error('🎥 [WebRTC] Failed to add local stream:', error);
      return false;
    }
  }, [connectionState]);

  return {
    ...connectionState,
    isInitialized,
    connectionQuality,
    signalingConnected,
    signalingDegraded,
    createOffer,
    addLocalStream,
    metrics: connectionPool.getMetrics()
  };
};