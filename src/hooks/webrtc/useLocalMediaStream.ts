
import { useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface LocalMediaStreamState {
  stream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  error: string | null;
  loading: boolean;
}

export function useLocalMediaStream() {
  const { toast } = useToast();
  const [state, setState] = useState<LocalMediaStreamState>({
    stream: null,
    isVideoEnabled: true,
    isAudioEnabled: true,
    error: null,
    loading: false
  });

  const streamRef = useRef<MediaStream | null>(null);

  // Get media stream with constraints
  const getMediaStream = useCallback(async (constraints?: MediaStreamConstraints) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const defaultConstraints: MediaStreamConstraints = {
        video: state.isVideoEnabled,
        audio: state.isAudioEnabled
      };

      const finalConstraints = constraints || defaultConstraints;
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia(finalConstraints);
      
      streamRef.current = stream;
      setState(prev => ({
        ...prev,
        stream,
        loading: false,
        error: null
      }));

      return stream;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown media error';
      console.error('Error getting media stream:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        stream: null
      }));

      toast({
        title: "Media Access Error",
        description: "Unable to access camera or microphone. Please check permissions.",
        variant: "destructive"
      });

      return null;
    }
  }, [state.isVideoEnabled, state.isAudioEnabled, toast]);

  // Toggle video track
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      const newVideoEnabled = !state.isVideoEnabled;
      
      videoTracks.forEach(track => {
        track.enabled = newVideoEnabled;
      });
      
      setState(prev => ({ ...prev, isVideoEnabled: newVideoEnabled }));
      return newVideoEnabled;
    }
    return state.isVideoEnabled;
  }, [state.isVideoEnabled]);

  // Toggle audio track
  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      const newAudioEnabled = !state.isAudioEnabled;
      
      audioTracks.forEach(track => {
        track.enabled = newAudioEnabled;
      });
      
      setState(prev => ({ ...prev, isAudioEnabled: newAudioEnabled }));
      return newAudioEnabled;
    }
    return state.isAudioEnabled;
  }, [state.isAudioEnabled]);

  // Stop stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setState(prev => ({
        ...prev,
        stream: null,
        isVideoEnabled: true,
        isAudioEnabled: true
      }));
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    ...state,
    getMediaStream,
    toggleVideo,
    toggleAudio,
    stopStream
  };
}
