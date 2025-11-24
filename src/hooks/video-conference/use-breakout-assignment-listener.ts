/**
 * useBreakoutAssignmentListener Hook
 * Listens for breakout room assignments and automatically joins assigned rooms
 */

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TwilioVideoService } from '@/services/twilio-video-service';
import { getRoomManager } from '@/lib/twilio/room-manager';
import { useToast } from '@/hooks/use-toast';

interface BreakoutAssignmentPayload {
  room_id: string;
  room_name: string;
  twilio_room_sid: string;
  action: 'join' | 'return';
}

interface UseBreakoutAssignmentListenerOptions {
  enabled?: boolean;
  onAssigned?: (payload: BreakoutAssignmentPayload) => void;
  disconnectFromMainSession?: () => Promise<void>;
}

export function useBreakoutAssignmentListener(
  options: UseBreakoutAssignmentListenerOptions = {}
) {
  const { enabled = true, onAssigned, disconnectFromMainSession } = options;
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) {
      console.log('⏸️ [BreakoutAssignmentListener] Disabled, skipping setup');
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cleanupStarted = false;

    const setupListener = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        console.warn('⚠️ [BreakoutAssignmentListener] No authenticated user');
        return;
      }

      console.log('📡 [BreakoutAssignmentListener] Setting up listener for user:', user.id, 'Channel: user:' + user.id + ':breakout');

      // Create a channel to listen for breakout assignments
      channel = supabase.channel(`user:${user.id}:breakout`);
      
      channel
        .on('broadcast', { event: 'breakout_assignment' }, async (payload) => {
          if (cleanupStarted) {
            console.log('🧹 [BreakoutAssignmentListener] Ignoring message, cleanup started');
            return;
          }

          console.log('📨 [BreakoutAssignmentListener] Received broadcast event:', payload);
          const assignment: BreakoutAssignmentPayload = payload.payload;
          
          console.log('📢 [BreakoutAssignmentListener] Received breakout assignment:', assignment);

          // Notify callback if provided
          if (onAssigned) {
            onAssigned(assignment);
          }

          if (assignment.action === 'join') {
            try {
              // Disconnect from main peer-to-peer session first
              if (disconnectFromMainSession) {
                console.log('🔌 [BreakoutAssignmentListener] Disconnecting from main session...');
                await disconnectFromMainSession();
                console.log('✅ [BreakoutAssignmentListener] Disconnected from main session');
              }

              // Get user identity
              const identity = user.email?.split('@')[0] || user.id;

              // Get token for breakout room
              console.log('🎫 [BreakoutAssignmentListener] Getting token for breakout room:', assignment.twilio_room_sid);
              const tokenData = await TwilioVideoService.getAccessToken(
                identity,
                assignment.twilio_room_sid
              );

              console.log('🔌 [BreakoutAssignmentListener] Preparing to join breakout room');

              // Use TwilioRoomManager to connect to breakout room
              const roomManager = getRoomManager();
              
              await roomManager.connect({
                roomName: assignment.twilio_room_sid,
                token: tokenData.token,
                audio: true,
                video: true,
                networkQuality: true,
                dominantSpeaker: true
              });

              console.log('✅ [BreakoutAssignmentListener] Successfully joined breakout room');

              toast({
                title: `Joined ${assignment.room_name}`,
                description: 'You have been assigned to a breakout room'
              });

            } catch (error: any) {
              console.error('❌ [BreakoutAssignmentListener] Failed to join breakout room:', error);
              
              toast({
                title: 'Failed to join breakout room',
                description: error.message || 'Please try joining manually',
                variant: 'destructive'
              });
            }
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            console.log('✅ [BreakoutAssignmentListener] Subscribed to breakout assignments');
          } else if (status === 'CLOSED') {
            console.log('🔌 [BreakoutAssignmentListener] Channel closed');
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ [BreakoutAssignmentListener] Channel error');
          }
        });
    };

    setupListener();

    // Cleanup function
    return () => {
      cleanupStarted = true;
      if (channel) {
        console.log('🧹 [BreakoutAssignmentListener] Cleaning up channel');
        supabase.removeChannel(channel);
        channel = null;
      }
    };
  }, [enabled]); // Only re-run when enabled changes, not on every callback change
}

