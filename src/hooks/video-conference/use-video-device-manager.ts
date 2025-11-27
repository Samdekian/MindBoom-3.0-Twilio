
import { useState, useCallback, useEffect } from 'react';
import { VideoDevices } from '@/hooks/webrtc/types';

export function useVideoDeviceManager() {
  const [devices, setDevices] = useState<VideoDevices>({
    cameras: [],
    microphones: [],
    speakers: []
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Function to fetch all media devices
  const fetchDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Request permissions first
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      } catch (err) {
        console.warn("Could not get full media permissions:", err);
      }
      
      // Get all devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      
      // Group devices by type
      const cameras = allDevices.filter(device => device.kind === 'videoinput');
      const microphones = allDevices.filter(device => device.kind === 'audioinput');
      const speakers = allDevices.filter(device => device.kind === 'audiooutput');
      
      setDevices({
        cameras,
        microphones,
        speakers,
        videoInputs: cameras,
        audioInputs: microphones,
        audioOutputs: speakers,
        defaultDevices: {
          camera: cameras.length > 0 ? cameras[0].deviceId : null,
          microphone: microphones.length > 0 ? microphones[0].deviceId : null,
          speaker: speakers.length > 0 ? speakers[0].deviceId : null
        }
      });
      
      return allDevices;
    } catch (err) {
      const error = err as Error;
      console.error("Error fetching devices:", error);
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Initial device detection
  useEffect(() => {
    fetchDevices();
    
    // Listen for device changes
    const handleDeviceChange = () => {
      fetchDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [fetchDevices]);
  
  return {
    devices,
    isLoading,
    error,
    refreshDevices: fetchDevices
  };
}
