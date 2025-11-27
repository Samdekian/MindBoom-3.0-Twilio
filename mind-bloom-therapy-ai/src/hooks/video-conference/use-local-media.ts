
import { useState, useRef, useCallback } from "react";
import { useToast } from "../use-toast";
import { VideoSessionState } from "@/types/video-session";

export function useLocalMedia(videoState: VideoSessionState) {
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Get local media stream with improved error handling
  const getLocalStream = useCallback(async (overrides?: { video?: boolean; audio?: boolean }) => {
    try {
      console.log('🎥 Requesting media access...');
      
      // Stop existing stream first
      if (localStream) {
        console.log('🛑 Stopping existing stream');
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
      
      const constraints = {
        video: overrides?.video !== undefined ? overrides.video : videoState.isVideoEnabled,
        audio: overrides?.audio !== undefined ? overrides.audio : videoState.isAudioEnabled,
      };
      
      console.log('📋 Media constraints:', constraints);
      
      if (!constraints.video && !constraints.audio) {
        console.log("Both video and audio are disabled");
        return null;
      }

      // Build media constraints with better defaults
      const mediaConstraints: MediaStreamConstraints = {};
      
      if (constraints.video) {
        mediaConstraints.video = {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          ...(videoState.selectedCamera && { deviceId: { exact: videoState.selectedCamera } })
        };
      } else {
        mediaConstraints.video = false;
      }
      
      if (constraints.audio) {
        mediaConstraints.audio = {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(videoState.selectedMicrophone && { deviceId: { exact: videoState.selectedMicrophone } })
        };
      } else {
        mediaConstraints.audio = false;
      }

      console.log('🎯 Final media constraints:', mediaConstraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      console.log('✅ Got media stream with tracks:', stream.getTracks().map(t => t.kind));
      
      setLocalStream(stream);
      
      // Set up video element
      if (localVideoRef.current && stream.getVideoTracks().length > 0) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Prevent audio feedback
        console.log('📺 Connected stream to video element');
      }
      
      return stream;
    } catch (err) {
      console.error("❌ Error getting local stream:", err);
      
      let errorMessage = "Unable to access camera or microphone";
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage = "Camera/microphone access was denied. Please allow access and try again.";
            break;
          case 'NotFoundError':
            errorMessage = "No camera or microphone found. Please check your devices.";
            break;
          case 'NotReadableError':
            errorMessage = "Camera or microphone is already in use by another application.";
            break;
          case 'OverconstrainedError':
            errorMessage = "Camera or microphone doesn't meet the requirements.";
            break;
        }
      }
      
      toast({
        title: "Media Access Error",
        description: errorMessage,
        variant: "destructive"
      });
      return null;
    }
  }, [videoState.isVideoEnabled, videoState.isAudioEnabled, videoState.selectedCamera, videoState.selectedMicrophone, localStream, toast]);

  return { localStream, setLocalStream, localVideoRef, getLocalStream };
}
