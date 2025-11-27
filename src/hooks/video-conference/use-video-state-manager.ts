
import { useState, useCallback } from 'react';
import { VideoSessionState, ConnectionQuality, VideoQuality } from '@/types/video-conference';

export function useVideoStateManager() {
  const [videoState, setVideoState] = useState<VideoSessionState>({
    videoEnabled: false,
    audioEnabled: true,
    screenShareEnabled: false,
    recordingEnabled: false,
    connectionQuality: "excellent",
    videoQuality: "high"
  });
  
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    try {
      setVideoState(prev => ({
        ...prev,
        videoEnabled: !prev.videoEnabled
      }));
      return true;
    } catch (error) {
      console.error("Error toggling video:", error);
      return false;
    }
  }, []);

  const toggleAudio = useCallback(async (): Promise<boolean> => {
    try {
      setVideoState(prev => ({
        ...prev,
        audioEnabled: !prev.audioEnabled
      }));
      return true;
    } catch (error) {
      console.error("Error toggling audio:", error);
      return false;
    }
  }, []);

  const toggleScreenShare = useCallback(async (): Promise<boolean> => {
    try {
      setVideoState(prev => ({
        ...prev,
        screenShareEnabled: !prev.screenShareEnabled
      }));
      return true;
    } catch (error) {
      console.error("Error toggling screen share:", error);
      return false;
    }
  }, []);
  
  const toggleRecording = useCallback(async (): Promise<boolean> => {
    try {
      setVideoState(prev => ({
        ...prev,
        recordingEnabled: !prev.recordingEnabled
      }));
      return true;
    } catch (error) {
      console.error('Failed to toggle recording:', error);
      return false;
    }
  }, []);

  const setConnectionQuality = useCallback((quality: ConnectionQuality) => {
    setVideoState(prev => ({
      ...prev,
      connectionQuality: quality
    }));
  }, []);

  const setVideoQuality = useCallback((quality: VideoQuality) => {
    setVideoState(prev => ({
      ...prev,
      videoQuality: quality
    }));
  }, []);
  
  return {
    videoState,
    toggleVideo,
    toggleAudio,
    toggleScreenShare,
    toggleRecording,
    setConnectionQuality,
    setVideoQuality
  };
}
