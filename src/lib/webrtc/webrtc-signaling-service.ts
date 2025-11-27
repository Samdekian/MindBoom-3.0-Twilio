import { SignalingClient, SignalingMessage } from './signaling-client';
import { PeerConnectionManager } from './peer-connection-manager';
import { MediaStreamRouter } from './media-stream-router';

export interface WebRTCSignalingServiceOptions {
  sessionId: string;
  userId: string;
  onRemoteStream?: (stream: MediaStream, userId: string) => void;
  onConnectionStateChange?: (state: RTCPeerConnectionState, userId: string) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState, userId: string) => void;
  onError?: (error: Error) => void;
}

export class WebRTCSignalingService {
  private signalingClient: SignalingClient;
  private peerConnectionManager: PeerConnectionManager;
  private mediaStreamRouter: MediaStreamRouter;
  private options: WebRTCSignalingServiceOptions;
  
  // Offer/Answer race condition prevention
  private pendingOffers = new Set<string>();
  private processedAnswers = new Set<string>();

  constructor(options: WebRTCSignalingServiceOptions) {
    this.options = options;

    // Initialize signaling client
    this.signalingClient = new SignalingClient({
      sessionId: options.sessionId,
      userId: options.userId,
      onMessage: this.handleSignalingMessage.bind(this),
      onUserJoined: this.handleUserJoined.bind(this),
      onUserLeft: this.handleUserLeft.bind(this)
    });

    // Initialize peer connection manager
    this.peerConnectionManager = new PeerConnectionManager(
      {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      },
      {
        onIceCandidate: (candidate, userId) => {
          this.signalingClient.sendIceCandidate(candidate.toJSON(), userId);
        },
        onRemoteTrack: (stream, userId) => {
          this.mediaStreamRouter.setRemoteStream(userId, stream);
          this.options.onRemoteStream?.(stream, userId);
        },
        onConnectionStateChange: (state, userId) => {
          this.options.onConnectionStateChange?.(state, userId);
        },
        onIceConnectionStateChange: (state, userId) => {
          this.options.onIceConnectionStateChange?.(state, userId);
        }
      }
    );

    // Initialize media stream router
    this.mediaStreamRouter = new MediaStreamRouter({
      onStreamUpdate: () => {
        // Handle stream updates if needed
      },
      onLocalStreamUpdate: (stream) => {
        if (stream) {
          this.addLocalStreamToAllPeers(stream);
        }
      }
    });
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('🚀 [WebRTCSignalingService] Initializing...');
      
      const connected = await this.signalingClient.connect();
      if (!connected) {
        throw new Error('Failed to connect to signaling server');
      }

      console.log('✅ [WebRTCSignalingService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ [WebRTCSignalingService] Initialization failed:', error);
      this.options.onError?.(error as Error);
      return false;
    }
  }

  async getLocalStream(constraints?: MediaStreamConstraints): Promise<MediaStream | null> {
    return this.mediaStreamRouter.getLocalStream(constraints);
  }

  getRemoteStreams(): Record<string, MediaStream> {
    return this.mediaStreamRouter.getRemoteStreams();
  }

  async toggleVideo(): Promise<boolean> {
    return this.mediaStreamRouter.toggleVideoTrack();
  }

  async toggleAudio(): Promise<boolean> {
    return this.mediaStreamRouter.toggleAudioTrack();
  }

  getConnectionStates(): Record<string, RTCPeerConnectionState> {
    return this.peerConnectionManager.getAllConnectionStates();
  }

  private async handleUserJoined(userId: string): Promise<void> {
    console.log('👋 [WebRTCSignalingService] User joined:', userId);
    
    if (userId === this.options.userId) return;

    // Create peer connection
    const pc = this.peerConnectionManager.createPeerConnection(userId);

    // Add local stream if available
    const localStream = this.mediaStreamRouter.getCurrentLocalStream();
    if (localStream) {
      this.peerConnectionManager.addStreamToPeerConnection(userId, localStream);
    }

    // Create and send offer (only if we haven't already)
    if (!this.pendingOffers.has(userId)) {
      try {
        this.pendingOffers.add(userId);
        
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        
        await pc.setLocalDescription(offer);
        await this.signalingClient.sendOffer(offer, userId);
        
        console.log('📤 [WebRTCSignalingService] Offer sent to:', userId);
      } catch (error) {
        console.error('❌ [WebRTCSignalingService] Failed to create offer:', error);
        this.pendingOffers.delete(userId);
        this.options.onError?.(error as Error);
      }
    }
  }

  private handleUserLeft(userId: string): void {
    console.log('👋 [WebRTCSignalingService] User left:', userId);
    
    this.peerConnectionManager.closePeerConnection(userId);
    this.mediaStreamRouter.removeRemoteStream(userId);
    this.pendingOffers.delete(userId);
    this.processedAnswers.delete(userId);
  }

  private async handleSignalingMessage(message: SignalingMessage): Promise<void> {
    const { senderId, type, payload } = message;
    
    console.log('📨 [WebRTCSignalingService] Processing message:', { type, senderId });

    try {
      switch (type) {
        case 'offer':
          await this.handleOffer(senderId, payload);
          break;
        case 'answer':
          await this.handleAnswer(senderId, payload);
          break;
        case 'ice-candidate':
          await this.handleIceCandidate(senderId, payload);
          break;
      }
    } catch (error) {
      console.error('❌ [WebRTCSignalingService] Error handling message:', error);
      this.options.onError?.(error as Error);
    }
  }

  private async handleOffer(senderId: string, offer: RTCSessionDescriptionInit): Promise<void> {
    let pc = this.peerConnectionManager.getPeerConnection(senderId);
    
    if (!pc) {
      pc = this.peerConnectionManager.createPeerConnection(senderId);
      
      // Add local stream if available
      const localStream = this.mediaStreamRouter.getCurrentLocalStream();
      if (localStream) {
        this.peerConnectionManager.addStreamToPeerConnection(senderId, localStream);
      }
    }

    // Set remote description
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    
    // Create and send answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await this.signalingClient.sendAnswer(answer, senderId);
    
    console.log('📤 [WebRTCSignalingService] Answer sent to:', senderId);
  }

  private async handleAnswer(senderId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    // Prevent processing duplicate answers
    const answerKey = `${senderId}-${answer.sdp?.slice(0, 50)}`;
    if (this.processedAnswers.has(answerKey)) {
      console.log('⏭️ [WebRTCSignalingService] Duplicate answer ignored from:', senderId);
      return;
    }
    
    this.processedAnswers.add(answerKey);
    
    const pc = this.peerConnectionManager.getPeerConnection(senderId);
    if (pc && pc.signalingState === 'have-local-offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      this.pendingOffers.delete(senderId);
      console.log('✅ [WebRTCSignalingService] Answer processed from:', senderId);
    } else {
      console.warn('⚠️ [WebRTCSignalingService] Invalid answer state for:', senderId, pc?.signalingState);
    }
  }

  private async handleIceCandidate(senderId: string, candidateData: RTCIceCandidateInit): Promise<void> {
    const pc = this.peerConnectionManager.getPeerConnection(senderId);
    if (pc && pc.remoteDescription) {
      await pc.addIceCandidate(new RTCIceCandidate(candidateData));
      console.log('🧊 [WebRTCSignalingService] ICE candidate added from:', senderId);
    } else {
      console.warn('⚠️ [WebRTCSignalingService] Cannot add ICE candidate - no remote description for:', senderId);
    }
  }

  private addLocalStreamToAllPeers(stream: MediaStream): void {
    const states = this.peerConnectionManager.getAllConnectionStates();
    Object.keys(states).forEach(userId => {
      this.peerConnectionManager.addStreamToPeerConnection(userId, stream);
    });
  }

  async destroy(): Promise<void> {
    console.log('🧹 [WebRTCSignalingService] Destroying...');
    
    this.peerConnectionManager.closeAllConnections();
    this.mediaStreamRouter.cleanup();
    this.signalingClient.disconnect();
    
    this.pendingOffers.clear();
    this.processedAnswers.clear();
    
    console.log('✅ [WebRTCSignalingService] Destroyed');
  }
}