
import { useState, useCallback, useEffect, useRef } from "react";
import { useToast } from "../use-toast";

interface DisplayMediaOptions {
  video: boolean | {
    cursor?: "always" | "motion" | "never";
    displaySurface?: "application" | "browser" | "monitor" | "window";
  };
  audio: boolean;
}

export function useScreenSharing(
  peerConnection: RTCPeerConnection | null, 
  localVideoRef: React.RefObject<HTMLVideoElement>,
  setVideoState: React.Dispatch<React.SetStateAction<any>>
) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasSharingPermission, setHasSharingPermission] = useState(false);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const originalStreamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  
  // Check if screen sharing is supported
  useEffect(() => {
    const isSupported = 
      navigator.mediaDevices && 
      'getDisplayMedia' in navigator.mediaDevices;
    
    setHasSharingPermission(isSupported);
    
    if (!isSupported) {
      console.warn('Screen sharing not supported in this browser');
    }
  }, []);
  
  // Start screen sharing
  const startScreenSharing = useCallback(async () => {
    if (!peerConnection || !hasSharingPermission) return false;
    
    try {
      // Store the original stream for later
      if (localVideoRef.current && localVideoRef.current.srcObject instanceof MediaStream) {
        originalStreamRef.current = localVideoRef.current.srcObject;
      }
      
      // Get screen sharing stream
      const options: DisplayMediaOptions = {
        video: {
          // Use properties that are valid for DisplayMediaOptions
          displaySurface: "monitor",
        },
        audio: true
      };
      
      const screenStream = await navigator.mediaDevices.getDisplayMedia(options);
      
      screenStreamRef.current = screenStream;
      
      // Handle stream ending (user stops sharing)
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenSharing();
      };
      
      // Replace track in peer connection
      if (peerConnection) {
        const senders = peerConnection.getSenders();
        const videoSender = senders.find(sender => 
          sender.track && sender.track.kind === 'video'
        );
        
        if (videoSender) {
          const screenVideoTrack = screenStream.getVideoTracks()[0];
          await videoSender.replaceTrack(screenVideoTrack);
        }
        
        // If screen share has audio, also replace audio track
        const audioTracks = screenStream.getAudioTracks();
        if (audioTracks.length > 0) {
          const audioSender = senders.find(sender => 
            sender.track && sender.track.kind === 'audio'
          );
          
          if (audioSender) {
            await audioSender.replaceTrack(audioTracks[0]);
          }
        }
      }
      
      // Show screen share in local video element
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }
      
      setIsScreenSharing(true);
      setVideoState(prev => ({ ...prev, isScreenSharing: true }));
      
      toast({
        title: "Screen Sharing Started",
        description: "You are now sharing your screen."
      });
      
      return true;
    } catch (err) {
      console.error('Error starting screen share:', err);
      
      // User probably cancelled the screen share dialog
      if ((err as Error).name === 'NotAllowedError') {
        toast({
          title: "Screen Share Cancelled",
          description: "You cancelled the screen sharing request."
        });
      } else {
        toast({
          title: "Screen Share Error",
          description: "Failed to start screen sharing."
        });
      }
      
      return false;
    }
  }, [peerConnection, hasSharingPermission, localVideoRef, toast, setVideoState]);
  
  // Stop screen sharing
  const stopScreenSharing = useCallback(async () => {
    try {
      // Stop all tracks in the screen sharing stream
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      
      // Restore original video track in peer connection
      if (peerConnection && originalStreamRef.current) {
        const senders = peerConnection.getSenders();
        
        // Restore video track
        const videoSender = senders.find(sender => 
          sender.track && sender.track.kind === 'video'
        );
        
        if (videoSender) {
          const originalVideoTrack = originalStreamRef.current.getVideoTracks()[0];
          if (originalVideoTrack) {
            await videoSender.replaceTrack(originalVideoTrack);
          }
        }
        
        // Restore audio track
        const audioSender = senders.find(sender => 
          sender.track && sender.track.kind === 'audio'
        );
        
        if (audioSender) {
          const originalAudioTrack = originalStreamRef.current.getAudioTracks()[0];
          if (originalAudioTrack) {
            await audioSender.replaceTrack(originalAudioTrack);
          }
        }
      }
      
      // Restore original stream in local video element
      if (localVideoRef.current && originalStreamRef.current) {
        localVideoRef.current.srcObject = originalStreamRef.current;
      }
      
      setIsScreenSharing(false);
      setVideoState(prev => ({ ...prev, isScreenSharing: false }));
      
      toast({
        title: "Screen Sharing Stopped",
        description: "You have stopped sharing your screen."
      });
      
      return true;
    } catch (err) {
      console.error('Error stopping screen share:', err);
      
      toast({
        title: "Error",
        description: "Failed to stop screen sharing."
      });
      
      return false;
    }
  }, [peerConnection, localVideoRef, toast, setVideoState]);
  
  // Toggle screen sharing
  const toggleScreenSharing = useCallback(async () => {
    if (isScreenSharing) {
      return await stopScreenSharing();
    } else {
      return await startScreenSharing();
    }
  }, [isScreenSharing, startScreenSharing, stopScreenSharing]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  return {
    isScreenSharing,
    hasSharingPermission,
    startScreenSharing,
    stopScreenSharing,
    toggleScreenSharing
  };
}
