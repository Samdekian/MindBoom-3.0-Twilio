
import { useCallback, useState, useEffect } from "react";
import { VideoDevices, MediaDeviceInfo } from "./types";

export function useDeviceManagement() {
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
    error: null,
  });

  useEffect(() => {
    const loadDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        const cameras = deviceList.filter(d => d.kind === 'videoinput');
        const microphones = deviceList.filter(d => d.kind === 'audioinput');
        const speakers = deviceList.filter(d => d.kind === 'audiooutput');

        setDevices({
          cameras,
          microphones,
          speakers,
          videoInputs: cameras,
          audioInputs: microphones,
          audioOutputs: speakers,
          devices: deviceList,
          getDevices: async () => deviceList,
          hasCameras: cameras.length > 0,
          hasMicrophones: microphones.length > 0,
          hasSpeakers: speakers.length > 0,
          loading: false,
          error: null,
        });
      } catch (error) {
        setDevices(prev => ({ ...prev, loading: false, error: error as Error }));
      }
    };

    loadDevices();
  }, []);
  const changeDevice = useCallback(async (type: "camera" | "microphone" | "speaker", deviceId: string) => {
    console.log(`Changing ${type} to ${deviceId}`);
    // Mock implementation - replace with actual device switching logic
  }, []);

  const testDevices = useCallback(async () => {
    console.log('Testing devices');
    // Mock implementation - replace with actual device testing logic
    return true;
  }, []);

  return { 
    devices,
    changeDevice,
    testDevices,
  };
}
