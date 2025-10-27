
import { useCallback } from "react";

// Handles changing active device
export const useDeviceSelection = (
  getLocalStream: (overrides?: any) => Promise<MediaStream | null>,
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
