import { SignalingClient, SignalingMessage } from './signaling-client';
import { iceServerManager, ICEServerConfig } from './ice-server-config';
import { ConnectionMonitor, ConnectionQuality, ConnectionEvent } from './connection-monitor';
import { sessionPersistence } from './session-persistence';
import { supabase } from '@/integrations/supabase/client';

export interface WebRTCConfig extends ICEServerConfig {}

export interface PeerConnectionInfo {
  connection: RTCPeerConnection;
  userId: string;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
  monitor?: ConnectionMonitor;
}

export interface WebRTCManagerOptions {
  sessionId: string;
  userId: string;
  onRemoteStream?: (stream: MediaStream, userId: string) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState, userId: string) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState, userId: string) => void;
  onQualityChange?: (quality: ConnectionQuality, userId: string) => void;
  onConnectionEvent?: (event: ConnectionEvent) => void;
}

export class WebRTCManager {
  private signalingClient: SignalingClient;
  private peerConnections = new Map<string, PeerConnectionInfo>();
  private localStream: MediaStream | null = null;
  private options: WebRTCManagerOptions;
  private config: WebRTCConfig;

  constructor(options: WebRTCManagerOptions) {
    this.options = options;
    this.config = iceServerManager.getConfig();
    
    this.signalingClient = new SignalingClient({
      sessionId: options.sessionId,
      userId: options.userId,
      onMessage: this.handleSignalingMessage.bind(this),
      onUserJoined: this.handleUserJoined.bind(this),
      onUserLeft: this.handleUserLeft.bind(this)
    });
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 [WebRTCManager] Initializing...');
      
      // Initialize ICE server credentials if available
      await iceServerManager.initializeTurnCredentials();
      this.config = iceServerManager.getConfig();

      // Initialize session persistence
      await sessionPersistence.initializeSession(
        this.options.sessionId, 
        this.options.userId
      );

      // Test ICE server connectivity
      const serverHealth = await iceServerManager.getServerHealth();
      console.log('🔧 [WebRTCManager] ICE server health:', serverHealth);

      // Connect to signaling server
      const connected = await this.signalingClient.connect();
      if (!connected) {
        throw new Error('Failed to connect to signaling server');
      }

      console.log('✅ [WebRTCManager] Initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ [WebRTCManager] Initialization failed:', error);
      
      // Log the error to database
      await this.logConnectionEvent('error', {
        type: 'initialization_failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      return false;
    }
  }

  async getLocalStream(constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream | null> {
    try {
      if (this.localStream) {
        // Stop existing stream
        this.localStream.getTracks().forEach(track => track.stop());
      }

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('📹 [WebRTCManager] Local stream acquired');
      
      // Add tracks to all existing peer connections
      this.peerConnections.forEach((peerInfo) => {
        this.addStreamToPeerConnection(peerInfo.connection, this.localStream!);
      });

      return this.localStream;
    } catch (error) {
      console.error('❌ [WebRTCManager] Failed to get local stream:', error);
      return null;
    }
  }

  private createPeerConnection(userId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(this.config);
    
    // Set up connection monitoring
    const monitor = new ConnectionMonitor(pc, userId, this.options.sessionId, {
      onQualityChange: (quality) => {
        console.log('📊 [WebRTCManager] Quality changed for', userId, ':', quality.overall);
        this.options.onQualityChange?.(quality, userId);
        
        // Update session persistence
        sessionPersistence.updateQuality(quality);
        
        // Log to database
        this.logConnectionEvent('quality_change', {
          quality: quality.overall,
          details: quality.details,
          peerUserId: userId
        });
      },
      onConnectionEvent: (event) => {
        console.log('📡 [WebRTCManager] Connection event:', event.eventType, 'for', userId);
        this.options.onConnectionEvent?.(event);
      },
      onStatsUpdate: (stats) => {
        // Update session persistence with connection states
        sessionPersistence.updateConnectionState(userId, stats.connectionState, stats.iceConnectionState);
      }
    });
    
    // Set up event handlers
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 [WebRTCManager] ICE candidate generated for', userId);
        this.signalingClient.sendIceCandidate(event.candidate.toJSON(), userId);
      }
    };

    pc.ontrack = (event) => {
      console.log('📺 [WebRTCManager] Remote track received from', userId);
      const [remoteStream] = event.streams;
      
      const peerInfo = this.peerConnections.get(userId);
      if (peerInfo) {
        peerInfo.remoteStream = remoteStream;
        peerInfo.monitor = monitor;
        this.options.onRemoteStream?.(remoteStream, userId);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('🔗 [WebRTCManager] Connection state changed:', pc.connectionState, 'for', userId);
      this.options.onConnectionStateChange?.(pc.connectionState, userId);
      
      // Handle connection failures
      if (pc.connectionState === 'failed') {
        this.handleConnectionFailure(userId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 [WebRTCManager] ICE connection state changed:', pc.iceConnectionState, 'for', userId);
      this.options.onIceConnectionStateChange?.(pc.iceConnectionState, userId);
    };

    return pc;
  }

  private async handleConnectionFailure(userId: string): Promise<void> {
    console.warn('⚠️ [WebRTCManager] Connection failed for user:', userId);
    
    // Record disconnection for recovery
    await sessionPersistence.recordDisconnection('connection_failed');
    
    // Log the failure
    await this.logConnectionEvent('connection_state_change', {
      type: 'connection_failed',
      peerUserId: userId,
      state: 'failed'
    });

    // Attempt to recover connection after a delay
    setTimeout(() => {
      this.attemptReconnection(userId);
    }, 3000);
  }

  private async attemptReconnection(userId: string): Promise<void> {
    try {
      console.log('🔄 [WebRTCManager] Attempting reconnection to:', userId);
      
      // Close existing connection
      const peerInfo = this.peerConnections.get(userId);
      if (peerInfo) {
        peerInfo.connection.close();
        peerInfo.monitor?.destroy();
        this.peerConnections.delete(userId);
      }

      // Re-add participant to session persistence
      await sessionPersistence.addParticipant(userId);

      // Trigger new connection attempt
      await this.handleUserJoined(userId);
      
      console.log('✅ [WebRTCManager] Reconnection attempt completed for:', userId);
    } catch (error) {
      console.error('❌ [WebRTCManager] Reconnection failed for:', userId, error);
      
      await this.logConnectionEvent('error', {
        type: 'reconnection_failed',
        peerUserId: userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private addStreamToPeerConnection(pc: RTCPeerConnection, stream: MediaStream): void {
    // Remove existing senders first
    pc.getSenders().forEach(sender => {
      pc.removeTrack(sender);
    });

    // Add new tracks
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });
  }

  private async handleUserJoined(userId: string): Promise<void> {
    console.log('👋 [WebRTCManager] User joined:', userId);
    
    // Don't create connection to ourselves
    if (userId === this.options.userId) return;

    // Add participant to session persistence
    await sessionPersistence.addParticipant(userId);

    // Check if we already have a connection to this user
    if (this.peerConnections.has(userId)) {
      console.log('🔄 [WebRTCManager] Connection already exists for', userId);
      return;
    }

    // Create peer connection for new user
    const pc = this.createPeerConnection(userId);
    this.peerConnections.set(userId, { connection: pc, userId });

    // Add local stream if available
    if (this.localStream) {
      this.addStreamToPeerConnection(pc, this.localStream);
    }

    // Only create offer if our userId is "greater" than theirs (prevents duplicate offers)
    // This ensures only one side initiates the connection
    if (this.options.userId > userId) {
      try {
        console.log('📝 [WebRTCManager] Creating offer for', userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        await this.signalingClient.sendOffer(offer, userId);
        console.log('📤 [WebRTCManager] Offer sent to', userId);

        // Log the offer creation
        await this.logConnectionEvent('connection_state_change', {
          type: 'offer_created',
          peerUserId: userId
        });
      } catch (error) {
        console.error('❌ [WebRTCManager] Failed to create offer for', userId, error);
        
        await this.logConnectionEvent('error', {
          type: 'offer_creation_failed',
          peerUserId: userId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    } else {
      console.log('⏳ [WebRTCManager] Waiting for offer from', userId);
    }
  }

  private async handleUserLeft(userId: string): Promise<void> {
    console.log('👋 [WebRTCManager] User left:', userId);
    
    const peerInfo = this.peerConnections.get(userId);
    if (peerInfo) {
      peerInfo.connection.close();
      peerInfo.monitor?.destroy();
      this.peerConnections.delete(userId);
    }

    // Remove from session persistence
    await sessionPersistence.removeParticipant(userId);

    // Log the user leaving
    await this.logConnectionEvent('connection_state_change', {
      type: 'user_left',
      peerUserId: userId
    });
  }

  private async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    const { senderId, type, payload, targetId } = message;
    
    // Only process messages targeted to us or broadcast messages
    if (targetId && targetId !== this.options.userId) {
      return;
    }
    
    console.log('📨 [WebRTCManager] Signaling message received:', { type, senderId });

    // Get or create peer connection
    let peerInfo = this.peerConnections.get(senderId);
    if (!peerInfo) {
      console.log('🆕 [WebRTCManager] Creating new peer connection for', senderId);
      const pc = this.createPeerConnection(senderId);
      peerInfo = { connection: pc, userId: senderId };
      this.peerConnections.set(senderId, peerInfo);
      
      // Add local stream if available
      if (this.localStream) {
        this.addStreamToPeerConnection(pc, this.localStream);
      }
    }

    const pc = peerInfo.connection;

    try {
      switch (type) {
        case 'offer':
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await this.signalingClient.sendAnswer(answer, senderId);
          console.log('📤 [WebRTCManager] Answer sent to', senderId);
          break;

        case 'answer':
          await pc.setRemoteDescription(new RTCSessionDescription(payload));
          console.log('✅ [WebRTCManager] Answer processed from', senderId);
          break;

        case 'ice-candidate':
          await pc.addIceCandidate(new RTCIceCandidate(payload));
          console.log('🧊 [WebRTCManager] ICE candidate added from', senderId);
          break;
      }
    } catch (error) {
      console.error('❌ [WebRTCManager] Error handling signaling message:', error);
    }
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('📹 [WebRTCManager] Video toggled:', videoTrack.enabled);
      return videoTrack.enabled;
    }
    return false;
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('🎤 [WebRTCManager] Audio toggled:', audioTrack.enabled);
      return audioTrack.enabled;
    }
    return false;
  }

  getConnectionStates(): Record<string, RTCPeerConnectionState> {
    const states: Record<string, RTCPeerConnectionState> = {};
    this.peerConnections.forEach((peerInfo, userId) => {
      states[userId] = peerInfo.connection.connectionState;
    });
    return states;
  }

  getCurrentLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStreams(): Record<string, MediaStream> {
    const streams: Record<string, MediaStream> = {};
    this.peerConnections.forEach((peerInfo, userId) => {
      if (peerInfo.remoteStream) {
        streams[userId] = peerInfo.remoteStream;
      }
    });
    return streams;
  }

  async destroy(): Promise<void> {
    console.log('🧹 [WebRTCManager] Destroying...');
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Close all peer connections and destroy monitors
    this.peerConnections.forEach(peerInfo => {
      peerInfo.connection.close();
      peerInfo.monitor?.destroy();
    });
    this.peerConnections.clear();

    // End session persistence
    await sessionPersistence.endSession();

    // Disconnect signaling
    this.signalingClient.disconnect();

    // Log session end
    await this.logConnectionEvent('connection_state_change', {
      type: 'session_ended'
    });
    
    console.log('✅ [WebRTCManager] Destroyed');
  }

  // Helper method to log connection events to the database
  private async logConnectionEvent(eventType: string, data: any): Promise<void> {
    try {
      const { error } = await supabase
        .from('webrtc_connection_logs')
        .insert({
          session_id: this.options.sessionId,
          user_id: this.options.userId,
          peer_user_id: data.peerUserId || this.options.userId,
          event_type: eventType,
          connection_state: data.state || null,
          ice_state: data.iceState || null,
          quality_score: data.quality === 'excellent' ? 5 :
                        data.quality === 'good' ? 4 :
                        data.quality === 'fair' ? 3 :
                        data.quality === 'poor' ? 2 :
                        data.quality === 'disconnected' ? 1 : null,
          bandwidth: data.details?.bandwidth || null,
          latency: data.details?.latency || null,
          packet_loss: data.details?.packetLoss || null,
          jitter: data.details?.jitter || null,
          details: data
        });

      if (error) {
        console.error('❌ [WebRTCManager] Failed to log connection event:', error);
      }
    } catch (error) {
      console.error('❌ [WebRTCManager] Error logging connection event:', error);
    }
  }

  // Get current connection quality for all peers
  getCurrentQuality(): Record<string, ConnectionQuality | null> {
    const qualities: Record<string, ConnectionQuality | null> = {};
    
    this.peerConnections.forEach((peerInfo, userId) => {
      qualities[userId] = peerInfo.monitor?.getCurrentQuality() || null;
    });

    return qualities;
  }

  // Get average connection quality for all peers
  getAverageQuality(periodMinutes = 5): Record<string, ConnectionQuality | null> {
    const qualities: Record<string, ConnectionQuality | null> = {};
    
    this.peerConnections.forEach((peerInfo, userId) => {
      qualities[userId] = peerInfo.monitor?.getAverageQuality(periodMinutes) || null;
    });

    return qualities;
  }
}