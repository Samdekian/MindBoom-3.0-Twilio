/**
 * useBreakoutRoomFilter Hook
 * Filters video streams based on breakout room assignments
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BreakoutRoomAssignment {
  user_id: string | null;
  participant_id: string;
  breakout_room_id: string | null;
  room_name: string | null;
}

interface UseBreakoutRoomFilterOptions {
  sessionId: string;
  currentRoomId?: string | null; // Current room user is viewing (null = main session)
  enabled?: boolean;
}

interface UseBreakoutRoomFilterReturn {
  assignments: Map<string, string | null>; // Map<user_id, breakout_room_id>
  participantsInBreakoutRooms: Set<string>; // Set of user_ids in breakout rooms
  isUserInBreakoutRoom: (userId: string) => boolean;
  getUserRoomId: (userId: string) => string | null;
  shouldShowStream: (streamId: string) => boolean;
}

export function useBreakoutRoomFilter(
  options: UseBreakoutRoomFilterOptions
): UseBreakoutRoomFilterReturn {
  const { sessionId, currentRoomId = null, enabled = true } = options;
  const [assignments, setAssignments] = useState<Map<string, string | null>>(new Map());

  // Fetch breakout room assignments
  useEffect(() => {
    if (!enabled || !sessionId) {
      setAssignments(new Map());
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchAssignments = async () => {
      try {
        // Get all session participants
        const { data: participants, error: participantsError } = await supabase
          .from('instant_session_participants')
          .select('id, user_id')
          .eq('session_id', sessionId)
          .eq('is_active', true);

        if (participantsError || !participants) {
          console.error('❌ [useBreakoutRoomFilter] Failed to get participants:', participantsError);
          return;
        }

        // Get breakout room assignments for each participant
        const participantIds = participants.map(p => p.id);
        if (participantIds.length === 0) {
          setAssignments(new Map());
          return;
        }

        const { data: breakoutAssignments, error: assignmentsError } = await supabase
          .from('breakout_room_participants')
          .select('participant_id, user_id, breakout_room_id, breakout_rooms(room_name)')
          .in('participant_id', participantIds)
          .eq('is_active', true);

        if (assignmentsError) {
          console.error('❌ [useBreakoutRoomFilter] Failed to get assignments:', assignmentsError);
          return;
        }

        // Build map of user_id -> breakout_room_id
        const assignmentMap = new Map<string, string | null>();
        
        participants.forEach(participant => {
          if (!participant.user_id) return;
          
          const assignment = breakoutAssignments?.find(
            a => a.participant_id === participant.id
          );
          
          assignmentMap.set(participant.user_id, assignment?.breakout_room_id || null);
        });

        console.log('📋 [useBreakoutRoomFilter] Room assignments:', {
          total: assignmentMap.size,
          inBreakoutRooms: Array.from(assignmentMap.values()).filter(Boolean).length,
          assignments: Array.from(assignmentMap.entries())
        });

        setAssignments(assignmentMap);
      } catch (error) {
        console.error('❌ [useBreakoutRoomFilter] Error fetching assignments:', error);
      }
    };

    // Initial fetch
    fetchAssignments();

    // Subscribe to realtime updates for breakout room participant changes
    channel = supabase
      .channel(`breakout-assignments-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'breakout_room_participants'
        },
        () => {
          // Refetch on any change
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [sessionId, enabled]);

  // Helper functions
  const participantsInBreakoutRooms = useMemo(() => {
    const inRooms = new Set<string>();
    assignments.forEach((roomId, userId) => {
      if (roomId) {
        inRooms.add(userId);
      }
    });
    return inRooms;
  }, [assignments]);

  const isUserInBreakoutRoom = useCallback((userId: string): boolean => {
    return participantsInBreakoutRooms.has(userId);
  }, [participantsInBreakoutRooms]);

  const getUserRoomId = useCallback((userId: string): string | null => {
    return assignments.get(userId) || null;
  }, [assignments]);

  // Extract user ID from stream ID (stream.id includes userId)
  const extractUserIdFromStream = useCallback((streamId: string): string | null => {
    // Stream IDs typically include the user ID
    // Format might be like: "user-{userId}-stream" or just contain the userId
    for (const [userId] of assignments) {
      if (streamId.includes(userId)) {
        return userId;
      }
    }
    return null;
  }, [assignments]);

  // Determine if a stream should be shown based on current room context
  const shouldShowStream = useCallback((streamId: string): boolean => {
    const userId = extractUserIdFromStream(streamId);
    if (!userId) {
      // If we can't identify the user, show the stream (fallback)
      return true;
    }

    const userRoomId = getUserRoomId(userId);

    // If viewing main session (currentRoomId === null)
    if (currentRoomId === null) {
      // Only show participants NOT in breakout rooms
      return userRoomId === null;
    }

    // If viewing a breakout room
    // Only show participants in the same breakout room
    return userRoomId === currentRoomId;
  }, [currentRoomId, extractUserIdFromStream, getUserRoomId]);

  return {
    assignments,
    participantsInBreakoutRooms,
    isUserInBreakoutRoom,
    getUserRoomId,
    shouldShowStream
  };
}

