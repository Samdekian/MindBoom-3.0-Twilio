
import { useState, useCallback } from 'react';
import { ConnectionQuality, VideoSessionState } from './types';

export interface UseVideoConferenceReturn {
  videoState: VideoSessionState;
  isInSession: boolean;
  sessionDuration: number;
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
  toggleRecording: () => void;
  toggleChat: () => void;
  joinSession: () => Promise<void>;
  leaveSession: () => void;
}

export function useVideoConference(sessionId?: string): UseVideoConferenceReturn {
  const [videoState, setVideoState] = useState<VideoSessionState>({
    isVideoEnabled: true,
    isAudioEnabled: true,
    isScreenSharing: false,
    isRecording: false,
    isChatOpen: false,
    selectedCamera: null,
    selectedMicrophone: null,
    selectedSpeaker: null,
    connectionQuality: 'excellent' as ConnectionQuality,
  });

  const [isInSession, setIsInSession] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  const toggleVideo = useCallback(() => {
    setVideoState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
  }, []);

  const toggleAudio = useCallback(() => {
    setVideoState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
  }, []);

  const toggleScreenShare = useCallback(() => {
    setVideoState(prev => ({ ...prev, isScreenSharing: !prev.isScreenSharing }));
  }, []);

  const toggleRecording = useCallback(() => {
    setVideoState(prev => ({ ...prev, isRecording: !prev.isRecording }));
  }, []);

  const toggleChat = useCallback(() => {
    setVideoState(prev => ({ ...prev, isChatOpen: !prev.isChatOpen }));
  }, []);

  const joinSession = useCallback(async () => {
    setIsInSession(true);
  }, []);

  const leaveSession = useCallback(() => {
    setIsInSession(false);
  }, []);

  return {
    videoState,
    isInSession,
    sessionDuration,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    toggleRecording,
    toggleChat,
    joinSession,
    leaveSession,
  };
}
