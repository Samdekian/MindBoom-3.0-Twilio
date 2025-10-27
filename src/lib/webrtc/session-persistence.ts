// Session persistence and recovery for WebRTC connections
import { supabase } from '@/integrations/supabase/client';

export interface SessionState {
  sessionId: string;
  userId: string;
  participants: string[];
  connectionStates: Record<string, RTCPeerConnectionState>;
  iceStates: Record<string, RTCIceConnectionState>;
  mediaConstraints?: MediaStreamConstraints;
  startTime: string;
  lastActivity: string;
  status: 'active' | 'paused' | 'ended';
  quality?: {
    overall: string;
    details: Record<string, any>;
  };
}

export interface SessionRecoveryData {
  sessionId: string;
  userId: string;
  reconnectionCount: number;
  lastDisconnection: string;
  pendingOffers: any[];
  pendingAnswers: any[];
  pendingCandidates: any[];
}

export class SessionPersistenceManager {
  private static instance: SessionPersistenceManager;
  private currentSession: SessionState | null = null;
  private recoveryData: SessionRecoveryData | null = null;
  private persistenceInterval?: NodeJS.Timeout;
  private readonly PERSISTENCE_INTERVAL = 30000; // 30 seconds

  static getInstance(): SessionPersistenceManager {
    if (!SessionPersistenceManager.instance) {
      SessionPersistenceManager.instance = new SessionPersistenceManager();
    }
    return SessionPersistenceManager.instance;
  }

  async initializeSession(sessionId: string, userId: string, mediaConstraints?: MediaStreamConstraints): Promise<void> {
    try {
      console.log('💾 [SessionPersistence] Initializing session:', { sessionId, userId });

      // Check for existing session recovery data
      this.recoveryData = await this.loadRecoveryData(sessionId, userId);

      this.currentSession = {
        sessionId,
        userId,
        participants: [userId],
        connectionStates: {},
        iceStates: {},
        mediaConstraints,
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        status: 'active'
      };

      await this.persistSession();
      this.startPeriodicPersistence();

      console.log('✅ [SessionPersistence] Session initialized');
    } catch (error) {
      console.error('❌ [SessionPersistence] Failed to initialize session:', error);
      throw error;
    }
  }

  async addParticipant(userId: string): Promise<void> {
    if (!this.currentSession) return;

    if (!this.currentSession.participants.includes(userId)) {
      this.currentSession.participants.push(userId);
      this.currentSession.lastActivity = new Date().toISOString();
      await this.persistSession();
      console.log('👋 [SessionPersistence] Participant added:', userId);
    }
  }

  async removeParticipant(userId: string): Promise<void> {
    if (!this.currentSession) return;

    const index = this.currentSession.participants.indexOf(userId);
    if (index > -1) {
      this.currentSession.participants.splice(index, 1);
      delete this.currentSession.connectionStates[userId];
      delete this.currentSession.iceStates[userId];
      this.currentSession.lastActivity = new Date().toISOString();
      await this.persistSession();
      console.log('👋 [SessionPersistence] Participant removed:', userId);
    }
  }

  async updateConnectionState(userId: string, connectionState: RTCPeerConnectionState, iceState: RTCIceConnectionState): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.connectionStates[userId] = connectionState;
    this.currentSession.iceStates[userId] = iceState;
    this.currentSession.lastActivity = new Date().toISOString();

