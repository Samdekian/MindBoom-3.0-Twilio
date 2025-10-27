import { WebRTCConfig } from './webrtc-manager';

export interface PeerConnectionEvents {
  onIceCandidate: (candidate: RTCIceCandidate, userId: string) => void;
  onRemoteTrack: (stream: MediaStream, userId: string) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState, userId: string) => void;
  onIceConnectionStateChange: (state: RTCIceConnectionState, userId: string) => void;
}

export class PeerConnectionManager {
  private peerConnections = new Map<string, RTCPeerConnection>();
  private config: WebRTCConfig;
  private events: PeerConnectionEvents;

  constructor(config: WebRTCConfig, events: PeerConnectionEvents) {
    this.config = config;
    this.events = events;
  }

  createPeerConnection(userId: string): RTCPeerConnection {
    if (this.peerConnections.has(userId)) {
      this.closePeerConnection(userId);
    }

    console.log('🔗 [PeerConnectionManager] Creating peer connection for:', userId);
    
    const pc = new RTCPeerConnection(this.config);
    
    // Set up event handlers
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 [PeerConnectionManager] ICE candidate for:', userId);
        this.events.onIceCandidate(event.candidate, userId);
      }
    };

    pc.ontrack = (event) => {
      console.log('📺 [PeerConnectionManager] Remote track received from:', userId);
      const [remoteStream] = event.streams;
      this.events.onRemoteTrack(remoteStream, userId);
    };

    pc.onconnectionstatechange = () => {
      console.log('🔗 [PeerConnectionManager] Connection state changed:', pc.connectionState, 'for:', userId);
      this.events.onConnectionStateChange(pc.connectionState, userId);
      
      // Auto-cleanup failed connections
      if (pc.connectionState === 'failed') {
        setTimeout(() => this.closePeerConnection(userId), 5000);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('🧊 [PeerConnectionManager] ICE connection state changed:', pc.iceConnectionState, 'for:', userId);
      this.events.onIceConnectionStateChange(pc.iceConnectionState, userId);
    };

    pc.onicegatheringstatechange = () => {
      console.log('🔍 [PeerConnectionManager] ICE gathering state changed:', pc.iceGatheringState, 'for:', userId);
    };

    pc.onsignalingstatechange = () => {
      console.log('📡 [PeerConnectionManager] Signaling state changed:', pc.signalingState, 'for:', userId);
    };

    this.peerConnections.set(userId, pc);
    return pc;
  }

  getPeerConnection(userId: string): RTCPeerConnection | null {
    return this.peerConnections.get(userId) || null;
  }

  closePeerConnection(userId: string): void {
    const pc = this.peerConnections.get(userId);
    if (pc) {
      console.log('🔒 [PeerConnectionManager] Closing peer connection for:', userId);
      pc.close();
      this.peerConnections.delete(userId);
    }
  }

  addStreamToPeerConnection(userId: string, stream: MediaStream): boolean {
    const pc = this.peerConnections.get(userId);
    if (!pc) {
      console.warn('⚠️ [PeerConnectionManager] No peer connection found for:', userId);
      return false;
    }

    try {
      // Remove existing senders first
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          pc.removeTrack(sender);
        }
      });

      // Add new tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
        console.log('📤 [PeerConnectionManager] Track added:', track.kind, 'to:', userId);
      });

      return true;
    } catch (error) {
      console.error('❌ [PeerConnectionManager] Failed to add stream:', error);
      return false;
    }
  }

  replaceTrack(userId: string, track: MediaStreamTrack): boolean {
    const pc = this.peerConnections.get(userId);
    if (!pc) {
      console.warn('⚠️ [PeerConnectionManager] No peer connection found for:', userId);
      return false;
    }

    try {
      const senders = pc.getSenders();
      const sender = senders.find(s => s.track && s.track.kind === track.kind);
      
      if (sender) {
        sender.replaceTrack(track);
        console.log('🔄 [PeerConnectionManager] Track replaced:', track.kind, 'for:', userId);
        return true;
      } else {
        console.warn('⚠️ [PeerConnectionManager] No sender found for track kind:', track.kind);
        return false;
      }
    } catch (error) {
      console.error('❌ [PeerConnectionManager] Failed to replace track:', error);
      return false;
    }
  }

  getAllConnectionStates(): Record<string, RTCPeerConnectionState> {
    const states: Record<string, RTCPeerConnectionState> = {};
    this.peerConnections.forEach((pc, userId) => {
      states[userId] = pc.connectionState;
    });
    return states;
  }

  closeAllConnections(): void {
    console.log('🧹 [PeerConnectionManager] Closing all peer connections');
    this.peerConnections.forEach((pc, userId) => {
      this.closePeerConnection(userId);
    });
  }

  getConnectionCount(): number {
    return this.peerConnections.size;
  }
}