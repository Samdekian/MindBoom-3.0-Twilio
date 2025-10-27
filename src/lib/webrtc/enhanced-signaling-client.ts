// Enhanced signaling client with authentication and error recovery
import { supabase } from '@/integrations/supabase/client';
import { sessionPersistence } from './session-persistence';

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'join' | 'leave';
  payload: any;
  senderId: string;
  targetId?: string;
  sessionId: string;
  timestamp: string;
  authenticated?: boolean;
  userToken?: string;
}

export interface EnhancedSignalingClientOptions {
  sessionId: string;
  userId: string;
  onMessage?: (message: SignalingMessage) => void;
  onUserJoined?: (userId: string) => void;
  onUserLeft?: (userId: string) => void;
  onConnectionError?: (error: Error) => void;
  onReconnected?: () => void;
}

export class EnhancedSignalingClient {
  private channel: any = null;
  private options: EnhancedSignalingClientOptions;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval?: NodeJS.Timeout;
  private lastHeartbeat?: Date;
  private connectionStartTime?: Date;

  constructor(options: EnhancedSignalingClientOptions) {
    this.options = options;
  }

  async connect(): Promise<boolean> {
    try {
      console.log('🔌 [EnhancedSignalingClient] Connecting to session:', this.options.sessionId);
      this.connectionStartTime = new Date();

      // Verify authentication before connecting
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create enhanced WebSocket connection with authentication
      this.channel = supabase.channel(`webrtc-session-${this.options.sessionId}`)
        .on('broadcast', { event: 'signaling' }, (payload) => {
          this.handleSignalingMessage(payload.payload as SignalingMessage);
        })
        .on('broadcast', { event: 'heartbeat' }, (payload) => {
          this.handleHeartbeat(payload.payload);
        })
        .on('presence', { event: 'sync' }, () => {
          console.log('👥 [EnhancedSignalingClient] Presence synced');
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('👋 [EnhancedSignalingClient] User presence joined:', key);
          newPresences.forEach(presence => {
            if (presence.userId !== this.options.userId) {
              this.options.onUserJoined?.(presence.userId);
            }
          });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('👋 [EnhancedSignalingClient] User presence left:', key);
          leftPresences.forEach(presence => {
            if (presence.userId !== this.options.userId) {
              this.options.onUserLeft?.(presence.userId);
            }
          });
        })
        .subscribe(async (status) => {
          console.log('🔌 [EnhancedSignalingClient] Channel status:', status);
          
          if (status === 'SUBSCRIBED') {
            this.isConnected = true;
            this.reconnectAttempts = 0;
            
            // Track user presence
            await this.channel.track({
              userId: this.options.userId,
              joinedAt: new Date().toISOString(),
              userAgent: navigator.userAgent,
              sessionId: this.options.sessionId
            });

            // Start heartbeat
            this.startHeartbeat();

            // Announce our presence with authentication
            await this.sendAuthenticatedMessage('join', { 
              userId: this.options.userId,
              timestamp: new Date().toISOString(),
              sessionId: this.options.sessionId
            });

            // Process any pending signaling messages from recovery
            await this.processPendingMessages();

            if (this.reconnectAttempts > 0) {
              console.log('✅ [EnhancedSignalingClient] Reconnected successfully');
              this.options.onReconnected?.();
            }

            console.log('✅ [EnhancedSignalingClient] Connected successfully');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            this.handleConnectionError(new Error(`Connection failed: ${status}`));
          }
        });

      return true;
    } catch (error) {
      console.error('❌ [EnhancedSignalingClient] Connection failed:', error);
      this.options.onConnectionError?.(error as Error);
      return false;
    }
  }

  private handleSignalingMessage(message: SignalingMessage): void {
    // Don't process our own messages
    if (message.senderId === this.options.userId) {
      return;
    }

    // Verify message authentication
    if (!this.verifyMessage(message)) {
      console.warn('⚠️ [EnhancedSignalingClient] Unauthenticated message rejected:', message.type);
      return;
    }

    console.log('📨 [EnhancedSignalingClient] Authenticated message received:', {
      type: message.type,
      from: message.senderId,
      sessionId: message.sessionId
    });

    // Update last activity
    this.lastHeartbeat = new Date();

    // Call appropriate handlers based on message type
    if (message.type === 'join') {
      this.options.onUserJoined?.(message.senderId);
    } else if (message.type === 'leave') {
      this.options.onUserLeft?.(message.senderId);
    } else {
      this.options.onMessage?.(message);
    }
  }

