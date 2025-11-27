
import { useCallback } from "react";
import { VideoSessionState } from "@/types/video-session";

export function useMediaControls(
  localStream: MediaStream | null,
  videoState: VideoSessionState,
  getLocalStream: (overrides?: any) => Promise<MediaStream | null>,
  setLocalStream: (stream: MediaStream | null) => void,
  localVideoRef: React.RefObject<HTMLVideoElement>,
  peerConnection: RTCPeerConnection | null,
  setVideoState: React.Dispatch<React.SetStateAction<VideoSessionState>>
) {
  // Toggle video
  const toggleVideo = useCallback(async () => {
    setVideoState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
    
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      
      if (videoTracks.length > 0) {
        const isCurrentlyEnabled = videoTracks[0].enabled;
        videoTracks.forEach(track => {
          track.enabled = !isCurrentlyEnabled;
        });
        
        return !isCurrentlyEnabled;
      } else if (!videoState.isVideoEnabled) {
        // Try to add video if it was disabled
        const newStream = await getLocalStream({ video: true });
        return newStream !== null;
      }
    }
    
    return !videoState.isVideoEnabled;
  }, [localStream, videoState.isVideoEnabled, getLocalStream, setVideoState]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setVideoState(prev => ({ ...prev, isAudioEnabled: !prev.isAudioEnabled }));
    
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      
      if (audioTracks.length > 0) {
        const isCurrentlyEnabled = audioTracks[0].enabled;
        audioTracks.forEach(track => {
          track.enabled = !isCurrentlyEnabled;
        });
        
        return !isCurrentlyEnabled;
      }
    }
    
    return !videoState.isAudioEnabled;
  }, [localStream, videoState.isAudioEnabled, setVideoState]);

  // Toggle screen sharing
  const toggleScreenSharing = useCallback(async () => {
    if (videoState.isScreenSharing) {
      // Stop screen sharing
      if (localStream) {
        localStream.getTracks().forEach(track => {
          if (track.kind === 'video') {
            track.stop();
          }
        });
        
        // Get back to camera
        const newStream = await getLocalStream();
        setVideoState(prev => ({ ...prev, isScreenSharing: false }));
        return false;
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        
        if (localStream) {
          // Replace video track with screen sharing track
          const videoTrack = screenStream.getVideoTracks()[0];
          
          const sender = peerConnection?.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          
          if (sender) {
            await sender.replaceTrack(videoTrack);
          }
          
          // Replace local video with screen
          const oldVideoTracks = localStream.getVideoTracks();
          oldVideoTracks.forEach(track => {
            track.stop();
            localStream.removeTrack(track);
          });
          
          localStream.addTrack(videoTrack);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
          }
          
          // Handle when user stops sharing screen
          videoTrack.onended = async () => {
            await toggleScreenSharing();
          };
          
          setVideoState(prev => ({ ...prev, isScreenSharing: true }));
          return true;
        }
      } catch (err) {
        console.error("Error starting screen share:", err);
        return false;
      }
    }
    
    return videoState.isScreenSharing;
  }, [videoState.isScreenSharing, localStream, getLocalStream, peerConnection, localVideoRef, setVideoState]);

  // Toggle recording
  const toggleRecording = useCallback(async () => {
    setVideoState(prev => ({
      ...prev,
      isRecording: !prev.isRecording,
    }));
    
    // In a real implementation, this would start/stop recording
    return !videoState.isRecording;
  }, [videoState.isRecording, setVideoState]);

  return { toggleVideo, toggleAudio, toggleScreenSharing, toggleRecording };
}
