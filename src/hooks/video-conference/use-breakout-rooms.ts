/**
 * useBreakoutRooms Hook
 * React hook for managing breakout rooms in group therapy sessions
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { BreakoutRoomManager } from '@/lib/twilio/breakout-manager';
import type {
  BreakoutRoom,
  BreakoutRoomConfig,
  BreakoutRoomWithParticipants,
  ParticipantAssignment,
  BreakoutRoomManagerState,
  MoveParticipantRequest,
  BreakoutRoomEvent
} from '@/types/breakout-room';
import { useToast } from '@/hooks/use-toast';

interface UseBreakoutRoomsOptions {
  sessionId: string;
  enabled?: boolean;
}

interface UseBreakoutRoomsReturn {
  state: BreakoutRoomManagerState;
  rooms: BreakoutRoomWithParticipants[];
  assignments: ParticipantAssignment[];
  createRooms: (config: BreakoutRoomConfig) => Promise<void>;
  closeRoom: (roomId: string) => Promise<void>;
  closeAllRooms: () => Promise<void>;
  moveParticipant: (request: MoveParticipantRequest) => Promise<void>;
  refreshRooms: () => Promise<void>;
  refreshAssignments: () => Promise<void>;
}

export function useBreakoutRooms(options: UseBreakoutRoomsOptions): UseBreakoutRoomsReturn {
  const { sessionId, enabled = true } = options;
  const { toast } = useToast();

  const [state, setState] = useState<BreakoutRoomManagerState>({
    rooms: new Map(),
    assignments: new Map(),
    status: 'closed',
    activeRoomCount: 0,
    totalParticipants: 0,
    config: null,
    error: null
  });

  const [rooms, setRooms] = useState<BreakoutRoomWithParticipants[]>([]);
  const [assignments, setAssignments] = useState<ParticipantAssignment[]>([]);

  const managerRef = useRef<BreakoutRoomManager | null>(null);

  /**
   * Initialize manager
   */
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const manager = new BreakoutRoomManager(sessionId);
    managerRef.current = manager;

    // Setup event listener
    const handleEvent = (event: BreakoutRoomEvent) => {
      console.log('🏠 [useBreakoutRooms] Event:', event.type);

      switch (event.type) {
        case 'room_created':
          toast({
            title: 'Breakout room created',
            description: `${event.room.room_name} is ready`
          });
          refreshRooms();
          break;

        case 'room_closed':
          toast({
            title: 'Breakout room closed',
            description: 'Room has been closed'
          });
          refreshRooms();
          break;

        case 'participant_joined':
          refreshRooms();
          refreshAssignments();
          break;

        case 'participant_left':
          refreshRooms();
          refreshAssignments();
          break;

        case 'participant_moved':
          toast({
            title: 'Participant moved',
            description: 'Participant has been moved to a different room'
          });
          refreshRooms();
          refreshAssignments();
          break;

        case 'error':
          setState(prev => ({ ...prev, error: event.error, status: 'error' }));
          toast({
            title: 'Error',
            description: event.error,
            variant: 'destructive'
          });
          break;
      }
    };

    manager.on(handleEvent);

    // Initial load
    refreshRooms();
    refreshAssignments();

    return () => {
      manager.off(handleEvent);
      manager.cleanup();
      managerRef.current = null;
    };
  }, [enabled, sessionId]);

  /**
   * Refresh rooms list
   */
  const refreshRooms = useCallback(async () => {
    if (!managerRef.current) return;

    try {
      const activeRooms = await managerRef.current.getActiveRooms();
      setRooms(activeRooms);

      // Update state
      const roomsMap = new Map(activeRooms.map(room => [room.id, room]));
      const activeCount = activeRooms.filter(r => r.is_active).length;
      const totalParticipants = activeRooms.reduce((sum, r) => sum + r.current_participants, 0);

      setState(prev => ({
        ...prev,
        rooms: roomsMap,
        activeRoomCount: activeCount,
        totalParticipants,
        status: activeCount > 0 ? 'active' : 'closed'
      }));

    } catch (error) {
      console.error('❌ [useBreakoutRooms] Failed to refresh rooms:', error);
    }
  }, []);

  /**
   * Refresh assignments
   */
  const refreshAssignments = useCallback(async () => {
    if (!managerRef.current) return;

    try {
      const currentAssignments = await managerRef.current.getParticipantAssignments();
      setAssignments(currentAssignments);

      // Update state
      const assignmentsMap = new Map(
        currentAssignments.map(a => [a.participant_id, a])
      );

      setState(prev => ({
        ...prev,
        assignments: assignmentsMap
      }));

    } catch (error) {
      console.error('❌ [useBreakoutRooms] Failed to refresh assignments:', error);
    }
  }, []);

  /**
   * Create breakout rooms
   */
  const createRooms = useCallback(async (config: BreakoutRoomConfig) => {
    if (!managerRef.current) {
      toast({
        title: 'Error',
        description: 'Breakout room manager not initialized',
        variant: 'destructive'
      });
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'creating', config, error: null }));

      const createdRooms = await managerRef.current.createBreakoutRooms(config);

      toast({
        title: 'Breakout rooms created',
        description: `Successfully created ${createdRooms.length} rooms`
      });

      await refreshRooms();
      await refreshAssignments();

      setState(prev => ({ ...prev, status: 'active' }));

    } catch (error: any) {
      console.error('❌ [useBreakoutRooms] Failed to create rooms:', error);
      
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to create rooms'
      }));

      toast({
        title: 'Failed to create rooms',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    }
  }, [toast, refreshRooms, refreshAssignments]);

  /**
   * Close a specific room
   */
  const closeRoom = useCallback(async (roomId: string) => {
    if (!managerRef.current) return;

    try {
      setState(prev => ({ ...prev, status: 'closing' }));

      await managerRef.current.closeRoom(roomId);

      toast({
        title: 'Room closed',
        description: 'Breakout room has been closed'
      });

      await refreshRooms();
      await refreshAssignments();

    } catch (error: any) {
      console.error('❌ [useBreakoutRooms] Failed to close room:', error);
      
      toast({
        title: 'Failed to close room',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });

      setState(prev => ({ ...prev, status: 'error', error: error.message }));
    }
  }, [toast, refreshRooms, refreshAssignments]);

  /**
   * Close all rooms
   */
  const closeAllRooms = useCallback(async () => {
    if (!managerRef.current) return;

    try {
      setState(prev => ({ ...prev, status: 'closing' }));

      await managerRef.current.closeAllRooms();

      toast({
        title: 'All rooms closed',
        description: 'All breakout rooms have been closed'
      });

      await refreshRooms();
      await refreshAssignments();

      setState(prev => ({ ...prev, status: 'closed' }));

    } catch (error: any) {
      console.error('❌ [useBreakoutRooms] Failed to close all rooms:', error);
      
      toast({
        title: 'Failed to close rooms',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });

      setState(prev => ({ ...prev, status: 'error', error: error.message }));
    }
  }, [toast, refreshRooms, refreshAssignments]);

  /**
   * Move participant between rooms
   */
  const moveParticipant = useCallback(async (request: MoveParticipantRequest) => {
    if (!managerRef.current) return;

    try {
      await managerRef.current.moveParticipant(request);

      // Refresh will be triggered by event listener

    } catch (error: any) {
      console.error('❌ [useBreakoutRooms] Failed to move participant:', error);
      
      toast({
        title: 'Failed to move participant',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    }
  }, [toast]);

  return {
    state,
    rooms,
    assignments,
    createRooms,
    closeRoom,
    closeAllRooms,
    moveParticipant,
    refreshRooms,
    refreshAssignments
  };
}

