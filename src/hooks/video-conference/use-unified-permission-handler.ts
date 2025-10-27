import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface PermissionState {
  camera: 'granted' | 'denied' | 'prompt' | 'unknown';
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
  bothGranted: boolean;
  realCameraAccess: boolean;
  realMicrophoneAccess: boolean;
  isChecking: boolean;
  hasRequestedBefore: boolean;
  browserType: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
}

export interface PermissionRecoveryFlow {
  showInstructions: boolean;
  instructionStep: number;
  maxSteps: number;
}

export function useUnifiedPermissionHandler() {
  const { toast } = useToast();
  
  const [permissionState, setPermissionState] = useState<PermissionState>({
    camera: 'unknown',
    microphone: 'unknown',
    bothGranted: false,
    realCameraAccess: false,
    realMicrophoneAccess: false,
    isChecking: false,
    hasRequestedBefore: false,
    browserType: 'unknown'
  });

  const [recoveryFlow, setRecoveryFlow] = useState<PermissionRecoveryFlow>({
    showInstructions: false,
    instructionStep: 0,
    maxSteps: 3
  });

  // Detect browser type for specific instructions
  const detectBrowser = useCallback((): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    return 'unknown';
  }, []);

  // Initialize browser detection
  useEffect(() => {
    setPermissionState(prev => ({
      ...prev,
      browserType: detectBrowser()
    }));
  }, [detectBrowser]);

  const checkPermissions = useCallback(async (forceCheck = false) => {
    console.log('🔄 [UnifiedPermissionHandler] Starting permission check...', { forceCheck });
    setPermissionState(prev => ({ ...prev, isChecking: true }));
    
    try {
      let cameraStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'prompt';
      let microphoneStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'prompt';
      let realCameraAccess = false;
      let realMicrophoneAccess = false;
      
      // Check navigator.permissions first for a non-intrusive check
      if (navigator.permissions && !forceCheck) {
        try {
          const [cameraResult, microphoneResult] = await Promise.all([
            navigator.permissions.query({ name: 'camera' as PermissionName }),
            navigator.permissions.query({ name: 'microphone' as PermissionName })
          ]);
          
          cameraStatus = cameraResult.state;
          microphoneStatus = microphoneResult.state;
          
          console.log('📊 [UnifiedPermissionHandler] Permission API results:', {
            camera: cameraStatus,
            microphone: microphoneStatus
          });
          
          // If already granted, test actual access
          if (cameraStatus === 'granted' && microphoneStatus === 'granted') {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
              });
              
              realCameraAccess = true;
              realMicrophoneAccess = true;
              
              // Stop tracks immediately
              stream.getTracks().forEach(track => track.stop());
              
              console.log('✅ [UnifiedPermissionHandler] Confirmed device access');
            } catch (accessError: any) {
              console.log('⚠️ [UnifiedPermissionHandler] Permission granted but access failed:', accessError.name);
              // Keep permission status as granted but mark real access as false
              realCameraAccess = false;
              realMicrophoneAccess = false;
            }
          }
        } catch (permError) {
          console.log('📊 [UnifiedPermissionHandler] Permission API not available, using default "prompt" state');
          // Keep default "prompt" state
        }
      } else if (forceCheck) {
        // Only use getUserMedia when explicitly requested (user action)
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
          });
          
          cameraStatus = 'granted';
          microphoneStatus = 'granted';
          realCameraAccess = true;
          realMicrophoneAccess = true;
          
          // Stop tracks immediately
          stream.getTracks().forEach(track => track.stop());
          
          console.log('✅ [UnifiedPermissionHandler] getUserMedia test successful');
        } catch (deviceError: any) {
          console.log('🔍 [UnifiedPermissionHandler] getUserMedia failed:', deviceError.name, deviceError.message);
          
          if (deviceError.name === 'NotAllowedError') {
            cameraStatus = 'denied';
            microphoneStatus = 'denied';
          } else if (deviceError.name === 'NotFoundError') {
            cameraStatus = 'denied';
            microphoneStatus = 'denied';
          } else {
            cameraStatus = 'prompt';
            microphoneStatus = 'prompt';
          }
        }
      }

      const bothGranted = cameraStatus === 'granted' && microphoneStatus === 'granted';

      setPermissionState(prev => ({
        ...prev,
        camera: cameraStatus,
        microphone: microphoneStatus,
        bothGranted,
        realCameraAccess,
        realMicrophoneAccess,
        isChecking: false
      }));

      console.log('🔍 [UnifiedPermissionHandler] Final permission state:', {
        camera: cameraStatus,
        microphone: microphoneStatus,
        bothGranted,
        realCameraAccess,
        realMicrophoneAccess,
        forceCheck
      });

      // If permissions are denied and user hasn't seen instructions, show them
      if ((cameraStatus === 'denied' || microphoneStatus === 'denied') && 
          permissionState.hasRequestedBefore && 
          !recoveryFlow.showInstructions) {
        setRecoveryFlow(flow => ({ ...flow, showInstructions: true }));
      }

    } catch (error) {
      console.error('❌ [UnifiedPermissionHandler] Permission check completely failed:', error);
      setPermissionState(prev => ({ 
        ...prev, 
        isChecking: false,
        camera: 'unknown',
        microphone: 'unknown',
        bothGranted: false,
        realCameraAccess: false,
        realMicrophoneAccess: false
      }));
    }
  }, [permissionState.hasRequestedBefore, recoveryFlow.showInstructions]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setPermissionState(prev => ({ ...prev, hasRequestedBefore: true, isChecking: true }));
      
      console.log('🔒 [UnifiedPermissionHandler] Requesting permissions with device detection...');
      
      // First, enumerate devices to see what's available
      let devices: MediaDeviceInfo[] = [];
      try {
        devices = await navigator.mediaDevices.enumerateDevices();
      } catch (enumError) {
        console.log('⚠️ [UnifiedPermissionHandler] Device enumeration failed, proceeding with basic request');
      }
      
      const cameras = devices.filter(d => d.kind === 'videoinput');
      const microphones = devices.filter(d => d.kind === 'audioinput');
      
      console.log('📊 [UnifiedPermissionHandler] Available devices:', {
        cameras: cameras.length,
        microphones: microphones.length
      });

      // Try different permission combinations based on available devices
      let stream: MediaStream | null = null;
      let cameraStatus: 'granted' | 'denied' | 'prompt' = 'prompt';
      let microphoneStatus: 'granted' | 'denied' | 'prompt' = 'prompt';
      let realCameraAccess = false;
      let realMicrophoneAccess = false;

      // Strategy 1: Try both if both devices are available
      if (cameras.length > 0 && microphones.length > 0) {
        try {
          console.log('🎯 [UnifiedPermissionHandler] Attempting both camera and microphone...');
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          cameraStatus = 'granted';
          microphoneStatus = 'granted';
          realCameraAccess = true;
          realMicrophoneAccess = true;
          
          // Stop tracks immediately after getting permission
          stream.getTracks().forEach(track => track.stop());
          
          console.log('✅ [UnifiedPermissionHandler] Both permissions granted successfully');
        } catch (bothError: any) {
          console.log('⚠️ [UnifiedPermissionHandler] Both permissions failed, trying individually:', bothError.name);
          
          // If NotFoundError, one device might be missing, try individually
          if (bothError.name === 'NotFoundError') {
            // Try camera only
            try {
              console.log('🎯 [UnifiedPermissionHandler] Trying camera only...');
              const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
              cameraStream.getTracks().forEach(track => track.stop());
              cameraStatus = 'granted';
              realCameraAccess = true;
              console.log('✅ [UnifiedPermissionHandler] Camera permission granted');
            } catch (cameraError: any) {
              console.log('❌ [UnifiedPermissionHandler] Camera failed:', cameraError.name);
              cameraStatus = cameraError.name === 'NotAllowedError' ? 'denied' : 'prompt';
            }

            // Try microphone only
            try {
              console.log('🎯 [UnifiedPermissionHandler] Trying microphone only...');
              const micStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
              micStream.getTracks().forEach(track => track.stop());
              microphoneStatus = 'granted';
              realMicrophoneAccess = true;
              console.log('✅ [UnifiedPermissionHandler] Microphone permission granted');
            } catch (micError: any) {
              console.log('❌ [UnifiedPermissionHandler] Microphone failed:', micError.name);
              microphoneStatus = micError.name === 'NotAllowedError' ? 'denied' : 'prompt';
            }
          } else if (bothError.name === 'NotAllowedError') {
            cameraStatus = 'denied';
            microphoneStatus = 'denied';
          }
        }
      } else {
        // Try devices individually based on availability
        if (cameras.length > 0) {
          try {
            console.log('🎯 [UnifiedPermissionHandler] Trying camera only (no microphones detected)...');
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            stream.getTracks().forEach(track => track.stop());
            cameraStatus = 'granted';
            realCameraAccess = true;
            console.log('✅ [UnifiedPermissionHandler] Camera permission granted');
          } catch (cameraError: any) {
            console.log('❌ [UnifiedPermissionHandler] Camera failed:', cameraError.name);
            cameraStatus = cameraError.name === 'NotAllowedError' ? 'denied' : 'prompt';
          }
        } else {
          console.log('⚠️ [UnifiedPermissionHandler] No cameras detected');
          cameraStatus = 'denied';
        }

        if (microphones.length > 0) {
          try {
            console.log('🎯 [UnifiedPermissionHandler] Trying microphone only (no cameras detected)...');
            stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
            stream.getTracks().forEach(track => track.stop());
            microphoneStatus = 'granted';
            realMicrophoneAccess = true;
            console.log('✅ [UnifiedPermissionHandler] Microphone permission granted');
          } catch (micError: any) {
            console.log('❌ [UnifiedPermissionHandler] Microphone failed:', micError.name);
            microphoneStatus = micError.name === 'NotAllowedError' ? 'denied' : 'prompt';
          }
        } else {
          console.log('⚠️ [UnifiedPermissionHandler] No microphones detected');
          microphoneStatus = 'denied';
        }
      }

      const bothGranted = cameraStatus === 'granted' && microphoneStatus === 'granted';
      const anyGranted = cameraStatus === 'granted' || microphoneStatus === 'granted';

      // Update permission state
      setPermissionState(prev => ({
        ...prev,
        camera: cameraStatus,
        microphone: microphoneStatus,
        bothGranted,
        realCameraAccess,
        realMicrophoneAccess,
        isChecking: false
      }));
      
      // Show appropriate success message
      if (bothGranted) {
        toast({
          title: "Permissions Granted",
          description: "Camera and microphone access enabled successfully"
        });
      } else if (anyGranted) {
        const grantedDevices = [];
        if (cameraStatus === 'granted') grantedDevices.push('camera');
        if (microphoneStatus === 'granted') grantedDevices.push('microphone');
        
        toast({
          title: "Partial Permissions Granted", 
          description: `${grantedDevices.join(' and ')} access enabled. You can continue with limited functionality.`
        });
      }
      
      // Hide recovery instructions if they were showing
      setRecoveryFlow(prev => ({ ...prev, showInstructions: false, instructionStep: 0 }));
      
      return anyGranted; // Return true if at least one permission was granted
      
    } catch (error: any) {
      console.error('❌ [UnifiedPermissionHandler] Permission request completely failed:', error);
      
      // Update state to reflect the complete failure
      setPermissionState(prev => ({
        ...prev,
        camera: 'denied',
        microphone: 'denied',
        bothGranted: false,
        realCameraAccess: false,
        realMicrophoneAccess: false,
        isChecking: false
      }));
      
      // Show recovery flow after failed request
      setRecoveryFlow(prev => ({ ...prev, showInstructions: true, instructionStep: 1 }));
      
      let errorMessage = 'Device access failed';
      let instructions = getBrowserSpecificInstructions(permissionState.browserType);

      switch (error.name) {
        case 'NotAllowedError':
          errorMessage = 'Camera and microphone access was denied';
          break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          errorMessage = 'No camera or microphone found';
          instructions = 'Please ensure your devices are connected and try again';
          break;
        case 'NotReadableError':
          errorMessage = 'Camera or microphone is already in use';
          instructions = 'Please close other applications using your camera/microphone';
          break;
        case 'OverconstrainedError':
          errorMessage = 'Device constraints not supported';
          instructions = 'Your device may not support the required video/audio settings';
          break;
        default:
          errorMessage = 'Device access failed';
          instructions = 'Please check your browser settings and device connections';
      }

      toast({
        title: errorMessage,
        description: instructions,
        variant: "destructive"
      });

      return false;
    }
  }, [permissionState.browserType, toast]);

  const getBrowserSpecificInstructions = (browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'): string => {
    switch (browser) {
      case 'chrome':
        return 'Click the camera icon in the address bar, then select "Always allow" for this site';
      case 'firefox':
        return 'Click the shield icon in the address bar, then click "Allow" for camera and microphone';
      case 'safari':
        return 'Go to Safari > Settings > Websites > Camera/Microphone and allow access for this site';
      case 'edge':
        return 'Click the camera icon in the address bar, then select "Allow" for this site';
      default:
        return 'Please check your browser settings to enable camera and microphone access';
    }
  };

  const resetRecoveryFlow = useCallback(() => {
    setRecoveryFlow({
      showInstructions: false,
      instructionStep: 0,
      maxSteps: 3
    });
  }, []);

  const nextRecoveryStep = useCallback(() => {
    setRecoveryFlow(prev => ({
      ...prev,
      instructionStep: Math.min(prev.instructionStep + 1, prev.maxSteps)
    }));
  }, []);

  const retryPermissions = useCallback(async () => {
    resetRecoveryFlow();
    return await requestPermissions();
  }, [requestPermissions, resetRecoveryFlow]);

  // Initialize permission checking on hook mount (soft check only)
  useEffect(() => {
    console.log('🚀 [UnifiedPermissionHandler] Initializing - running soft permission check');
    checkPermissions(false); // Soft check on mount
  }, []);

  return {
    permissionState,
    recoveryFlow,
    checkPermissions,
    requestPermissions,
    retryPermissions,
    resetRecoveryFlow,
    nextRecoveryStep,
    getBrowserSpecificInstructions
  };
}