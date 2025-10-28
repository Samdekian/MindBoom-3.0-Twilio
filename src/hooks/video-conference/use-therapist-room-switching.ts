/**
 * useTherapistRoomSwitching Hook
 * Allows therapist to join and switch between breakout rooms
 */

import { useState, useCallback } from 'react';
import { TwilioVideoService } from '@/services/twilio-video-service';
import { getRoomManager } from '@/lib/twilio/room-manager';
import { useToast } from '@/hooks/use-toast';

interface UseTherapistRoomSwitchingOptions {
  sessionId: string;
  therapistName: string;
  isTherapist: boolean;
}

interface UseTherapistRoomSwitchingReturn {
  currentRoomId: string | null;
  currentRoomName: string | null;
  isInMainSession: boolean;
  isSwitching: boolean;
  joinBreakoutRoom: (roomId: string, roomName: string, twilioRoomSid: string) => Promise<void>;
  returnToMainSession: () => Promise<void>;
}

export function useTherapistRoomSwitching(
  options: UseTherapistRoomSwitchingOptions
): UseTherapistRoomSwitchingReturn {
  const { sessionId, therapistName, isTherapist } = options;
  const { toast } = useToast();

  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  const roomManager = getRoomManager();

  /**
   * Join a breakout room
   */
  const joinBreakoutRoom = useCallback(async (
    roomId: string,
    roomName: string,
    twilioRoomSid: string
  ) => {
    if (!isTherapist || isSwitching) return;

    try {
      setIsSwitching(true);

      // Disconnect from current room (main or other breakout)
      roomManager.disconnect();

      // Get token for breakout room
      const tokenData = await TwilioVideoService.getAccessToken(
        `${therapistName}-therapist`,
        twilioRoomSid
      );

      // Connect to breakout room
      await roomManager.connect({
        roomName: twilioRoomSid,
        token: tokenData.token,
        audio: true,
        video: true,
        networkQuality: true,
        dominantSpeaker: true
      });

      setCurrentRoomId(roomId);
      setCurrentRoomName(roomName);

      // Log the switch
      await TwilioVideoService.logSessionEvent(sessionId, 'therapist_joined_breakout', {
        room_id: roomId,
        room_name: roomName
      });

      toast({
        title: `Joined ${roomName}`,
        description: 'You are now in the breakout room'
      });

    } catch (error: any) {
      console.error('❌ Failed to join breakout room:', error);
      
      toast({
        title: 'Failed to join room',
        description: error.message || 'Could not connect to breakout room',
        variant: 'destructive'
      });

      // Try to return to main session
      await returnToMainSession();
    } finally {
      setIsSwitching(false);
    }
  }, [isTherapist, isSwitching, therapistName, sessionId, toast]);

  /**
   * Return to main session
   */
  const returnToMainSession = useCallback(async () => {
    if (!isTherapist || isSwitching) return;

    try {
      setIsSwitching(true);

      // Disconnect from breakout room
      roomManager.disconnect();

      // Get main room name
      const mainRoomName = await TwilioVideoService.getOrCreateRoomForSession(sessionId);

      // Get token for main room
      const tokenData = await TwilioVideoService.getAccessToken(
        therapistName,
        mainRoomName
      );

      // Reconnect to main room
      await roomManager.connect({
        roomName: mainRoomName,
        token: tokenData.token,
        audio: true,
        video: true,
        networkQuality: true,
        dominantSpeaker: true
      });

      const previousRoom = currentRoomName;
      setCurrentRoomId(null);
      setCurrentRoomName(null);

      // Log the return
      if (previousRoom) {
        await TwilioVideoService.logSessionEvent(sessionId, 'therapist_left_breakout', {
          previous_room: previousRoom
        });
      }

      toast({
        title: 'Returned to main session',
        description: 'You are back in the main session'
      });

    } catch (error: any) {
      console.error('❌ Failed to return to main session:', error);
      
      toast({
        title: 'Failed to return to main session',
        description: error.message || 'Please refresh the page',
        variant: 'destructive'
      });
    } finally {
      setIsSwitching(false);
    }
  }, [isTherapist, isSwitching, sessionId, therapistName, currentRoomName, toast]);

  return {
    currentRoomId,
    currentRoomName,
    isInMainSession: currentRoomId === null,
    isSwitching,
    joinBreakoutRoom,
    returnToMainSession
  };
}