  private verifyMessage(message: SignalingMessage): boolean {
    // Basic message verification
    if (!message.sessionId || message.sessionId !== this.options.sessionId) {
      return false;
    }

    if (!message.senderId || !message.timestamp) {
      return false;
    }

    // Check message age (reject messages older than 30 seconds)
    const messageTime = new Date(message.timestamp);
    const now = new Date();
    const ageMs = now.getTime() - messageTime.getTime();
    
    if (ageMs > 30000) {
      console.warn('⚠️ [EnhancedSignalingClient] Message too old, rejecting');
      return false;
    }

    return true;
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.channel) {
        this.channel.send({
          type: 'broadcast',
          event: 'heartbeat',
          payload: {
            userId: this.options.userId,
            timestamp: new Date().toISOString(),
            sessionId: this.options.sessionId
          }
        });

        // Check for connection timeout
        if (this.lastHeartbeat) {
          const timeSinceLastHeartbeat = new Date().getTime() - this.lastHeartbeat.getTime();
          if (timeSinceLastHeartbeat > 60000) { // 1 minute timeout
            console.warn('⚠️ [EnhancedSignalingClient] Connection timeout detected');
            this.handleConnectionError(new Error('Connection timeout'));
          }
        }
      }
    }, 15000); // Send heartbeat every 15 seconds

    this.lastHeartbeat = new Date();
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  private handleHeartbeat(payload: any): void {
    if (payload.userId !== this.options.userId) {
      this.lastHeartbeat = new Date();
    }
  }

  private handleConnectionError(error: Error): void {
    console.error('❌ [EnhancedSignalingClient] Connection error:', error);
    this.isConnected = false;
    this.stopHeartbeat();

    this.options.onConnectionError?.(error);

    // Attempt reconnection with exponential backoff
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 [EnhancedSignalingClient] Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('💥 [EnhancedSignalingClient] Max reconnection attempts reached');
    }
  }

  private async processPendingMessages(): Promise<void> {
    try {
      const pendingData = await sessionPersistence.getPendingSignaling();
      if (!pendingData) return;

      console.log('📦 [EnhancedSignalingClient] Processing pending messages:', {
        offers: pendingData.offers.length,
        answers: pendingData.answers.length,
        candidates: pendingData.candidates.length
      });

      // Process pending messages in order
      for (const offer of pendingData.offers) {
        this.options.onMessage?.({
          type: 'offer',
          payload: offer.data,
          senderId: 'recovery',
          sessionId: this.options.sessionId,
          timestamp: offer.timestamp
        });
      }

      for (const answer of pendingData.answers) {
        this.options.onMessage?.({
          type: 'answer',
          payload: answer.data,
          senderId: 'recovery',
          sessionId: this.options.sessionId,
          timestamp: answer.timestamp
        });
      }

      for (const candidate of pendingData.candidates) {
        this.options.onMessage?.({
          type: 'ice-candidate',
          payload: candidate.data,
          senderId: 'recovery',
          sessionId: this.options.sessionId,
          timestamp: candidate.timestamp
        });
      }

      // Clear processed messages
      await sessionPersistence.clearPendingSignaling();

      console.log('✅ [EnhancedSignalingClient] Pending messages processed');
    } catch (error) {
      console.error('❌ [EnhancedSignalingClient] Failed to process pending messages:', error);
    }
  }

  async sendMessage(type: SignalingMessage['type'], payload: any, targetId?: string): Promise<boolean> {
    if (!this.isConnected || !this.channel) {
      console.warn('⚠️ [EnhancedSignalingClient] Cannot send message - not connected, storing for recovery');
      
      // Store message for recovery
      await sessionPersistence.addPendingSignaling(
        type === 'ice-candidate' ? 'candidate' : type as 'offer' | 'answer', 
        { payload, targetId }
      );
      return false;
    }

    return this.sendAuthenticatedMessage(type, payload, targetId);
  }

  private async sendAuthenticatedMessage(type: SignalingMessage['type'], payload: any, targetId?: string): Promise<boolean> {
    try {
      // Get current user token for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      const message: SignalingMessage = {
        type,
        payload,
        senderId: this.options.userId,
        targetId,
        sessionId: this.options.sessionId,
        timestamp: new Date().toISOString(),
        authenticated: true,
        userToken: session?.access_token
      };

      await this.channel.send({
        type: 'broadcast',
        event: 'signaling',
        payload: message
      });
      
      console.log('📤 [EnhancedSignalingClient] Authenticated message sent:', { type, targetId });
      return true;
    } catch (error) {
      console.error('❌ [EnhancedSignalingClient] Failed to send message:', error);
      
      // Store failed message for recovery
      await sessionPersistence.addPendingSignaling(
        type === 'ice-candidate' ? 'candidate' : type as 'offer' | 'answer', 
        { payload, targetId }
      );
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
      console.log('🔌 [EnhancedSignalingClient] Disconnecting...');
      
      // Announce departure
      this.sendAuthenticatedMessage('leave', { userId: this.options.userId });
      
      // Stop heartbeat
      this.stopHeartbeat();
      
      // Remove presence
      this.channel.untrack();
      
      // Remove channel
      supabase.removeChannel(this.channel);
      this.channel = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      
      console.log('✅ [EnhancedSignalingClient] Disconnected');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  getConnectionStats(): {
    connected: boolean;
    reconnectAttempts: number;
    connectionDuration?: number;
    lastHeartbeat?: string;
  } {
    const stats: any = {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    };

    if (this.connectionStartTime) {
      stats.connectionDuration = new Date().getTime() - this.connectionStartTime.getTime();
    }

    if (this.lastHeartbeat) {
      stats.lastHeartbeat = this.lastHeartbeat.toISOString();
    }

    return stats;
  }

  // Force reconnection (for testing or manual recovery)
  async forceReconnect(): Promise<void> {
    console.log('🔄 [EnhancedSignalingClient] Force reconnecting...');
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.connect();
  }
}