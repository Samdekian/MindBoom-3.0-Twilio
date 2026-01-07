/**
 * BreakoutRoomManager
 * 
 * @deprecated This module is deprecated and will be removed in a future version.
 * Please use the new OOP architecture instead:
 * 
 * - For breakout room management: use `BreakoutRoomService` from '@/services/video/BreakoutRoomService'
 * - For breakout room connections: use `TwilioBreakoutAdapter` from '@/adapters/TwilioBreakoutAdapter'
 * - For React components: use `useBreakoutRooms` hook from '@/hooks/video-conference/use-breakout-rooms-v2'
 * 
 * Migration Guide:
 * 1. Replace `new BreakoutRoomManager(sessionId)` with `createBreakoutRoomService(sessionId)` from bootstrap
 * 2. Use the service's methods instead of manager methods
 * 3. Use `useBreakoutRooms` hook in React components
 * 
 * See `/src/services/video/BreakoutRoomService.ts` for the new implementation.
 */

import { supabase } from '@/integrations/supabase/client';
import type {
  BreakoutRoom,
  BreakoutRoomConfig,
  BreakoutRoomEvent,
  BreakoutRoomWithParticipants,
  MoveParticipantRequest,
  ParticipantAssignment
} from '@/types/breakout-room';

// Re-export warning
console.warn(
  '[DEPRECATION WARNING] BreakoutRoomManager is deprecated. ' +
  'Please migrate to BreakoutRoomService from "@/services/video/BreakoutRoomService". ' +
  'For React components, use the useBreakoutRooms hook from "@/hooks/video-conference/use-breakout-rooms-v2".'
);

/**
 * @deprecated Use BreakoutRoomService from '@/services/video/BreakoutRoomService' instead
 */
export class BreakoutRoomManager {
  private sessionId: string;
  private eventListeners: Set<(event: BreakoutRoomEvent) => void> = new Set();
  private realtimeChannel: any = null;

  /** @deprecated */
  constructor(sessionId: string) {
    console.warn('[DEPRECATION] BreakoutRoomManager is deprecated. Use BreakoutRoomService instead.');
    this.sessionId = sessionId;
    this.setupRealtimeSubscription();
  }

  /** @deprecated Use BreakoutRoomService.createRooms instead */
  async createBreakoutRooms(config: BreakoutRoomConfig): Promise<BreakoutRoom[]> {
    console.warn('[DEPRECATION] createBreakoutRooms is deprecated. Use BreakoutRoomService.createRooms instead.');
    
    const { data, error } = await supabase.functions.invoke('create-breakout-rooms', {
      body: {
        sessionId: this.sessionId,
        config
      }
    });

    if (error) throw error;
    return data?.rooms || [];
  }

  /** @deprecated Use BreakoutRoomService.closeRoom instead */
  async closeRoom(roomId: string, reason?: string): Promise<void> {
    console.warn('[DEPRECATION] closeRoom is deprecated. Use BreakoutRoomService.closeRoom instead.');
    
    const { error } = await supabase.functions.invoke('close-breakout-room', {
      body: { roomId, reason }
    });

    if (error) throw error;
  }

  /** @deprecated Use BreakoutRoomService.closeAllRooms instead */
  async closeAllRooms(): Promise<void> {
    console.warn('[DEPRECATION] closeAllRooms is deprecated. Use BreakoutRoomService.closeAllRooms instead.');
    
    const rooms = await this.getActiveRooms();
    await Promise.all(rooms.map(room => this.closeRoom(room.id, 'Session ending')));
  }

  /** @deprecated Use BreakoutRoomService.moveParticipant instead */
  async moveParticipant(request: MoveParticipantRequest): Promise<void> {
    console.warn('[DEPRECATION] moveParticipant is deprecated. Use BreakoutRoomService.moveParticipant instead.');
    
    const { error } = await supabase.functions.invoke('move-breakout-participant', {
      body: request
    });

    if (error) throw error;
  }

  /** @deprecated Use BreakoutRoomService.getActiveRooms instead */
  async getActiveRooms(): Promise<BreakoutRoomWithParticipants[]> {
    console.warn('[DEPRECATION] getActiveRooms is deprecated. Use BreakoutRoomService.getActiveRooms instead.');
    
    const { data: rooms, error: roomsError } = await supabase
      .from('breakout_rooms')
      .select('*')
      .eq('session_id', this.sessionId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (roomsError) throw roomsError;

    const roomsWithParticipants = await Promise.all(
      (rooms || []).map(async (room) => {
        const { data: participants } = await supabase
          .from('breakout_room_participants')
          .select('*')
          .eq('breakout_room_id', room.id)
          .eq('is_active', true);

        return {
          ...room,
          participants: participants || []
        };
      })
    );

    return roomsWithParticipants;
  }

  /** @deprecated Use BreakoutRoomService.getParticipantAssignments instead */
  async getParticipantAssignments(): Promise<ParticipantAssignment[]> {
    console.warn('[DEPRECATION] getParticipantAssignments is deprecated. Use BreakoutRoomService.getParticipantAssignments instead.');
    
    const { data: participants, error: participantsError } = await supabase
      .from('instant_session_participants')
      .select('id, participant_name, user_id')
      .eq('session_id', this.sessionId)
      .eq('is_active', true);

    if (participantsError) throw participantsError;

    if (!participants || participants.length === 0) {
      return [];
    }

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
  }

  /** @deprecated */
  on(callback: (event: BreakoutRoomEvent) => void): void {
    this.eventListeners.add(callback);
  }

  /** @deprecated */
  off(callback: (event: BreakoutRoomEvent) => void): void {
    this.eventListeners.delete(callback);
  }

  /** @deprecated */
  destroy(): void {
    if (this.realtimeChannel) {
      supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
    this.eventListeners.clear();
  }

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
        (payload) => this.handleRealtimeUpdate(payload)
      )
      .subscribe();
  }

  private handleRealtimeUpdate(payload: any): void {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    let event: BreakoutRoomEvent | null = null;

    switch (eventType) {
      case 'INSERT':
        event = { type: 'room_created', room: newRecord as BreakoutRoom };
        break;

      case 'UPDATE':
        if (newRecord.is_active === false && oldRecord.is_active === true) {
          event = { type: 'room_closed', room_id: newRecord.id };
        }
        break;

      case 'DELETE':
        event = { type: 'room_closed', room_id: oldRecord.id };
        break;
    }

    if (event) {
      this.eventListeners.forEach(callback => callback(event!));
    }
  }
}

export default BreakoutRoomManager;
