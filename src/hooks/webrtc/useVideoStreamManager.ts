
import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface VideoStreamState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isLocalVideoReady: boolean;
  isRemoteVideoReady: boolean;
}

export function useVideoStreamManager() {
  const { toast } = useToast();
  const [streamState, setStreamState] = useState<VideoStreamState>({
    localStream: null,
    remoteStream: null,
    isLocalVideoReady: false,
    isRemoteVideoReady: false
  });
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Set local stream and connect to video element
  const setLocalStream = useCallback((stream: MediaStream | null) => {
    console.log('🎥 Setting local stream:', stream?.getTracks().length || 0, 'tracks');
    
    setStreamState(prev => ({ ...prev, localStream: stream }));
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      if (stream) {
        localVideoRef.current.muted = true; // Prevent audio feedback
        setStreamState(prev => ({ ...prev, isLocalVideoReady: true }));
        console.log('✅ Local video element connected');
      } else {
        setStreamState(prev => ({ ...prev, isLocalVideoReady: false }));
      }
    }
  }, []);
  
  // Set remote stream and connect to video element
  const setRemoteStream = useCallback((stream: MediaStream | null) => {
    console.log('📺 Setting remote stream:', stream?.getTracks().length || 0, 'tracks');
    
    setStreamState(prev => ({ ...prev, remoteStream: stream }));
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = stream;
      if (stream && stream.getTracks().length > 0) {
        setStreamState(prev => ({ ...prev, isRemoteVideoReady: true }));
        console.log('✅ Remote video element connected');
      } else {
        setStreamState(prev => ({ ...prev, isRemoteVideoReady: false }));
      }
    }
  }, []);
  
  // Get user media with proper constraints
  const getUserMedia = useCallback(async (constraints: MediaStreamConstraints) => {
    try {
      console.log('🎯 Requesting user media with constraints:', constraints);
      
      // Stop existing stream first
      if (streamState.localStream) {
        streamState.localStream.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Stopped existing track:', track.kind);
        });
      }
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Got user media stream with tracks:', stream.getTracks().map(t => `${t.kind}: ${t.enabled}`));
      
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('❌ Failed to get user media:', error);
      toast({
        title: "Media Access Error",
        description: "Unable to access camera or microphone",
        variant: "destructive"
      });
      throw error;
    }
  }, [streamState.localStream, setLocalStream, toast]);
  
  // Cleanup streams
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up video streams');
    
    if (streamState.localStream) {
      streamState.localStream.getTracks().forEach(track => track.stop());
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    
    setStreamState({
      localStream: null,
      remoteStream: null,
      isLocalVideoReady: false,
      isRemoteVideoReady: false
    });
  }, [streamState.localStream]);
  
  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);
  
  return {
    ...streamState,
    localVideoRef,
    remoteVideoRef,
    setLocalStream,
    setRemoteStream,
    getUserMedia,
    cleanup
  };
}
