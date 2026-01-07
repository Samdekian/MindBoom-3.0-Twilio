/**
 * Twilio Video Service
 * Main service for Twilio Video integration
 */

import { supabase } from '@/integrations/supabase/client';
import type { TwilioTokenResponse } from '@/types/twilio';
import { TWILIO_CONFIG } from '@/lib/twilio/config';

export class TwilioVideoService {
  /**
   * Get Twilio Video access token
   */
  static async getAccessToken(
    identity: string,
    roomName: string
  ): Promise<TwilioTokenResponse> {
    try {
      console.log('🎫 [TwilioVideoService] Requesting access token for:', { identity, roomName });

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(TWILIO_CONFIG.TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          identity,
          roomName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get access token');
      }

      const tokenData: TwilioTokenResponse = await response.json();
      console.log('✅ [TwilioVideoService] Access token received');

      return tokenData;

    } catch (error) {
      console.error('❌ [TwilioVideoService] Failed to get access token:', error);
      throw error;
    }
  }

  /**
   * Validate token expiry and refresh if needed
   */
  static async validateAndRefreshToken(
    tokenData: TwilioTokenResponse,
    identity: string,
    roomName: string
  ): Promise<TwilioTokenResponse> {
    const expiryTime = new Date(tokenData.expiresAt).getTime();
    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;

    // Refresh if less than 5 minutes until expiry
    if (timeUntilExpiry < TWILIO_CONFIG.CONNECTION.tokenRefreshBuffer) {
      console.log('🔄 [TwilioVideoService] Token expiring soon, refreshing...');
      return await this.getAccessToken(identity, roomName);
    }

    return tokenData;
  }

  /**
   * Create or get Twilio room for a session
   */
  static async getOrCreateRoomForSession(sessionId: string): Promise<string> {
    try {
      // Check if session already has a room
      const { data: session, error } = await supabase
        .from('instant_sessions')
        .select('id, session_token')
        .eq('id', sessionId)
        .single();

      if (error || !session) {
        throw new Error('Session not found');
      }

      // Use session token as room name for consistency
      const roomName = `session-${session.session_token}`;
      
      console.log('🏠 [TwilioVideoService] Room name:', roomName);
      return roomName;

    } catch (error) {
      console.error('❌ [TwilioVideoService] Failed to get room name:', error);
      throw error;
    }
  }

  /**
   * Log session event
   */
  static async logSessionEvent(
    sessionId: string,
    eventType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from('session_analytics_events').insert({
        session_id: sessionId,
        event_type: eventType,
        user_id: user?.id,
        metadata: metadata || {}
      });
      
      // Silently ignore 404 (table not found) errors - analytics table may not exist
      if (error && error.code !== '42P01' && !error.message?.includes('404')) {
        console.warn('⚠️ [TwilioVideoService] Event log warning:', error.message);
      }
    } catch (error: any) {
      // Silently ignore table not found/404 errors
      if (error?.message && !error.message.includes('404') && !error.message.includes('42P01')) {
        console.warn('⚠️ [TwilioVideoService] Event log warning:', error.message);
      }
      // Don't throw - logging failures shouldn't break the app
    }
  }

  /**
   * Update participant connection status
   */
  static async updateParticipantStatus(
    sessionId: string,
    participantId: string,
    status: 'connected' | 'disconnected' | 'reconnecting'
  ): Promise<void> {
    try {
      await supabase
        .from('instant_session_participants')
        .update({ 
          is_active: status === 'connected',
          left_at: status === 'disconnected' ? new Date().toISOString() : null
        })
        .eq('id', participantId);

      await this.logSessionEvent(sessionId, `participant_${status}`, {
        participant_id: participantId
      });

    } catch (error) {
      console.error('❌ [TwilioVideoService] Failed to update participant status:', error);
    }
  }

  /**
   * Get session participants
   */
  static async getSessionParticipants(sessionId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('instant_session_participants')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('❌ [TwilioVideoService] Failed to get participants:', error);
      return [];
    }
  }

  /**
   * Check if user is therapist for session
   */
  static async isTherapist(sessionId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('instant_sessions')
        .select('therapist_id')
        .eq('id', sessionId)
        .single();

      if (error || !data) return false;

      return data.therapist_id === userId;

    } catch (error) {
      console.error('❌ [TwilioVideoService] Failed to check therapist status:', error);
      return false;
    }
  }

  /**
   * Get or create participant record
   */
  static async getOrCreateParticipant(
    sessionId: string,
    participantName: string
  ): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      // Check if participant already exists (use maybeSingle to avoid error when not found)
      const { data: existing, error: existingError } = await supabase
        .from('instant_session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (existingError) {
        console.error('❌ [TwilioVideoService] Error checking existing participant:', {
          error: existingError,
          code: existingError.code,
          message: existingError.message,
          sessionId,
          userId: user.id
        });
      }

      if (existing) {
        console.log('✅ [TwilioVideoService] Found existing participant:', existing.id);
        return existing.id;
      }

      // Create new participant
      console.log('🔄 [TwilioVideoService] Creating new participant:', {
        sessionId,
        userId: user.id,
        participantName
      });
      
      const { data: participant, error } = await supabase
        .from('instant_session_participants')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          participant_name: participantName,
          role: await this.isTherapist(sessionId, user.id) ? 'host' : 'participant'
        })
        .select('id')
        .single();

      if (error) {
        console.error('❌ [TwilioVideoService] Database error creating participant:', {
          error,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          sessionId,
          userId: user.id,
          participantName
        });
        throw new Error(`Failed to create participant: ${error.message || error.code || 'Unknown error'}`);
      }

      if (!participant) {
        console.error('❌ [TwilioVideoService] No participant returned after insert');
        throw new Error('Failed to create participant: No data returned');
      }
      
      console.log('✅ [TwilioVideoService] Created new participant:', participant.id);

      return participant.id;

    } catch (error) {
      console.error('❌ [TwilioVideoService] Failed to get/create participant:', error);
      throw error;
    }
  }
}

