
import { useState, useCallback } from "react";
import { useToast } from "../use-toast";

export const useLocalStreamManagement = (videoState: any) => {
  const { toast } = useToast();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Initialize local media stream
  const getLocalStream = useCallback(async (newState: Partial<any> = {}) => {
    try {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      const videoEnabled = "isVideoEnabled" in newState ? newState.isVideoEnabled : videoState.isVideoEnabled;
      const audioEnabled = "isAudioEnabled" in newState ? newState.isAudioEnabled : videoState.isAudioEnabled;
      const selectedCamera = "selectedCamera" in newState ? newState.selectedCamera : videoState.selectedCamera;
      const selectedMicrophone = "selectedMicrophone" in newState ? newState.selectedMicrophone : videoState.selectedMicrophone;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoEnabled ? { deviceId: selectedCamera ? { exact: selectedCamera } : undefined } : false,
        audio: audioEnabled ? { deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined } : false,
      });

      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error initializing local stream:", error);
      toast({
        title: "Media Error",
        description: "Unable to access camera or microphone",
        variant: "destructive",
      });
      return null;
    }
  }, [localStream, videoState, toast]);

  return { localStream, setLocalStream, getLocalStream };
};
