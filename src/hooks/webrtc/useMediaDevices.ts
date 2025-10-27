
import { useState, useEffect, useCallback } from "react";
import { MediaDeviceInfo } from "@/types/video-session";

interface UseMediaDevicesReturn {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  isLoading: boolean;
  error: string;
  enumerateDevices: () => Promise<void>;
}

export function useMediaDevices(hasPermissions?: boolean): UseMediaDevicesReturn {
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const enumerateDevices = useCallback(async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          // Show label only if we have permissions, otherwise generic name
          label: device.label || (hasPermissions ? `Camera ${device.deviceId.slice(0, 5)}` : `Camera`),
          kind: device.kind as 'videoinput',
          groupId: device.groupId
        }));
      
      const audioInputs = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || (hasPermissions ? `Microphone ${device.deviceId.slice(0, 5)}` : `Microphone`),
          kind: device.kind as 'audioinput',
          groupId: device.groupId
        }));
      
      const audioOutputs = devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || (hasPermissions ? `Speaker ${device.deviceId.slice(0, 5)}` : `Speaker`),
          kind: device.kind as 'audiooutput',
          groupId: device.groupId
        }));
      
      setCameras(videoDevices);
      setMicrophones(audioInputs);
      setSpeakers(audioOutputs);
      
      console.log('📱 [useMediaDevices] Devices enumerated:', {
        cameras: videoDevices.length,
        microphones: audioInputs.length,
        speakers: audioOutputs.length,
        hasPermissions
      });
      
    } catch (err) {
      console.error("❌ [useMediaDevices] Error enumerating devices:", err);
      setError("Failed to enumerate media devices");
    } finally {
      setIsLoading(false);
    }
  }, [hasPermissions]);

  // Always enumerate devices, even without permissions (to show device count)
  useEffect(() => {
    enumerateDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      enumerateDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [enumerateDevices]);

  return {
    cameras,
    microphones,
    speakers,
    isLoading,
    error,
    enumerateDevices
  };
}
