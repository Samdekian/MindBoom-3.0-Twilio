import { supabase } from '@/integrations/supabase/client';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  payload: any;
  senderId: string;
  targetId?: string;
  sessionId: string;
  timestamp: string;
}

export interface SignalingClientOptions {
  sessionId: string;
  userId: string;
  onMessage?: (message: SignalingMessage) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
}

export class SignalingClient {
  private channel: any = null;
  private options: SignalingClientOptions;
  private isConnected = false;

  constructor(options: SignalingClientOptions) {
    this.options = options;
  }

  async connect(): Promise<boolean> {
    try {
      // Create WebSocket connection to our signaling server
      return new Promise((resolve) => {
        this.channel = supabase.channel(`webrtc-session-${this.options.sessionId}`)
          .on('broadcast', { event: 'signaling' }, (payload) => {
            const message = payload.payload as SignalingMessage;
            
            // Don't process our own messages
            if (message.senderId === this.options.userId) {
              return;
            }

            // Filter messages by targetId (except broadcast messages like join/leave)
            if (message.targetId && message.targetId !== this.options.userId) {
              console.log('🔇 [SignalingClient] Ignoring message not targeted for us:', message.type, 'from', message.senderId, 'to', message.targetId);
              return;
            }

            console.log('📨 [SignalingClient] Processing message:', message.type, 'from', message.senderId, message.targetId ? `to ${message.targetId}` : '(broadcast)');

            // Call appropriate handlers based on message type
            if (message.type === 'join') {
              this.options.onUserJoined?.(message.senderId);
            } else if (message.type === 'leave') {
              this.options.onUserLeft?.(message.senderId);
            } else {
              this.options.onMessage?.(message);
            }
          })
          .subscribe((status) => {
            console.log('🔌 [SignalingClient] Channel status:', status);
            this.isConnected = status === 'SUBSCRIBED';
            
            if (this.isConnected) {
              // Announce our presence
              this.sendMessage('join', { userId: this.options.userId });
              // Resolve the promise now that we're connected
              resolve(true);
            }
          });
      });
    } catch (error) {
      console.error('❌ [SignalingClient] Connection failed:', error);
      return false;
    }
  }

  async sendMessage(type: SignalingMessage['type'], payload: any, targetId?: string): Promise<boolean> {
    if (!this.isConnected || !this.channel) {
      console.warn('⚠️ [SignalingClient] Cannot send message - not connected');
      return false;
    }

    const message: SignalingMessage = {
      type,
      payload,
      senderId: this.options.userId,
      targetId,
      sessionId: this.options.sessionId,
      timestamp: new Date().toISOString()
    };

    try {
      await this.channel.send({
        type: 'broadcast',
        event: 'signaling',
        payload: message
      });
      
      console.log('📤 [SignalingClient] Message sent:', { type, targetId });
      return true;
    } catch (error) {
      console.error('❌ [SignalingClient] Failed to send message:', error);
      return false;
    }
  }

  async sendOffer(offer: RTCSessionDescriptionInit, targetId: string): Promise<boolean> {
    return this.sendMessage('offer', offer, targetId);
  }

  async sendAnswer(answer: RTCSessionDescriptionInit, targetId: string): Promise<boolean> {
    return this.sendMessage('answer', answer, targetId);
  }

  async sendIceCandidate(candidate: RTCIceCandidateInit, targetId: string): Promise<boolean> {
    return this.sendMessage('ice-candidate', candidate, targetId);
  }

  disconnect(): void {
    if (this.isConnected && this.channel) {
      // Announce departure
      this.sendMessage('leave', { userId: this.options.userId });
      
      // Remove channel
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.isConnected = false;
      
      console.log('🔌 [SignalingClient] Disconnected');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}