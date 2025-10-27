import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface DeviceAvailability {
  hasCameras: boolean;
  hasMicrophones: boolean;
  hasSpeakers: boolean;
  cameraCount: number;
  microphoneCount: number;
  speakerCount: number;
  loading: boolean;
  error: string | null;
}

export interface DeviceCapabilities {
  video: boolean;
  audio: boolean;
  canDoVideoOnly: boolean;
  canDoAudioOnly: boolean;
  isMobile: boolean;
  recommendedMode: 'both' | 'video-only' | 'audio-only' | 'none';
}

export interface DevicePermissions {
  camera: 'granted' | 'denied' | 'prompt' | 'unavailable';
  microphone: 'granted' | 'denied' | 'prompt' | 'unavailable';
  canRequestCamera: boolean;
  canRequestMicrophone: boolean;
}

export interface EnhancedDeviceState {
  availability: DeviceAvailability;
  capabilities: DeviceCapabilities;
  permissions: DevicePermissions;
  devices: {
    cameras: MediaDeviceInfo[];
    microphones: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  };
}

export function useEnhancedDeviceManager() {
  const { toast } = useToast();
  
  const [deviceState, setDeviceState] = useState<EnhancedDeviceState>({
    availability: {
      hasCameras: false,
      hasMicrophones: false,
      hasSpeakers: false,
      cameraCount: 0,
      microphoneCount: 0,
      speakerCount: 0,
      loading: true,
      error: null,
    },
    capabilities: {
      video: false,
      audio: false,
      canDoVideoOnly: false,
      canDoAudioOnly: false,
      isMobile: false,
      recommendedMode: 'none',
    },
    permissions: {
      camera: 'prompt',
      microphone: 'prompt',
      canRequestCamera: false,
      canRequestMicrophone: false,
    },
    devices: {
      cameras: [],
      microphones: [],
      speakers: [],
    }
  });

  // Detect if we're on mobile
  const isMobile = useCallback(() => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  // Enumerate devices with comprehensive error handling
  const enumerateDevices = useCallback(async () => {
    try {
      console.log('📱 [EnhancedDeviceManager] Starting device enumeration...');
      
      setDeviceState(prev => ({
        ...prev,
        availability: { ...prev.availability, loading: true, error: null }
      }));

      // Get device list
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const cameras = devices.filter(d => d.kind === 'videoinput');
      const microphones = devices.filter(d => d.kind === 'audioinput');
      const speakers = devices.filter(d => d.kind === 'audiooutput');

      console.log('📊 [EnhancedDeviceManager] Device counts:', {
        cameras: cameras.length,
        microphones: microphones.length,
        speakers: speakers.length
      });

      const availability: DeviceAvailability = {
        hasCameras: cameras.length > 0,
        hasMicrophones: microphones.length > 0,
        hasSpeakers: speakers.length > 0,
        cameraCount: cameras.length,
        microphoneCount: microphones.length,
        speakerCount: speakers.length,
        loading: false,
        error: null,
      };

      // Determine capabilities based on available devices
      const mobile = isMobile();
      const capabilities: DeviceCapabilities = {
        video: availability.hasCameras,
        audio: availability.hasMicrophones,
        canDoVideoOnly: availability.hasCameras,
        canDoAudioOnly: availability.hasMicrophones,
        isMobile: mobile,
        recommendedMode: (() => {
          if (availability.hasCameras && availability.hasMicrophones) return 'both';
          if (availability.hasCameras) return 'video-only';
          if (availability.hasMicrophones) return 'audio-only';
          return 'none';
        })()
      };

      // Check permissions for available devices
      const permissions: DevicePermissions = {
        camera: availability.hasCameras ? 'prompt' : 'unavailable',
        microphone: availability.hasMicrophones ? 'prompt' : 'unavailable',
        canRequestCamera: availability.hasCameras,
        canRequestMicrophone: availability.hasMicrophones,
      };

      // Try to get more detailed permission info if available
      if (navigator.permissions) {
        try {
          if (availability.hasCameras) {
            const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
            permissions.camera = cameraPermission.state as any;
          }
          if (availability.hasMicrophones) {
            const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            permissions.microphone = microphonePermission.state as any;
          }
        } catch (permError) {
          console.log('📊 [EnhancedDeviceManager] Permission API not available');
        }
      }

      setDeviceState({
        availability,
        capabilities,
        permissions,
        devices: {
          cameras,
          microphones,
          speakers,
        }
      });

      console.log('✅ [EnhancedDeviceManager] Device enumeration complete:', {
        availability,
        capabilities,
        permissions: {
          camera: permissions.camera,
          microphone: permissions.microphone,
          canRequestCamera: permissions.canRequestCamera,
          canRequestMicrophone: permissions.canRequestMicrophone,
        }
      });

    } catch (error) {
      console.error('❌ [EnhancedDeviceManager] Device enumeration failed:', error);
      
      setDeviceState(prev => ({
        ...prev,
        availability: {
          ...prev.availability,
          loading: false,
          error: error instanceof Error ? error.message : 'Device enumeration failed',
        }
      }));
    }
  }, [isMobile]);

  // Request permissions with fallback modes and stream verification
  const requestPermissions = useCallback(async (options: {
    requestVideo?: boolean;
    requestAudio?: boolean;
    fallbackToAudioOnly?: boolean;
    fallbackToVideoOnly?: boolean;
  } = {}): Promise<{
    success: boolean;
    stream: MediaStream | null;
    mode: 'both' | 'video-only' | 'audio-only' | 'none';
    error?: string;
    hasVideo: boolean;
    hasAudio: boolean;
  }> => {
    const {
      requestVideo = true,
      requestAudio = true,
      fallbackToAudioOnly = true,
      fallbackToVideoOnly = true,
    } = options;

    console.log('🔒 [EnhancedDeviceManager] Requesting permissions:', {
      requestVideo,
      requestAudio,
      fallbackToAudioOnly,
      fallbackToVideoOnly,
      deviceState: {
        hasCameras: deviceState.availability.hasCameras,
        hasMicrophones: deviceState.availability.hasMicrophones,
      }
    });

    // Don't request permissions for unavailable devices
    const shouldRequestVideo = requestVideo && deviceState.availability.hasCameras;
    const shouldRequestAudio = requestAudio && deviceState.availability.hasMicrophones;

    if (!shouldRequestVideo && !shouldRequestAudio) {
      console.warn('❌ [EnhancedDeviceManager] No devices available for permissions');
      toast({
        title: "No Devices Available", 
        description: "No camera or microphone found on this device",
        variant: "destructive"
      });
      return {
        success: false,
        stream: null,
        mode: 'none',
        error: 'No devices available for requested permissions',
        hasVideo: false,
        hasAudio: false
      };
    }

    // Helper function to verify stream has active tracks
    const verifyStream = (stream: MediaStream, expectedVideo: boolean, expectedAudio: boolean) => {
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();
      
      const hasActiveVideo = videoTracks.length > 0 && videoTracks[0].readyState === 'live';
      const hasActiveAudio = audioTracks.length > 0 && audioTracks[0].readyState === 'live';
      
      console.log('🔍 [EnhancedDeviceManager] Stream verification:', {
        videoTracks: videoTracks.length,
        audioTracks: audioTracks.length,
        hasActiveVideo,
        hasActiveAudio,
        expectedVideo,
        expectedAudio
      });
      
      return {
        hasVideo: hasActiveVideo,
        hasAudio: hasActiveAudio,
        isValid: (!expectedVideo || hasActiveVideo) && (!expectedAudio || hasActiveAudio)
      };
    }

    // Try the ideal case first (both video and audio if requested and available)
    if (shouldRequestVideo && shouldRequestAudio) {
      try {
        console.log('🎯 [EnhancedDeviceManager] Attempting both video and audio...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user'
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });
        
        // Verify stream has active tracks
        const verification = verifyStream(stream, true, true);
        
        if (verification.isValid) {
          // Update permission state
          setDeviceState(prev => ({
            ...prev,
            permissions: {
              ...prev.permissions,
              camera: 'granted',
              microphone: 'granted',
            }
          }));

          console.log('✅ [EnhancedDeviceManager] Both permissions granted with active tracks');
          return {
            success: true,
            stream,
            mode: 'both',
            hasVideo: verification.hasVideo,
            hasAudio: verification.hasAudio
          };
        } else {
          console.warn('⚠️ [EnhancedDeviceManager] Stream created but tracks are not active:', verification);
          // Stop the stream and try fallbacks
          stream.getTracks().forEach(track => track.stop());
        }
      } catch (error: any) {
        console.log('⚠️ [EnhancedDeviceManager] Both permissions failed:', error.name, error.message);
        
        // Try fallbacks based on the error and options
        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          console.log('🔄 [EnhancedDeviceManager] Device not found, trying individual requests...');
          toast({
            title: "Device Detection Issue",
            description: "Some devices may not be available. Trying alternatives...",
          });
        } else if (error.name === 'NotAllowedError') {
          // Permission denied for both
          setDeviceState(prev => ({
            ...prev,
            permissions: {
              ...prev.permissions,
              camera: 'denied',
              microphone: 'denied',
            }
          }));
          toast({
            title: "Permission Denied",
            description: "Camera and microphone access denied. Please check browser settings.",
            variant: "destructive"
          });
          return {
            success: false,
            stream: null,
            mode: 'none',
            error: 'Camera and microphone access denied',
            hasVideo: false,
            hasAudio: false
          };
        }
      }
    }

    // Try video-only fallback
    if (shouldRequestVideo && (fallbackToVideoOnly || !shouldRequestAudio)) {
      try {
        console.log('🎯 [EnhancedDeviceManager] Attempting video-only...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        
        setDeviceState(prev => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            camera: 'granted',
            microphone: shouldRequestAudio ? 'denied' : prev.permissions.microphone,
          }
        }));

        // Verify video stream
        const verification = verifyStream(stream, true, false);
        
        console.log('✅ [EnhancedDeviceManager] Video-only permission granted');
        toast({
          title: "Video Only Mode",
          description: "Camera access granted. Microphone not available.",
        });

        return {
          success: true,
          stream,
          mode: 'video-only',
          hasVideo: verification.hasVideo,
          hasAudio: false
        };
      } catch (videoError: any) {
        console.log('⚠️ [EnhancedDeviceManager] Video-only failed:', videoError.name);
        
        if (videoError.name === 'NotAllowedError') {
          setDeviceState(prev => ({
            ...prev,
            permissions: {
              ...prev.permissions,
              camera: 'denied',
            }
          }));
        }
      }
    }

    // Try audio-only fallback
    if (shouldRequestAudio && (fallbackToAudioOnly || !shouldRequestVideo)) {
      try {
        console.log('🎯 [EnhancedDeviceManager] Attempting audio-only...');
        const stream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });
        
        setDeviceState(prev => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            microphone: 'granted',
            camera: shouldRequestVideo ? 'denied' : prev.permissions.camera,
          }
        }));

        // Verify audio stream
        const verification = verifyStream(stream, false, true);
        
        console.log('✅ [EnhancedDeviceManager] Audio-only permission granted');
        toast({
          title: "Audio Only Mode", 
          description: "Microphone access granted. Camera not available.",
        });

        return {
          success: true,
          stream,
          mode: 'audio-only',
          hasVideo: false,
          hasAudio: verification.hasAudio
        };
      } catch (audioError: any) {
        console.log('⚠️ [EnhancedDeviceManager] Audio-only failed:', audioError.name);
        
        if (audioError.name === 'NotAllowedError') {
          setDeviceState(prev => ({
            ...prev,
            permissions: {
              ...prev.permissions,
              microphone: 'denied',
            }
          }));
        }
      }
    }

    // All attempts failed
    console.error('❌ [EnhancedDeviceManager] All permission attempts failed');
    toast({
      title: "Connection Failed",
      description: "Unable to access camera or microphone. Please check device connections and browser permissions.",
      variant: "destructive"
    });
    return {
      success: false,
      stream: null,
      mode: 'none',
      error: 'Unable to access camera or microphone',
      hasVideo: false,
      hasAudio: false
    };
  }, [deviceState.availability, toast]);

  // Test specific device type
  const testDevice = useCallback(async (type: 'camera' | 'microphone'): Promise<boolean> => {
    try {
      const constraints = {
        video: type === 'camera',
        audio: type === 'microphone'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: `${type === 'camera' ? 'Camera' : 'Microphone'} Test`,
        description: `Your ${type} is working properly`,
      });
      
      return true;
    } catch (error) {
      console.error(`❌ [EnhancedDeviceManager] ${type} test failed:`, error);
      
      toast({
        title: `${type === 'camera' ? 'Camera' : 'Microphone'} Test Failed`,
        description: `Unable to access your ${type}`,
        variant: "destructive"
      });
      
      return false;
    }
  }, [toast]);

  // Initialize device detection
  useEffect(() => {
    enumerateDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      console.log('📱 [EnhancedDeviceManager] Device change detected, re-enumerating...');
      enumerateDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [enumerateDevices]);

  return {
    deviceState,
    enumerateDevices,
    requestPermissions,
    testDevice,
    isMobile: deviceState.capabilities.isMobile,
  };
}