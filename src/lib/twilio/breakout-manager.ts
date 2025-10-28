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
  private setupRealtimeSubscription(): void {
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
          table: 'breakout_room_participants'
        },
        (payload) => {
          console.log('🔄 [BreakoutManager] Participant update:', payload);
          this.handleParticipantUpdate(payload);
        }
      )
      .subscribe();
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
    // Call edge function to create room in Twilio and database
    const { data, error } = await supabase.functions.invoke('create-breakout-room', {
      body: request
    });

    if (error || !data.success) {
      throw new Error(data?.error || 'Failed to create breakout room');
    }

    return data.breakout_room;
  }

  /**
   * Auto-assign participants to rooms
   */
  private async autoAssignParticipants(
    participants: any[],
    rooms: BreakoutRoom[]
  ): Promise<void> {
    // Shuffle participants for random distribution
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    
    const assignments: Array<{ participant_id: string; breakout_room_id: string }> = [];
    
    shuffled.forEach((participant, index) => {
      const roomIndex = index % rooms.length;
      assignments.push({
        participant_id: participant.id,
        breakout_room_id: rooms[roomIndex].id
      });
    });

    // Bulk assign
    const { data, error } = await supabase.functions.invoke('bulk-assign-participants', {
      body: {
        session_id: this.sessionId,
        assignments,
        transition_type: 'auto'
      }
    });

    if (error || !data.success) {
      throw new Error('Failed to assign participants');
    }

    console.log('✅ [BreakoutManager] Auto-assigned participants:', data.assigned_count);
  }

  /**
   * Move participant to different room
   */
  async moveParticipant(request: MoveParticipantRequest): Promise<void> {
    try {
      console.log('🔄 [BreakoutManager] Moving participant:', request);

      const { data, error } = await supabase.functions.invoke('move-participant', {
        body: request
      });

      if (error || !data.success) {
        throw new Error(data?.error || 'Failed to move participant');
      }

      this.emitEvent({
        type: 'participant_moved',
        transition: data.transition
      });

      console.log('✅ [BreakoutManager] Participant moved');

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
    const { data: rooms, error } = await supabase
      .from('breakout_rooms')
      .select(`
        *,
        participants:breakout_room_participants(*)
      `)
      .eq('session_id', this.sessionId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [BreakoutManager] Failed to get rooms:', error);
      throw error;
    }

    return (rooms as any[]).map(room => ({
      ...room,
      participants: room.participants || []
    }));
  }

  /**
   * Get participant assignments
   */
  async getParticipantAssignments(): Promise<ParticipantAssignment[]> {
    const { data, error } = await supabase
      .from('instant_session_participants')
      .select(`
        id,
        participant_name,
        user_id,
        breakout_room_participants!inner(
          breakout_room_id,
          breakout_rooms!inner(
            room_name
          )
        )
      `)
      .eq('session_id', this.sessionId)
      .eq('is_active', true);

    if (error) {
      console.error('❌ [BreakoutManager] Failed to get assignments:', error);
      return [];
    }

    return (data as any[]).map(p => ({
      participant_id: p.id,
      participant_name: p.participant_name,
      user_id: p.user_id,
      breakout_room_id: p.breakout_room_participants?.[0]?.breakout_room_id || null,
      breakout_room_name: p.breakout_room_participants?.[0]?.breakout_rooms?.room_name || null
    }));
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