    // Persist immediately on connection state changes
    await this.persistSession();
  }

  async updateQuality(quality: { overall: string; details: Record<string, any> }): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.quality = quality;
    this.currentSession.lastActivity = new Date().toISOString();
  }

  async pauseSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.status = 'paused';
    this.currentSession.lastActivity = new Date().toISOString();
    await this.persistSession();
    this.stopPeriodicPersistence();

    console.log('⏸️ [SessionPersistence] Session paused');
  }

  async resumeSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.status = 'active';
    this.currentSession.lastActivity = new Date().toISOString();
    await this.persistSession();
    this.startPeriodicPersistence();

    console.log('▶️ [SessionPersistence] Session resumed');
  }

  async endSession(): Promise<void> {
    if (!this.currentSession) return;

    this.currentSession.status = 'ended';
    this.currentSession.lastActivity = new Date().toISOString();
    await this.persistSession();
    this.stopPeriodicPersistence();

    // Clean up recovery data
    if (this.recoveryData) {
      await this.clearRecoveryData();
    }

    this.currentSession = null;
    console.log('🏁 [SessionPersistence] Session ended');
  }

  async recordDisconnection(reason?: string): Promise<void> {
    if (!this.currentSession) return;

    if (!this.recoveryData) {
      this.recoveryData = {
        sessionId: this.currentSession.sessionId,
        userId: this.currentSession.userId,
        reconnectionCount: 0,
        lastDisconnection: new Date().toISOString(),
        pendingOffers: [],
        pendingAnswers: [],
        pendingCandidates: []
      };
    } else {
      this.recoveryData.reconnectionCount++;
      this.recoveryData.lastDisconnection = new Date().toISOString();
    }

    await this.persistRecoveryData();
    console.log('📡 [SessionPersistence] Disconnection recorded:', { reason, count: this.recoveryData.reconnectionCount });
  }

  async addPendingSignaling(type: 'offer' | 'answer' | 'candidate', data: any): Promise<void> {
    if (!this.recoveryData) return;

    switch (type) {
      case 'offer':
        this.recoveryData.pendingOffers.push({ data, timestamp: new Date().toISOString() });
        break;
      case 'answer':
        this.recoveryData.pendingAnswers.push({ data, timestamp: new Date().toISOString() });
        break;
      case 'candidate':
        this.recoveryData.pendingCandidates.push({ data, timestamp: new Date().toISOString() });
        break;
    }

    await this.persistRecoveryData();
  }

  async getPendingSignaling(): Promise<{
    offers: any[];
    answers: any[];
    candidates: any[];
  } | null> {
    if (!this.recoveryData) return null;

    return {
      offers: [...this.recoveryData.pendingOffers],
      answers: [...this.recoveryData.pendingAnswers],
      candidates: [...this.recoveryData.pendingCandidates]
    };
  }

  async clearPendingSignaling(): Promise<void> {
    if (!this.recoveryData) return;

    this.recoveryData.pendingOffers = [];
    this.recoveryData.pendingAnswers = [];
    this.recoveryData.pendingCandidates = [];

    await this.persistRecoveryData();
  }

  getCurrentSession(): SessionState | null {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  getRecoveryData(): SessionRecoveryData | null {
    return this.recoveryData ? { ...this.recoveryData } : null;
  }

  private async persistSession(retryCount = 0): Promise<void> {
    if (!this.currentSession) return;

    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 100; // Exponential backoff

    try {
      // First, try to delete any existing session for this user/session combo
      await supabase
        .from('webrtc_session_state')
        .delete()
        .eq('session_id', this.currentSession.sessionId)
        .eq('user_id', this.currentSession.userId);

      // Then insert the new session state
      const { error } = await supabase
        .from('webrtc_session_state')
        .insert({
          session_id: this.currentSession.sessionId,
          user_id: this.currentSession.userId,
          participants: this.currentSession.participants,
          connection_states: this.currentSession.connectionStates,
          ice_states: this.currentSession.iceStates,
          media_constraints: this.currentSession.mediaConstraints,
          start_time: this.currentSession.startTime,
          last_activity: this.currentSession.lastActivity,
          status: this.currentSession.status,
          quality: this.currentSession.quality,
          updated_at: new Date().toISOString()
        });

      if (error && error.code === '23505' && retryCount < maxRetries) {
        // Handle unique constraint violation with retry
        console.warn(`⚠️ [SessionPersistence] Constraint violation, retrying... (${retryCount + 1}/${maxRetries})`);
        
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.persistSession(retryCount + 1);
      } else if (error) {
        console.error('❌ [SessionPersistence] Failed to persist session:', error);
      }
    } catch (error) {
      console.error('❌ [SessionPersistence] Error persisting session:', error);
      
      if (retryCount < maxRetries) {
        console.warn(`⚠️ [SessionPersistence] Retrying session persistence... (${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.persistSession(retryCount + 1);
      }
    }
  }

  private async persistRecoveryData(): Promise<void> {
    if (!this.recoveryData) return;

    try {
      const { error } = await supabase
        .from('webrtc_recovery_data')
        .upsert({
          session_id: this.recoveryData.sessionId,
          user_id: this.recoveryData.userId,
          reconnection_count: this.recoveryData.reconnectionCount,
          last_disconnection: this.recoveryData.lastDisconnection,
          pending_offers: this.recoveryData.pendingOffers,
          pending_answers: this.recoveryData.pendingAnswers,
          pending_candidates: this.recoveryData.pendingCandidates,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ [SessionPersistence] Failed to persist recovery data:', error);
      }
    } catch (error) {
      console.error('❌ [SessionPersistence] Error persisting recovery data:', error);
    }
  }

  private async loadRecoveryData(sessionId: string, userId: string): Promise<SessionRecoveryData | null> {
    try {
      const { data, error } = await supabase
        .from('webrtc_recovery_data')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [SessionPersistence] Failed to load recovery data:', error);
        return null;
      }

      if (data) {
        console.log('📡 [SessionPersistence] Recovery data loaded:', {
          reconnectionCount: data.reconnection_count,
          lastDisconnection: data.last_disconnection
        });

        return {
          sessionId: data.session_id,
          userId: data.user_id,
          reconnectionCount: data.reconnection_count,
          lastDisconnection: data.last_disconnection,
          pendingOffers: data.pending_offers || [],
          pendingAnswers: data.pending_answers || [],
          pendingCandidates: data.pending_candidates || []
        };
      }

      return null;
    } catch (error) {
      console.error('❌ [SessionPersistence] Error loading recovery data:', error);
      return null;
    }
  }

  private async clearRecoveryData(): Promise<void> {
    if (!this.recoveryData) return;

    try {
      const { error } = await supabase
        .from('webrtc_recovery_data')
        .delete()
        .eq('session_id', this.recoveryData.sessionId)
        .eq('user_id', this.recoveryData.userId);

      if (error) {
        console.error('❌ [SessionPersistence] Failed to clear recovery data:', error);
      } else {
        console.log('🧹 [SessionPersistence] Recovery data cleared');
      }
    } catch (error) {
      console.error('❌ [SessionPersistence] Error clearing recovery data:', error);
    }
  }

  private startPeriodicPersistence(): void {
    this.stopPeriodicPersistence();
    
    this.persistenceInterval = setInterval(async () => {
      if (this.currentSession) {
        this.currentSession.lastActivity = new Date().toISOString();
        await this.persistSession();
      }
    }, this.PERSISTENCE_INTERVAL);

    console.log('🔄 [SessionPersistence] Periodic persistence started');
  }

  private stopPeriodicPersistence(): void {
    if (this.persistenceInterval) {
      clearInterval(this.persistenceInterval);
      this.persistenceInterval = undefined;
      console.log('⏹️ [SessionPersistence] Periodic persistence stopped');
    }
  }
}

// Export singleton instance
export const sessionPersistence = SessionPersistenceManager.getInstance();