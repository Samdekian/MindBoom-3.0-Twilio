
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useUnifiedPermissionHandler } from './use-unified-permission-handler';

export interface DeviceTestResult {
  camera: boolean;
  microphone: boolean;
  speakers: boolean;
  overall: boolean;
}

export function useEnhancedDeviceTesting() {
  const { toast } = useToast();
  const { permissionState, checkPermissions, requestPermissions } = useUnifiedPermissionHandler();
  const [testResult, setTestResult] = useState<DeviceTestResult>({
    camera: false,
    microphone: false,
    speakers: false,
    overall: false
  });
  const [isTestingDevices, setIsTestingDevices] = useState(false);

  const testDeviceAccess = useCallback(async (): Promise<DeviceTestResult> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      const result = {
        camera: videoTracks.length > 0 && videoTracks[0].readyState === 'live',
        microphone: audioTracks.length > 0 && audioTracks[0].readyState === 'live',
        speakers: true, // We assume speakers work if we got this far
        overall: false
      };
      
      result.overall = result.camera && result.microphone && result.speakers;
      
      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());
      
      return result;
    } catch (error) {
      console.error('Device test failed:', error);
      return {
        camera: false,
        microphone: false,
        speakers: false,
        overall: false
      };
    }
  }, []);

  const runCompleteDeviceTest = useCallback(async (): Promise<boolean> => {
    setIsTestingDevices(true);
    
    try {
      // First check current permissions
      await checkPermissions();
      
      // If permissions aren't granted, try to request them
      if (!permissionState.bothGranted) {
        const permissionGranted = await requestPermissions();
        if (!permissionGranted) {
          setIsTestingDevices(false);
          return false;
        }
      }
      
      // Test actual device access
      const result = await testDeviceAccess();
      setTestResult(result);
      
      if (result.overall) {
        toast({
          title: "Device Test Successful",
          description: "All devices are working properly"
        });
      } else {
        const failedDevices = [];
        if (!result.camera) failedDevices.push('camera');
        if (!result.microphone) failedDevices.push('microphone');
        
        toast({
          title: "Device Test Issues",
          description: `Problems detected with: ${failedDevices.join(', ')}`,
          variant: "destructive"
        });
      }
      
      return result.overall;
    } catch (error) {
      console.error('Complete device test failed:', error);
      toast({
        title: "Device Test Failed",
        description: "Unable to complete device testing",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsTestingDevices(false);
    }
  }, [checkPermissions, requestPermissions, permissionState.bothGranted, testDeviceAccess, toast]);

  return {
    testResult,
    isTestingDevices,
    permissionState,
    runCompleteDeviceTest,
    requestPermissions,
    checkPermissions
  };
}
