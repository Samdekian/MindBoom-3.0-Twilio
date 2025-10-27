
import { useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface StreamExchangeProps {
  peerConnection: RTCPeerConnection | null;
  onRemoteStream?: (stream: MediaStream) => void;
  localVideoRef?: React.RefObject<HTMLVideoElement>;
  remoteVideoRef?: React.RefObject<HTMLVideoElement>;
}

/**
 * Hook for managing WebRTC stream exchange
 * Handles adding local streams, receiving remote streams, and track replacement
 */
export function useStreamExchange({
  peerConnection,
  onRemoteStream,
  localVideoRef,
  remoteVideoRef
}: StreamExchangeProps) {
  const { toast } = useToast();
  const currentLocalStreamRef = useRef<MediaStream | null>(null);
  const isScreenSharingRef = useRef(false);
  const originalStreamRef = useRef<MediaStream | null>(null);

  // Add local stream to peer connection
  const addLocalStream = useCallback(async (stream: MediaStream): Promise<boolean> => {
    if (!peerConnection) {
      console.warn("Cannot add stream: no peer connection");
      return false;
    }

    try {
      // Remove existing tracks
      const senders = peerConnection.getSenders();
      for (const sender of senders) {
        if (sender.track) {
          peerConnection.removeTrack(sender);
        }
      }

      // Add new tracks
      stream.getTracks().forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection`);
        peerConnection.addTrack(track, stream);
      });

      currentLocalStreamRef.current = stream;
      
      // Display in local video element
      if (localVideoRef?.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log("Local stream added successfully");
      return true;
    } catch (error) {
      console.error("Error adding local stream:", error);
      toast({
        title: "Stream Error",
        description: "Failed to add local stream to connection",
        variant: "destructive"
      });
      return false;
    }
  }, [peerConnection, localVideoRef, toast]);

  // Replace a specific track (for device switching)
  const replaceTrack = useCallback(async (
    newTrack: MediaStreamTrack,
    kind: 'audio' | 'video'
  ): Promise<boolean> => {
    if (!peerConnection) {
      console.warn("Cannot replace track: no peer connection");
      return false;
    }

    try {
      const senders = peerConnection.getSenders();
      const sender = senders.find(s => s.track?.kind === kind);

      if (sender) {
        await sender.replaceTrack(newTrack);
        console.log(`${kind} track replaced successfully`);
        
        // Update local stream reference
        if (currentLocalStreamRef.current) {
          const oldTrack = currentLocalStreamRef.current.getTracks().find(t => t.kind === kind);
          if (oldTrack) {
            currentLocalStreamRef.current.removeTrack(oldTrack);
            oldTrack.stop();
          }
          currentLocalStreamRef.current.addTrack(newTrack);
        }
        
        return true;
      } else {
        console.warn(`No sender found for ${kind} track`);
        return false;
      }
    } catch (error) {
      console.error(`Error replacing ${kind} track:`, error);
      toast({
        title: "Device Switch Error",
        description: `Failed to switch ${kind} device`,
        variant: "destructive"
      });
      return false;
    }
  }, [peerConnection, toast]);

  // Start screen sharing
  const startScreenSharing = useCallback(async (): Promise<boolean> => {
    if (!peerConnection || isScreenSharingRef.current) {
      return false;
    }

    try {
      // Store original stream for restoration
      if (currentLocalStreamRef.current && !originalStreamRef.current) {
        originalStreamRef.current = currentLocalStreamRef.current.clone();
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      // Replace video track with screen share
      const screenVideoTrack = screenStream.getVideoTracks()[0];
      const success = await replaceTrack(screenVideoTrack, 'video');

      if (success) {
        isScreenSharingRef.current = true;
        
        // Handle screen share ending
        screenVideoTrack.onended = () => {
          stopScreenSharing();
        };

        // Update local video display
        if (localVideoRef?.current) {
          const newStream = new MediaStream();
          newStream.addTrack(screenVideoTrack);
          
          // Add audio track if available
          const audioTrack = currentLocalStreamRef.current?.getAudioTracks()[0];
          if (audioTrack) {
            newStream.addTrack(audioTrack);
          }
          
          localVideoRef.current.srcObject = newStream;
        }

        toast({
          title: "Screen Sharing Started",
          description: "You are now sharing your screen"
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Error starting screen share:", error);
      toast({
        title: "Screen Share Error",
        description: "Failed to start screen sharing",
        variant: "destructive"
      });
      return false;
    }
  }, [peerConnection, replaceTrack, localVideoRef, toast]);

  // Stop screen sharing
  const stopScreenSharing = useCallback(async (): Promise<boolean> => {
    if (!isScreenSharingRef.current || !originalStreamRef.current) {
      return false;
    }

    try {
      // Restore original video track
      const originalVideoTrack = originalStreamRef.current.getVideoTracks()[0];
      if (originalVideoTrack) {
        const success = await replaceTrack(originalVideoTrack, 'video');
        
        if (success) {
          isScreenSharingRef.current = false;
          
          // Restore local video display
          if (localVideoRef?.current) {
            localVideoRef.current.srcObject = originalStreamRef.current;
          }

          toast({
            title: "Screen Sharing Stopped",
            description: "You have stopped sharing your screen"
          });

          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error stopping screen share:", error);
      toast({
        title: "Screen Share Error", 
        description: "Failed to stop screen sharing",
        variant: "destructive"
      });
      return false;
    }
  }, [replaceTrack, localVideoRef, toast]);

  // Handle remote stream reception
  useEffect(() => {
    if (!peerConnection) return;

    const handleTrack = (event: RTCTrackEvent) => {
      console.log("Received remote track:", event.track.kind);
      const [remoteStream] = event.streams;
      
      if (remoteStream) {
        console.log("Remote stream received");
        
        // Display in remote video element
        if (remoteVideoRef?.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
        
        // Call external handler
        if (onRemoteStream) {
          onRemoteStream(remoteStream);
        }
      }
    };

    peerConnection.addEventListener('track', handleTrack);

    return () => {
      peerConnection.removeEventListener('track', handleTrack);
    };
  }, [peerConnection, onRemoteStream, remoteVideoRef]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (currentLocalStreamRef.current) {
        currentLocalStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (originalStreamRef.current) {
        originalStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    addLocalStream,
    replaceTrack,
    startScreenSharing,
    stopScreenSharing,
    isScreenSharing: isScreenSharingRef.current,
    currentStream: currentLocalStreamRef.current
  };
}
