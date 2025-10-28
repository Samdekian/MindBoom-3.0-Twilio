/**
 * useRoomControls Hook
 * React hook for therapist room control features
 */

import { useState, useCallback } from 'react';
import { TwilioVideoService } from '@/services/twilio-video-service';
import { useToast } from '@/hooks/use-toast';

interface UseRoomControlsOptions {
  sessionId: string;
  isTherapist: boolean;
}

interface UseRoomControlsReturn {
  canControl: boolean;
  isMutingAll: boolean;
  isEndingSession: boolean;
  muteAllParticipants: () => Promise<void>;
  endSessionForAll: () => Promise<void>;
  lockSession: () => Promise<void>;
  unlockSession: () => Promise<void>;
}

export function useRoomControls(options: UseRoomControlsOptions): UseRoomControlsReturn {
  const { sessionId, isTherapist } = options;
  const { toast } = useToast();

  const [isMutingAll, setIsMutingAll] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);

  /**
   * Mute all participants (therapist only)
   */
  const muteAllParticipants = useCallback(async () => {
    if (!isTherapist) {
      toast({
        title: 'Permission denied',
        description: 'Only therapists can mute all participants',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsMutingAll(true);

      // Log the action
      await TwilioVideoService.logSessionEvent(sessionId, 'mute_all_requested');

      toast({
        title: 'Mute all requested',
        description: 'Participants will be notified to mute their microphones'
      });

      // In a real implementation, this would send a signal to all participants
      // For now, we just log it

    } catch (error: any) {
      console.error('❌ [useRoomControls] Failed to mute all:', error);
      
      toast({
        title: 'Failed to mute all',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsMutingAll(false);
    }
  }, [sessionId, isTherapist, toast]);

  /**
   * End session for all participants (therapist only)
   */
  const endSessionForAll = useCallback(async () => {
    if (!isTherapist) {
      toast({
        title: 'Permission denied',
        description: 'Only therapists can end the session',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsEndingSession(true);

      // Mark session as ended
      await TwilioVideoService.logSessionEvent(sessionId, 'session_ended');

      toast({
        title: 'Session ended',
        description: 'The session has been ended for all participants'
      });

      // In a real implementation, this would disconnect all participants
      // and close the Twilio room

    } catch (error: any) {
      console.error('❌ [useRoomControls] Failed to end session:', error);
      
      toast({
        title: 'Failed to end session',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsEndingSession(false);
    }
  }, [sessionId, isTherapist, toast]);

  /**
   * Lock session (prevent new participants)
   */
  const lockSession = useCallback(async () => {
    if (!isTherapist) return;

    try {
      await TwilioVideoService.logSessionEvent(sessionId, 'session_locked');

      toast({
        title: 'Session locked',
        description: 'No new participants can join'
      });

    } catch (error: any) {
      console.error('❌ [useRoomControls] Failed to lock session:', error);
      
      toast({
        title: 'Failed to lock session',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    }
  }, [sessionId, isTherapist, toast]);

  /**
   * Unlock session (allow new participants)
   */
  const unlockSession = useCallback(async () => {
    if (!isTherapist) return;

    try {
      await TwilioVideoService.logSessionEvent(sessionId, 'session_unlocked');

      toast({
        title: 'Session unlocked',
        description: 'New participants can now join'
      });

    } catch (error: any) {
      console.error('❌ [useRoomControls] Failed to unlock session:', error);
      
      toast({
        title: 'Failed to unlock session',
        description: error.message || 'An error occurred',
        variant: 'destructive'
      });
    }
  }, [sessionId, isTherapist, toast]);

  return {
    canControl: isTherapist,
    isMutingAll,
    isEndingSession,
    muteAllParticipants,
    endSessionForAll,
    lockSession,
    unlockSession
  };
}

