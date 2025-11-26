/**
 * useBreakoutAssignmentListener Hook
 * Listens for breakout room assignments and automatically joins assigned rooms
 * Includes polling fallback for reliability
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Room } from 'twilio-video';
import { supabase } from '@/integrations/supabase/client';
import { TwilioVideoService } from '@/services/twilio-video-service';
import { getRoomManager } from '@/lib/twilio/room-manager';
import { useToast } from '@/hooks/use-toast';

export interface BreakoutAssignmentPayload {
  room_id: string;
  room_name: string;
  twilio_room_sid: string;
  action: 'join' | 'return';
}

interface UseBreakoutAssignmentListenerOptions {
  enabled?: boolean;
  sessionId?: string;
  onAssigned?: (payload: BreakoutAssignmentPayload) => void;
  disconnectFromMainSession?: () => Promise<void>;
  pollingInterval?: number; // ms, default 30000 (30 seconds)
}

interface UseBreakoutAssignmentListenerReturn {
  isInBreakoutRoom: boolean;
  currentBreakoutRoom: Room | null;
  currentRoomId: string | null;
  currentRoomName: string | null;
  leaveBreakoutRoom: () => Promise<void>;
}

// Max consecutive errors before stopping polling
const MAX_CONSECUTIVE_ERRORS = 3;
// Base backoff delay after error (doubles each time)
const BASE_ERROR_BACKOFF_MS = 10000;

export function useBreakoutAssignmentListener(
  options: UseBreakoutAssignmentListenerOptions = {}
): UseBreakoutAssignmentListenerReturn {
  const { 
    enabled = true, 
    sessionId,
    onAssigned, 
    disconnectFromMainSession,
    pollingInterval = 30000 // Increased from 5000 to 30000 (30 seconds)
  } = options;
  const { toast } = useToast();

  const [isInBreakoutRoom, setIsInBreakoutRoom] = useState(false);
  const [currentBreakoutRoom, setCurrentBreakoutRoom] = useState<Room | null>(null);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);

  const lastCheckedAssignmentRef = useRef<string | null>(null);
  const failedAssignmentsRef = useRef<Set<string>>(new Set()); // Track failed assignments
  const consecutiveErrorsRef = useRef(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fastPollingIntervalRef = useRef<NodeJS.Timeout | null>(null); // Fast polling for first 30 seconds
  const userIdRef = useRef<string | null>(null);
  const cleanupStartedRef = useRef(false);
  const isJoiningRef = useRef(false); // Prevent concurrent join attempts
  const setupTimeRef = useRef<number>(0); // Track when setup started for fast polling

  /**
   * Join a breakout room
   */
  const joinBreakoutRoom = useCallback(async (assignment: BreakoutAssignmentPayload) => {
    // Prevent concurrent join attempts or joining after cleanup
    if (cleanupStartedRef.current || isJoiningRef.current) {
      console.log('⏸️ [BreakoutAssignmentListener] Skipping join (cleanup or already joining)');
      return;
    }

    const assignmentKey = assignment.room_id;
    
    // Don't retry failed assignments
    if (failedAssignmentsRef.current.has(assignmentKey)) {
      console.log('⏸️ [BreakoutAssignmentListener] Skipping previously failed assignment:', assignmentKey);
      return;
    }

    isJoiningRef.current = true;
    console.log('🚀 [BreakoutAssignmentListener] Joining breakout room:', assignment);

    try {
      // Disconnect from main WebRTC session first
      if (disconnectFromMainSession) {
        console.log('🔌 [BreakoutAssignmentListener] Disconnecting from main session...');
        await disconnectFromMainSession();
        console.log('✅ [BreakoutAssignmentListener] Disconnected from main session');
      }

      // Get user info for identity
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) {
        throw new Error('No authenticated user');
      }

      const identity = user.email?.split('@')[0] || user.id;

      // Get Twilio token for breakout room
      console.log('🎫 [BreakoutAssignmentListener] Getting token for:', assignment.twilio_room_sid);
      const tokenData = await TwilioVideoService.getAccessToken(
        identity,
        assignment.twilio_room_sid
      );

      // Connect to Twilio breakout room
      console.log('🔌 [BreakoutAssignmentListener] Connecting to Twilio room...');
      const roomManager = getRoomManager();
      const room = await roomManager.connect({
        roomName: assignment.twilio_room_sid,
        token: tokenData.token,
        audio: true,
        video: true,
        networkQuality: true,
        dominantSpeaker: true
      });

      console.log('✅ [BreakoutAssignmentListener] Connected to breakout room:', room.sid);

      // Reset error counter on success
      consecutiveErrorsRef.current = 0;

      // Update state
      setCurrentBreakoutRoom(room);
      setCurrentRoomId(assignment.room_id);
      setCurrentRoomName(assignment.room_name);
      setIsInBreakoutRoom(true);

      toast({
        title: `Joined ${assignment.room_name}`,
        description: 'You have been assigned to a breakout room'
      });

      // Notify callback
      if (onAssigned) {
        onAssigned(assignment);
      }

    } catch (error: any) {
      console.error('❌ [BreakoutAssignmentListener] Failed to join breakout room:', error);
      
      // Mark this assignment as failed to prevent retrying
      failedAssignmentsRef.current.add(assignmentKey);
      lastCheckedAssignmentRef.current = assignmentKey; // Prevent polling from retrying
      consecutiveErrorsRef.current += 1;
      
      // Only show toast on first failure for this assignment
      if (!failedAssignmentsRef.current.has(assignmentKey)) {
        toast({
          title: 'Failed to join breakout room',
          description: error.message || 'Please try joining manually',
          variant: 'destructive'
        });
      }
      
      // Stop polling if too many consecutive errors
      if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
        console.warn('⚠️ [BreakoutAssignmentListener] Too many errors, stopping polling');
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } finally {
      isJoiningRef.current = false;
    }
  }, [disconnectFromMainSession, onAssigned, toast]);

  /**
   * Leave breakout room and return to main session
   */
  const leaveBreakoutRoom = useCallback(async () => {
    console.log('🔌 [BreakoutAssignmentListener] Leaving breakout room');

    try {
      const roomManager = getRoomManager();
      roomManager.disconnect();

      // Clear the current room from failed list so it can be rejoined
      if (currentRoomId) {
        failedAssignmentsRef.current.delete(currentRoomId);
      }

      setCurrentBreakoutRoom(null);
      setCurrentRoomId(null);
      setCurrentRoomName(null);
      setIsInBreakoutRoom(false);
      lastCheckedAssignmentRef.current = null;
      consecutiveErrorsRef.current = 0; // Reset error counter

      toast({
        title: 'Left breakout room',
        description: 'Returning to main session'
      });
    } catch (error: any) {
      console.error('❌ [BreakoutAssignmentListener] Error leaving breakout room:', error);
    }
  }, [currentRoomId, toast]);

  /**
   * Poll database for assignment changes (fallback for broadcast)
   */
  const checkForAssignment = useCallback(async () => {
    // Skip if cleanup started, no user, already joining, or too many errors
    if (cleanupStartedRef.current || !userIdRef.current || isJoiningRef.current) {
      return;
    }
    
    if (consecutiveErrorsRef.current >= MAX_CONSECUTIVE_ERRORS) {
      console.log('⏸️ [BreakoutAssignmentListener] Polling paused due to errors');
      return;
    }

    try {
      // Get current user's participant record (don't filter by is_active - may be in breakout)
      const { data: participant } = await supabase
        .from('instant_session_participants')
        .select('id')
        .eq('user_id', userIdRef.current)
        .maybeSingle();

      if (!participant) return;

      // Check for active breakout room assignment
      const { data: assignment, error } = await supabase
        .from('breakout_room_participants')
        .select(`
          breakout_room_id,
          breakout_rooms (
            id,
            room_name,
            twilio_room_sid,
            is_active
          )
        `)
        .eq('participant_id', participant.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('❌ [BreakoutAssignmentListener] Poll error:', error);
        consecutiveErrorsRef.current += 1;
        return;
      }

      // Reset error counter on successful query
      consecutiveErrorsRef.current = 0;

      // Check if there's an assignment we haven't processed
      const breakoutRoom = (assignment as any)?.breakout_rooms;
      
      if (assignment && breakoutRoom?.is_active && breakoutRoom?.twilio_room_sid) {
        const assignmentKey = breakoutRoom.id;
        
        // Skip if already processed, already failed, or already in this room
        if (lastCheckedAssignmentRef.current === assignmentKey) return;
        if (failedAssignmentsRef.current.has(assignmentKey)) return;
        if (isInBreakoutRoom && currentRoomId === assignmentKey) return;
        
        // Only process if not currently in a breakout room
        if (!isInBreakoutRoom) {
          console.log('📡 [BreakoutAssignmentListener] Found assignment via polling:', breakoutRoom);
          
          lastCheckedAssignmentRef.current = assignmentKey;
          
          await joinBreakoutRoom({
            room_id: breakoutRoom.id,
            room_name: breakoutRoom.room_name,
            twilio_room_sid: breakoutRoom.twilio_room_sid,
            action: 'join'
          });
        }
      } else if (!assignment && isInBreakoutRoom) {
        // No assignment but we're in a room - we were removed
        console.log('📡 [BreakoutAssignmentListener] Assignment removed, leaving room');
        await leaveBreakoutRoom();
      }
    } catch (error) {
      console.error('❌ [BreakoutAssignmentListener] Poll check failed:', error);
      consecutiveErrorsRef.current += 1;
    }
  }, [isInBreakoutRoom, currentRoomId, joinBreakoutRoom, leaveBreakoutRoom]);

  /**
   * Setup broadcast listener and polling
   */
  useEffect(() => {
    if (!enabled) {
      console.log('⏸️ [BreakoutAssignmentListener] Disabled, skipping setup');
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    cleanupStartedRef.current = false;

    const setupListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.warn('⚠️ [BreakoutAssignmentListener] No authenticated user');
        return;
      }

      userIdRef.current = user.id;
      console.log('📡 [BreakoutAssignmentListener] Setting up for user:', user.id);

      // 1. Setup broadcast listener (primary)
      channel = supabase.channel(`user:${user.id}:breakout`);
      
      channel
        .on('broadcast', { event: 'breakout_assignment' }, async (payload) => {
          if (cleanupStartedRef.current) {
            console.log('🧹 [BreakoutAssignmentListener] Ignoring message, cleanup started');
            return;
          }

          console.log('📨 [BreakoutAssignmentListener] Received broadcast:', payload);
          const assignment: BreakoutAssignmentPayload = payload.payload;
          
          if (assignment.action === 'join') {
            await joinBreakoutRoom(assignment);
          } else if (assignment.action === 'return') {
            await leaveBreakoutRoom();
          }
        })
        .subscribe(async (status) => {
          console.log('📡 [BreakoutAssignmentListener] Channel status:', status);
          if (status === 'SUBSCRIBED') {
            console.log('✅ [BreakoutAssignmentListener] Subscribed to broadcasts');
          }
        });

      // 2. Setup polling (fallback)
      setupTimeRef.current = Date.now();
      
      // Fast polling for first 30 seconds (every 3 seconds)
      const FAST_POLLING_INTERVAL = 3000;
      const FAST_POLLING_DURATION = 30000;
      
      console.log('⚡ [BreakoutAssignmentListener] Starting fast polling (3s intervals for 30s)');
      fastPollingIntervalRef.current = setInterval(() => {
        if (Date.now() - setupTimeRef.current >= FAST_POLLING_DURATION) {
          // Switch to slow polling after 30 seconds
          if (fastPollingIntervalRef.current) {
            clearInterval(fastPollingIntervalRef.current);
            fastPollingIntervalRef.current = null;
            console.log('⏱️ [BreakoutAssignmentListener] Switching to slow polling');
          }
        } else {
          checkForAssignment();
        }
      }, FAST_POLLING_INTERVAL);
      
      // Slow polling (normal interval - 30 seconds)
      console.log('⏱️ [BreakoutAssignmentListener] Starting slow polling fallback');
      pollingIntervalRef.current = setInterval(checkForAssignment, pollingInterval);
      
      // Initial check
      await checkForAssignment();
    };

    setupListener();

    // Cleanup
    return () => {
      cleanupStartedRef.current = true;
      
      if (channel) {
        console.log('🧹 [BreakoutAssignmentListener] Cleaning up channel');
        supabase.removeChannel(channel);
        channel = null;
      }

      if (fastPollingIntervalRef.current) {
        console.log('🧹 [BreakoutAssignmentListener] Stopping fast polling');
        clearInterval(fastPollingIntervalRef.current);
        fastPollingIntervalRef.current = null;
      }

      if (pollingIntervalRef.current) {
        console.log('🧹 [BreakoutAssignmentListener] Stopping slow polling');
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      // Reset state refs on cleanup
      failedAssignmentsRef.current.clear();
      consecutiveErrorsRef.current = 0;
      isJoiningRef.current = false;
    };
  }, [enabled, pollingInterval, joinBreakoutRoom, leaveBreakoutRoom, checkForAssignment]);

  // Subscribe to database changes for this user's assignments
  useEffect(() => {
    if (!enabled || !sessionId) return;

    const setupDbListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) return;

      // Get participant ID for this session
      const { data: participant } = await supabase
        .from('instant_session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (!participant) return;

      console.log('📡 [BreakoutAssignmentListener] Setting up DB listener for participant:', participant.id);

      // Subscribe to changes in breakout_room_participants for this participant
      const dbChannel = supabase
        .channel(`breakout-participant-${participant.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'breakout_room_participants',
            filter: `participant_id=eq.${participant.id}`
          },
          async (payload) => {
            console.log('📥 [BreakoutAssignmentListener] DB change:', payload);
            
            // Trigger a check for assignments
            await checkForAssignment();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(dbChannel);
      };
    };

    const cleanup = setupDbListener();
    return () => {
      cleanup?.then(fn => fn?.());
    };
  }, [enabled, sessionId, checkForAssignment]);

  return {
    isInBreakoutRoom,
    currentBreakoutRoom,
    currentRoomId,
    currentRoomName,
    leaveBreakoutRoom
  };
}
