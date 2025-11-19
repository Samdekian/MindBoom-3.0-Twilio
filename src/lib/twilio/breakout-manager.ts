/**
 * Breakout Room Manager
 * Handles creation, management, and participant assignment for breakout rooms
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  BreakoutRoom,
  BreakoutRoomConfig,
  BreakoutRoomWithParticipants,
  ParticipantAssignment,
  CreateBreakoutRoomRequest,
  MoveParticipantRequest,
  BreakoutRoomEvent
} from '@/types/breakout-room';
import { TWILIO_CONFIG } from './config';

export class BreakoutRoomManager {
  private sessionId: string;
  private eventListeners: Set<(event: BreakoutRoomEvent) => void> = new Set();
  private realtimeChannel: any = null;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
    this.setupRealtimeSubscription();
  }

  /**
   * Setup realtime subscription for breakout room updates
   */
  private async setupRealtimeSubscription(): Promise<void> {
    // Get breakout room IDs for this session to filter participant updates
    const roomIds = await this.getSessionBreakoutRoomIds();
    
    this.realtimeChannel = supabase
      .channel(`breakout-rooms-${this.sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breakout_rooms',
          filter: `session_id=eq.${this.sessionId}`
        },
        (payload) => {
          console.log('🔄 [BreakoutManager] Room update:', payload);
          this.handleRoomUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breakout_room_participants',
          // Filter to only this session's breakout rooms
          filter: roomIds.length > 0 ? `breakout_room_id=in.(${roomIds})` : `breakout_room_id=eq.00000000-0000-0000-0000-000000000000`
        },
        (payload) => {
          console.log('🔄 [BreakoutManager] Participant update:', payload);
          this.handleParticipantUpdate(payload);
        }
      )
      .subscribe();
  }

  /**
   * Get breakout room IDs for this session
   */
  private async getSessionBreakoutRoomIds(): Promise<string> {
    try {
      const { data: rooms } = await supabase
        .from('breakout_rooms')
        .select('id')
        .eq('session_id', this.sessionId);
      
      return rooms?.map(r => r.id).join(',') || '';
    } catch (error) {
      console.error('❌ [BreakoutManager] Failed to get room IDs:', error);
      return '';
    }
  }

  /**
   * Handle room update from realtime
   */
  private handleRoomUpdate(payload: any): void {
    if (payload.eventType === 'INSERT') {
      this.emitEvent({
        type: 'room_created',
        room: payload.new as BreakoutRoom
      });
    } else if (payload.eventType === 'UPDATE' && !payload.new.is_active) {
      this.emitEvent({
        type: 'room_closed',
        room_id: payload.new.id
      });
    }
  }

  /**
   * Handle participant update from realtime
   */
  private handleParticipantUpdate(payload: any): void {
    if (payload.eventType === 'INSERT') {
      this.emitEvent({
        type: 'participant_joined',
        room_id: payload.new.breakout_room_id,
        participant: payload.new
      });
    } else if (payload.eventType === 'UPDATE' && !payload.new.is_active) {
      this.emitEvent({
        type: 'participant_left',
        room_id: payload.new.breakout_room_id,
        participant_id: payload.new.participant_id
      });
    }
  }

  /**
   * Create breakout rooms based on configuration
   */
  async createBreakoutRooms(config: BreakoutRoomConfig): Promise<BreakoutRoom[]> {
    try {
      console.log('🏗️ [BreakoutManager] Creating breakout rooms:', config);

      // Validate configuration
      if (config.roomCount < 1 || config.roomCount > TWILIO_CONFIG.BREAKOUT_ROOM_CONFIG.maxRoomsPerSession) {
        throw new Error(`Room count must be between 1 and ${TWILIO_CONFIG.BREAKOUT_ROOM_CONFIG.maxRoomsPerSession}`);
      }

      // Get session participants
      const participants = await this.getSessionParticipants();
      
      if (participants.length < TWILIO_CONFIG.BREAKOUT_ROOM_CONFIG.minParticipantsToCreate) {
        throw new Error('Not enough participants to create breakout rooms');
      }

      // Create rooms
      const rooms: BreakoutRoom[] = [];
      const roomNames = config.customRoomNames || 
        TWILIO_CONFIG.BREAKOUT_ROOM_CONFIG.defaultRoomNames.slice(0, config.roomCount);

      for (let i = 0; i < config.roomCount; i++) {
        const roomName = roomNames[i] || `Room ${i + 1}`;
        
        const request: CreateBreakoutRoomRequest = {
          session_id: this.sessionId,
          room_name: roomName,
          max_participants: config.maxParticipantsPerRoom
        };

        const room = await this.createSingleRoom(request);
        rooms.push(room);
      }

      // Assign participants if auto mode
      if (config.assignmentStrategy === 'auto') {
        await this.autoAssignParticipants(participants, rooms);
      }

      // Emit events for each created room
      rooms.forEach(room => {
        this.emitEvent({
          type: 'room_created',
          room
        });
      });

      console.log('✅ [BreakoutManager] Created rooms:', rooms.length);
      return rooms;

    } catch (error) {
      console.error('❌ [BreakoutManager] Failed to create rooms:', error);
      this.emitEvent({
        type: 'error',
        error: error instanceof Error ? error.message : 'Failed to create breakout rooms'
      });
      throw error;
    }
  }

  /**
   * Create a single breakout room
   */
  private async createSingleRoom(request: CreateBreakoutRoomRequest): Promise<BreakoutRoom> {
    try {
      console.log('🏗️ [BreakoutManager] Creating room:', {
        session_id: request.session_id,
        room_name: request.room_name,
        max_participants: request.max_participants
      });
      
      // Call edge function to create room in Twilio and database
      const { data, error } = await supabase.functions.invoke('create-breakout-room', {
        body: request
      });

      if (error) {
        console.error('❌ [BreakoutManager] Edge function error:', error);
        
        // FunctionsHttpError has limited information available synchronously
        // The actual error message is in the Response body which we can't easily access here
        let errorMessage = error.message || 'Edge function failed';
        
        // If the error has a context property that's a Response, log it
        if (error.context && typeof error.context === 'object') {
          console.error('❌ [BreakoutManager] Error context (Response object):', {
            status: (error.context as any).status,
            statusText: (error.context as any).statusText,
            type: (error.context as any).type,
            url: (error.context as any).url
          });
          
          // Include status in error message if available
          const status = (error.context as any).status;
          if (status) {
            errorMessage = `Edge function failed with status ${status}: ${errorMessage}`;
          }
        }
        
        // Check for common network errors
        if (error.message?.includes('NetworkError') || error.message?.includes('fetch')) {
          errorMessage = 'Network error: Unable to connect to server. Please check your internet connection and try again.';
        }
        
        throw new Error(errorMessage);
      }

      if (!data) {
        console.error('❌ [BreakoutManager] No data returned from edge function');
        throw new Error('No data returned from edge function');
      }

      if (!data.success) {
        console.error('❌ [BreakoutManager] Edge function returned failure:', {
          success: data.success,
          error: data.error,
          data: data
        });
        throw new Error(data.error || 'Failed to create breakout room');
      }

      if (!data.breakout_room) {
        console.error('❌ [BreakoutManager] No breakout_room in response:', data);
        throw new Error('Invalid response from edge function: missing breakout_room');
      }

      console.log('✅ [BreakoutManager] Room created successfully:', data.breakout_room.id);
      return data.breakout_room;
    } catch (error) {
      console.error('❌ [BreakoutManager] createSingleRoom failed:', {
        error,
        request,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  /**
   * Auto-assign participants to rooms
   */
  private async autoAssignParticipants(
    participants: any[],
    rooms: BreakoutRoom[]
  ): Promise<void> {
    console.log('🎯 [BreakoutManager] Auto-assigning participants:', {
      participantCount: participants.length,
      roomCount: rooms.length
    });
    
    if (participants.length === 0) {
      console.log('⚠️ [BreakoutManager] No participants to assign');
      return;
    }
    
    // Shuffle participants for random distribution
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    const assignments: Array<{
      breakout_room_id: string;
      participant_id: string;
      user_id: string | null;
      participant_name: string;
      identity: string;
    }> = [];
    
    shuffled.forEach((participant, index) => {
      const roomIndex = index % rooms.length;
      assignments.push({
        breakout_room_id: rooms[roomIndex].id,
        participant_id: participant.id,
        user_id: participant.user_id || null,
        participant_name: participant.participant_name || 'Unknown',
        identity: participant.user_id || `participant-${participant.id}`
      });
    });

    console.log('📝 [BreakoutManager] Assignments to create:', assignments.length);
    console.log('📝 [BreakoutManager] Sample assignment:', assignments[0] || 'No assignments');

    // Get auth token for direct fetch call
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    // Use fetch directly to get full error response
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aoumioacfvttagverbna.supabase.co';
    const functionUrl = `${supabaseUrl}/functions/v1/assign-breakout-participants`;
    
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          assignments
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('❌ [BreakoutManager] Edge function error:', {
          status: response.status,
          statusText: response.statusText,
          error: responseData
        });
        
        const errorMsg = responseData?.error || responseData?.message || `Edge function returned status ${response.status}`;
        throw new Error('Failed to assign participants: ' + errorMsg);
      }

      if (!responseData || !responseData.success) {
        console.error('❌ [BreakoutManager] Assignment failed:', responseData);
        const errorMsg = responseData?.error || 'Failed to assign participants';
        console.error('❌ [BreakoutManager] Error message:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ [BreakoutManager] Auto-assigned participants:', responseData.assigned_count || 0);
    } catch (fetchError: any) {
      // If it's already our Error, rethrow it
      if (fetchError.message?.includes('Failed to assign participants')) {
        throw fetchError;
      }
      
      // Otherwise, wrap it
      console.error('❌ [BreakoutManager] Fetch error:', fetchError);
      throw new Error('Failed to assign participants: ' + (fetchError.message || 'Network error'));
    }
  }

  /**
   * Update participant counts for rooms
   */
  private async updateRoomParticipantCounts(roomIds: string[]): Promise<void> {
    // This is now handled by the edge function, but keeping for backwards compatibility
    try {
      for (const roomId of roomIds) {
        const { count, error } = await supabase
          .from('breakout_room_participants')
          .select('*', { count: 'exact', head: true })
          .eq('breakout_room_id', roomId)
          .eq('is_active', true);

        if (error) {
          console.error('❌ [BreakoutManager] Failed to count participants for room:', roomId, error);
          continue;
        }

        await supabase
          .from('breakout_rooms')
          .update({ current_participants: count || 0 })
          .eq('id', roomId);
      }
    } catch (error) {
      console.error('❌ [BreakoutManager] Failed to update room counts:', error);
    }
  }

  /**
   * Move participant to different room
   */
  async moveParticipant(request: MoveParticipantRequest): Promise<void> {
    try {
      console.log('🔄 [BreakoutManager] Moving participant:', request);

      // Get participant details
      const { data: participant, error: participantError } = await supabase
        .from('instant_session_participants')
        .select('user_id, participant_name')
        .eq('id', request.participant_id)
        .single();

      if (participantError || !participant) {
        throw new Error('Participant not found');
      }

      // Get breakout room details
      const { data: room, error: roomError } = await supabase
        .from('breakout_rooms')
        .select('*')
        .eq('id', request.to_room_id)
        .single();

      if (roomError || !room) {
        throw new Error('Breakout room not found');
      }

      // First, deactivate any existing assignment for this participant
      await supabase
        .from('breakout_room_participants')
        .update({ is_active: false, left_at: new Date().toISOString() })
        .eq('participant_id', request.participant_id)
        .eq('is_active', true);

      // Then insert or update the new assignment
      const { error: upsertError } = await supabase
        .from('breakout_room_participants')
        .upsert({
          breakout_room_id: request.to_room_id,
          participant_id: request.participant_id,
          user_id: participant.user_id,
          participant_name: participant.participant_name,
          identity: participant.user_id || `participant-${request.participant_id}`,
          is_active: true,
          joined_at: new Date().toISOString(),
          left_at: null
        }, {
          onConflict: 'breakout_room_id,participant_id',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('❌ [BreakoutManager] Failed to update participant assignment:', upsertError);
        throw new Error('Failed to update participant assignment');
      }

      // Send real-time notification to participant to join the breakout room
      if (participant.user_id) {
        console.log('📢 [BreakoutManager] Sending breakout assignment to user:', participant.user_id);
        
        const channel = supabase.channel(`user:${participant.user_id}:breakout`);
        
        await channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.send({
              type: 'broadcast',
              event: 'breakout_assignment',
              payload: {
                room_id: request.to_room_id,
                room_name: room.room_name,
                twilio_room_sid: room.twilio_room_sid,
                action: 'join'
              }
            });
            
            console.log('✅ [BreakoutManager] Breakout assignment sent');
            
            // Unsubscribe after sending
            await supabase.removeChannel(channel);
          }
        });
      }

      // Record the transition
      await supabase
        .from('breakout_room_transitions')
        .insert({
          participant_id: request.participant_id,
          from_room_id: request.from_room_id || null,
          to_room_id: request.to_room_id,
          transition_type: request.transition_type || 'manual',
          reason: request.reason,
          moved_by: (await supabase.auth.getUser()).data.user?.id
        });

      this.emitEvent({
        type: 'participant_moved',
        participant: {
          id: request.participant_id,
          name: participant.participant_name,
          toRoomId: request.to_room_id,
          toRoomName: room.room_name
        }
      });

      console.log('✅ [BreakoutManager] Participant moved successfully');

    } catch (error) {
      console.error('❌ [BreakoutManager] Failed to move participant:', error);
      throw error;
    }
  }

  /**
   * Close a specific breakout room
   */
  async closeRoom(roomId: string, reason?: string): Promise<void> {
    try {
      console.log('🔚 [BreakoutManager] Closing room:', roomId);

      const { data, error } = await supabase.functions.invoke('close-breakout-room', {
        body: {
          breakout_room_id: roomId,
          reason
        }
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to close room');
      }

      console.log('✅ [BreakoutManager] Room closed');

    } catch (error) {
      console.error('❌ [BreakoutManager] Failed to close room:', error);
      throw error;
    }
  }

  /**
   * Close all breakout rooms
   */
  async closeAllRooms(): Promise<void> {
    try {
      console.log('🔚 [BreakoutManager] Closing all rooms');

      const rooms = await this.getActiveRooms();
      
      await Promise.all(
        rooms.map(room => this.closeRoom(room.id, 'Session ended'))
      );

      console.log('✅ [BreakoutManager] All rooms closed');

    } catch (error) {
      console.error('❌ [BreakoutManager] Failed to close all rooms:', error);
      throw error;
    }
  }

  /**
   * Get all active breakout rooms
   */
  async getActiveRooms(): Promise<BreakoutRoomWithParticipants[]> {
    try {
      console.log('🔍 [BreakoutManager] Fetching active rooms for session:', this.sessionId);
      
      // First, check if we can query at all (test RLS)
      const { data: testData, error: testError } = await supabase
        .from('breakout_rooms')
        .select('id, session_id, is_active, room_name')
        .eq('session_id', this.sessionId)
        .limit(10);
      
      console.log('🧪 [BreakoutManager] RLS test query (all rooms):', {
        found: testData?.length || 0,
        error: testError,
        errorCode: testError?.code,
        errorMessage: testError?.message,
        sample: testData?.[0]
      });
      
      // Check current user's session participation
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: participation } = await supabase
          .from('instant_session_participants')
          .select('id, user_id, is_active')
          .eq('session_id', this.sessionId)
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();
        
        console.log('👤 [BreakoutManager] Current user participation:', {
          userId: user.id,
          isParticipant: !!participation,
          participation
        });
      }
      
      // First get rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('breakout_rooms')
        .select('*')
        .eq('session_id', this.sessionId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (roomsError) {
        console.error('❌ [BreakoutManager] Failed to get rooms:', roomsError);
        console.error('❌ [BreakoutManager] Error details:', {
          code: roomsError.code,
          message: roomsError.message,
          details: roomsError.details,
          hint: roomsError.hint
        });
        return [];
      }

      console.log('📋 [BreakoutManager] Found rooms:', rooms?.length || 0, rooms);

      if (!rooms || rooms.length === 0) {
        console.log('⚠️ [BreakoutManager] No active rooms found for session:', this.sessionId);
        
        // Try querying without is_active filter to see if rooms exist but are inactive
        const { data: allRooms } = await supabase
          .from('breakout_rooms')
          .select('id, room_name, is_active, session_id, created_at')
          .eq('session_id', this.sessionId)
          .order('created_at', { ascending: true });
        
        console.log('🔍 [BreakoutManager] All rooms (including inactive):', {
          count: allRooms?.length || 0,
          rooms: allRooms
        });
        
        return [];
      }

      // Then get participants for each room
      const roomsWithParticipants = await Promise.all(
        rooms.map(async (room) => {
          const { data: participants, error: participantsError } = await supabase
            .from('breakout_room_participants')
            .select('*')
            .eq('breakout_room_id', room.id)
            .eq('is_active', true);

          if (participantsError) {
            console.error('❌ [BreakoutManager] Failed to get participants for room:', room.id, participantsError);
          }

          return {
            ...room,
            participants: participants || []
          };
        })
      );

      return roomsWithParticipants;
    } catch (error) {
      console.error('❌ [BreakoutManager] Failed to get rooms:', error);
      return [];
    }
  }

  /**
   * Get participant assignments
   */
  async getParticipantAssignments(): Promise<ParticipantAssignment[]> {
    try {
      // Get all session participants
      const { data: participants, error: participantsError } = await supabase
        .from('instant_session_participants')
        .select('id, participant_name, user_id')
        .eq('session_id', this.sessionId)
        .eq('is_active', true);

      if (participantsError) {
        console.error('❌ [BreakoutManager] Failed to get participants:', participantsError);
        return [];
      }

      if (!participants || participants.length === 0) {
        return [];
      }

      // Get current breakout room assignments for each participant
      const assignments = await Promise.all(
        participants.map(async (participant) => {
          const { data: assignment } = await supabase
            .from('breakout_room_participants')
            .select('breakout_room_id, breakout_rooms(room_name)')
            .eq('participant_id', participant.id)
            .eq('is_active', true)
            .maybeSingle();

          return {
            participant_id: participant.id,
            participant_name: participant.participant_name,
            user_id: participant.user_id,
            breakout_room_id: assignment?.breakout_room_id || null,
            breakout_room_name: (assignment as any)?.breakout_rooms?.room_name || null
          };
        })
      );

      return assignments;
    } catch (error) {
      console.error('❌ [BreakoutManager] Failed to get assignments:', error);
      return [];
    }
  }

  /**
   * Get session participants
   */
  private async getSessionParticipants(): Promise<any[]> {
    const { data, error } = await supabase
      .from('instant_session_participants')
      .select('*')
      .eq('session_id', this.sessionId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ [BreakoutManager] Failed to get participants:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Register event listener
   */
  on(callback: (event: BreakoutRoomEvent) => void): void {
    this.eventListeners.add(callback);
  }

  /**
   * Unregister event listener
   */
  off(callback: (event: BreakoutRoomEvent) => void): void {
    this.eventListeners.delete(callback);
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(event: BreakoutRoomEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.eventListeners.clear();
  }
}

