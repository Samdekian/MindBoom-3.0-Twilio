import { useCallback } from "react";
import { useToast } from "../use-toast";

// Controls for toggling video, audio, and screen sharing
export const useMediaControls = (
  localStream: MediaStream | null,
  videoState: any,
  getLocalStream: (overrides?: any) => Promise<MediaStream | null>,
  setLocalStream: (stream: MediaStream | null) => void,
  localVideoRef: React.RefObject<HTMLVideoElement>,
  peerConnection: RTCPeerConnection | null
) => {
  const { toast } = useToast();

  // Toggle video with proper track replacement
  const toggleVideo = useCallback(async () => {
    try {
      const newVideoEnabled = !videoState.isVideoEnabled;
      
      if (localStream) {
        const videoTracks = localStream.getVideoTracks();
        
        if (videoTracks.length > 0) {
          // If we have existing video tracks, just toggle them
          videoTracks.forEach(track => {
            track.enabled = newVideoEnabled;
          });
          
          // Update state
          return true;
        } else if (newVideoEnabled) {
          // If we're turning video on and don't have a track, we need to get a new stream
          await getLocalStream({ isVideoEnabled: true });
          return true;
        }
      } else if (newVideoEnabled) {
        // No stream at all, create one
        await getLocalStream();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error toggling video:", error);
      toast({
        title: "Camera Error",
        description: "Unable to toggle camera",
        variant: "destructive",
      });
      return false;
    }
  }, [localStream, videoState.isVideoEnabled, getLocalStream, toast]);

  // Toggle audio with proper track replacement
  const toggleAudio = useCallback(() => {
    try {
      if (localStream) {
        const audioTracks = localStream.getAudioTracks();
        
        if (audioTracks.length > 0) {
          audioTracks.forEach(track => {
            track.enabled = !videoState.isAudioEnabled;
          });
          return true;
        } else if (!videoState.isAudioEnabled) {
          // Trying to enable audio but no audio track exists
          getLocalStream({ isAudioEnabled: true });
          return true;
        }
      } else if (!videoState.isAudioEnabled) {
        // No stream at all, create one with audio enabled
        getLocalStream({ isAudioEnabled: true });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error toggling audio:", error);
      toast({
        title: "Microphone Error",
        description: "Unable to toggle microphone",
        variant: "destructive",
      });
      return false;
    }
  }, [localStream, videoState.isAudioEnabled, getLocalStream, toast]);

  // Toggle screen sharing with proper track replacement
  const toggleScreenSharing = useCallback(async () => {
    try {
      if (videoState.isScreenSharing) {
        // Switch back to camera
        const cameraStream = await getLocalStream();
        
        // Update peer connection tracks if in a call
        if (peerConnection && cameraStream) {
          const senders = peerConnection.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === 'video'
          );
          
          if (videoSender && cameraStream.getVideoTracks()[0]) {
            await videoSender.replaceTrack(cameraStream.getVideoTracks()[0]);
          }
        }
        
        return true;
      } else {
        // Switch to screen sharing
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: videoState.isAudioEnabled,
          });
          
          if (localStream) {
            // Keep audio from camera/mic if screen capture doesn't include audio
            if (videoState.isAudioEnabled && screenStream.getAudioTracks().length === 0) {
              const audioTracks = localStream.getAudioTracks();
              audioTracks.forEach(track => {
                screenStream.addTrack(track);
              });
            }
            
            // Stop old video tracks
            localStream.getVideoTracks().forEach(track => track.stop());
          }
          
          setLocalStream(screenStream);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = screenStream;
          }
          
          // Update peer connection tracks if in a call
          if (peerConnection) {
            const senders = peerConnection.getSenders();
            const videoSender = senders.find(sender => 
              sender.track && sender.track.kind === 'video'
            );
            
            if (videoSender && screenStream.getVideoTracks()[0]) {
              await videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
            }
          }
          
          // Handle the user ending screen sharing
          screenStream.getVideoTracks()[0].onended = async () => {
            toast({
              title: "Screen Sharing Ended",
              description: "Returning to camera view",
            });
            
            await getLocalStream();
          };
          
          return true;
        } catch (err) {
          // User cancelled screen sharing request
          console.log("Screen sharing rejected:", err);
          return false;
        }
      }
    } catch (error) {
      console.error("Error toggling screen sharing:", error);
      toast({
        title: "Screen Sharing Error",
        description: "Unable to share screen",
        variant: "destructive",
      });
      return false;
    }
  }, [videoState.isScreenSharing, videoState.isAudioEnabled, localStream, getLocalStream, setLocalStream, localVideoRef, peerConnection, toast]);

  return { toggleVideo, toggleAudio, toggleScreenSharing };
};
