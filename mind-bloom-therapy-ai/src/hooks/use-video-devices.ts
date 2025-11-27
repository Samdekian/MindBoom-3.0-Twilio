
import { useState, useEffect, useCallback } from "react";

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'videoinput' | 'audioinput' | 'audiooutput';
  groupId: string;
  toJSON?: () => any;
}

export interface VideoDevices {
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  devices: MediaDeviceInfo[];
  getDevices: () => Promise<MediaDeviceInfo[]>;
  hasCameras: boolean;
  hasMicrophones: boolean;
  hasSpeakers: boolean;
  loading: boolean;
  error: Error | null;
}

export function useVideoDevices(): VideoDevices {
  const [devices, setDevices] = useState<VideoDevices>({
    cameras: [],
    microphones: [],
    speakers: [],
    videoInputs: [],
    audioInputs: [],
    audioOutputs: [],
    devices: [],
    getDevices: async () => [],
    hasCameras: false,
    hasMicrophones: false,
    hasSpeakers: false,
    loading: true,
    error: null
  });

  const getDevices = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      
      // Map native MediaDeviceInfo to our interface, ensuring groupId is always present
      const mappedDevices: MediaDeviceInfo[] = mediaDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label,
        kind: device.kind as 'videoinput' | 'audioinput' | 'audiooutput',
        groupId: device.groupId || '', // Ensure groupId is always a string
        toJSON: device.toJSON
      }));
      
      const cameras = mappedDevices.filter(device => device.kind === 'videoinput');
      const microphones = mappedDevices.filter(device => device.kind === 'audioinput');
      const speakers = mappedDevices.filter(device => device.kind === 'audiooutput');
      
      setDevices({
        cameras,
        microphones,
        speakers,
        videoInputs: cameras,
        audioInputs: microphones,
        audioOutputs: speakers,
        devices: mappedDevices,
        getDevices,
        hasCameras: cameras.length > 0,
        hasMicrophones: microphones.length > 0,
        hasSpeakers: speakers.length > 0,
        loading: false,
        error: null
      });
      
      return mappedDevices;
    } catch (error) {
      setDevices(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error : new Error('Unknown error accessing media devices')
      }));
      return [];
    }
  }, []);

  useEffect(() => {
    getDevices();
    
    // Listen for device changes
    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
    };
  }, [getDevices]);

  return devices;
}
