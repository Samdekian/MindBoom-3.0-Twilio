
import { useState, useCallback } from 'react';
import { useAppointments } from './use-appointments';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface VideoSessionData {
  sessionId: string;
  sessionToken: string;
  videoUrl: string;
  appointmentId: string;
}

export const useAppointmentVideoBridge = () => {
  const { updateAppointment } = useAppointments();
  const { toast } = useToast();
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const createVideoSession = useCallback(async (appointmentId: string): Promise<VideoSessionData | null> => {
    setIsCreatingSession(true);
    
    try {
      // Generate session token and ID
      const sessionId = `session_${appointmentId}_${Date.now()}`;
      const sessionToken = btoa(`${sessionId}_${Math.random().toString(36).substr(2, 9)}`);
      const videoUrl = `/video-conference/${sessionId}`;

      // Update appointment with video session details - fix the type issue
      await updateAppointment.mutateAsync({
        id: appointmentId,
        video_url: videoUrl,
        video_meeting_id: sessionId,
        video_enabled: true,
      } as any);

      // Create instant session record for WebRTC signaling
      const { error } = await supabase
        .from('instant_sessions')
        .insert({
          id: sessionId,
          session_name: `Appointment Session`,
          session_token: sessionToken,
          therapist_id: '', // Will be set by the appointment data
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
          is_active: true,
          waiting_room_enabled: true,
          recording_enabled: false,
          max_participants: 2
        });

      if (error) {
        console.error('Error creating instant session:', error);
        throw new Error('Failed to create video session');
      }

      toast({
        title: "Video Session Created",
        description: "Video session is ready for your appointment",
      });

      return {
        sessionId,
        sessionToken,
        videoUrl,
        appointmentId
      };

    } catch (error: any) {
      console.error('Error creating video session:', error);
      toast({
        title: "Video Session Error",
        description: error.message || "Failed to create video session",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  }, [updateAppointment, toast]);

  const getVideoSessionUrl = useCallback((appointment: any): string | null => {
    if (appointment.video_enabled && appointment.video_url) {
      return appointment.video_url;
    }
    return null;
  }, []);

  const joinVideoSession = useCallback((appointment: any) => {
    const videoUrl = getVideoSessionUrl(appointment);
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    } else {
      toast({
        title: "No Video Session",
        description: "This appointment doesn't have a video session configured",
        variant: "destructive",
      });
    }
  }, [getVideoSessionUrl, toast]);

  return {
    createVideoSession,
    getVideoSessionUrl,
    joinVideoSession,
    isCreatingSession
  };
};
