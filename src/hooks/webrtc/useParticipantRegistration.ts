import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface ParticipantRegistrationOptions {
  sessionId: string;
  onParticipantJoined?: (participantId: string) => void;
  onParticipantLeft?: (participantId: string) => void;
}

/**
 * Hook for managing participant registration in database when WebRTC events occur
 */
export function useParticipantRegistration({
  sessionId,
  onParticipantJoined,
  onParticipantLeft
}: ParticipantRegistrationOptions) {
  const { user, isTherapist } = useAuthRBAC();
  const { toast } = useToast();

  // Register current user as participant when they join
  const registerParticipant = useCallback(async () => {
    if (!user?.id || !sessionId || sessionId === 'unknown') {
      console.warn('[ParticipantRegistration] Missing user ID or session ID');
      toast({
        title: "Registration Failed",
        description: "Invalid user or session information.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // Check if session exists and validate access
      const { data: sessionData, error: sessionError } = await supabase
        .from('instant_sessions')
        .select('id, therapist_id, is_active, expires_at, max_participants')
        .eq('id', sessionId)
        .single();

      if (sessionError) {
        console.error('[ParticipantRegistration] Session not found:', sessionError);
        toast({
          title: "Session Not Found",
          description: "The session could not be accessed.",
          variant: "destructive",
        });
        return false;
      }

      // Validate session is active and not expired
      if (!sessionData.is_active || new Date(sessionData.expires_at) < new Date()) {
        console.warn('[ParticipantRegistration] Session is inactive or expired');
        toast({
          title: "Session Unavailable",
          description: "This session is no longer active.",
          variant: "destructive",
        });
        return false;
      }

      // Check if user can join (capacity check)
      const { count } = await supabase
        .from('instant_session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('is_active', true);

      const isSessionOwner = sessionData.therapist_id === user.id;
      if (count && count >= sessionData.max_participants && !isSessionOwner) {
        toast({
          title: "Session Full",
          description: "This session has reached maximum capacity.",
          variant: "destructive",
        });
        return false;
      }

      // Determine participant role
      console.log('🔍 [ParticipantRegistration] User:', user);
      console.log('🔍 [ParticipantRegistration] Is therapist:', isTherapist);
      console.log('🔍 [ParticipantRegistration] Session owner check:', sessionData.therapist_id === user.id);
      
      const participantRole = isTherapist ? 'host' : 'participant';
      console.log('🔍 [ParticipantRegistration] Assigned role:', participantRole);
      
      const participantName = user.user_metadata?.fullName || user.user_metadata?.email || 'Anonymous';

      // Insert or update participant record
      const { data, error } = await supabase
        .from('instant_session_participants')
        .upsert({
          session_id: sessionId,
          user_id: user.id,
          participant_name: participantName,
          role: participantRole,
          is_active: true,
          joined_at: new Date().toISOString()
        }, {
          onConflict: 'session_id,user_id',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [ParticipantRegistration] Failed to register participant:', error);
        console.error('❌ [ParticipantRegistration] Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        
        // Handle specific error cases
        if (error.code === '42501') {
          toast({
            title: "Access Denied",
            description: "You don't have permission to join this session.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Registration Failed", 
            description: "Could not join the session. Please try again.",
            variant: "destructive",
          });
        }
        return false;
      }

      console.log('✅ [ParticipantRegistration] Participant registered:', data);
      toast({
        title: "Session Joined",
        description: "Successfully joined the session.",
      });
      onParticipantJoined?.(data.id);
      return true;
    } catch (error) {
      console.error('[ParticipantRegistration] Error registering participant:', error);
      toast({
        title: "Connection Error",
        description: "Network error while joining session.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, sessionId, isTherapist, onParticipantJoined, toast]);

  // Unregister participant when they leave
  const unregisterParticipant = useCallback(async () => {
    if (!user?.id || !sessionId) {
      return;
    }

    try {
      const { error } = await supabase
        .from('instant_session_participants')
        .update({
          is_active: false,
          left_at: new Date().toISOString()
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[ParticipantRegistration] Failed to unregister participant:', error);
      } else {
        console.log('✅ [ParticipantRegistration] Participant unregistered');
        onParticipantLeft?.(user.id);
      }
    } catch (error) {
      console.error('[ParticipantRegistration] Error unregistering participant:', error);
    }
  }, [user, sessionId, onParticipantLeft]);

  // Auto-register when component mounts and sessionId is available
  useEffect(() => {
    if (sessionId && sessionId !== 'unknown' && user?.id) {
      registerParticipant();
    }

    // Cleanup on unmount
    return () => {
      if (sessionId && sessionId !== 'unknown' && user?.id) {
        unregisterParticipant();
      }
    };
  }, [sessionId, user?.id]); // Note: intentionally not including registerParticipant/unregisterParticipant to avoid infinite loops

  return {
    registerParticipant,
    unregisterParticipant
  };
}