
import { useCallback } from "react";
import type { VideoDevices } from "@/types/video-session";

// Handles changing active device and optional test callback.
export const useDeviceSelection = (
  getLocalStream: (overrides?: any) => Promise<MediaStream>,
  localVideoRef: React.RefObject<HTMLVideoElement>,
  remoteVideoRef: React.RefObject<HTMLVideoElement>,
  setVideoState: React.Dispatch<React.SetStateAction<any>>
) => {
  // Change device (camera, microphone, speaker)
  const changeDevice = useCallback(
    async (
      type: "camera" | "microphone" | "speaker",
      deviceId: string
    ) => {
      setVideoState((prev: any) => ({
        ...prev,
        ...(type === "camera" && { selectedCamera: deviceId }),
        ...(type === "microphone" && { selectedMicrophone: deviceId }),
        ...(type === "speaker" && { selectedSpeaker: deviceId }),
      }));
      if (type !== "speaker") {
        await getLocalStream({ [type === "camera" ? "selectedCamera" : "selectedMicrophone"]: deviceId });
      } else if (remoteVideoRef.current && 'setSinkId' in remoteVideoRef.current) {
        // @ts-ignore setSinkId for speakers
        remoteVideoRef.current.setSinkId(deviceId);
      }
    },
    [getLocalStream, remoteVideoRef, setVideoState]
  );

  return { changeDevice };
};
