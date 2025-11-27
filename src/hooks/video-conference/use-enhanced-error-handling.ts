import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { DeviceError, ErrorScenario } from '@/components/video-conference/preparation/EnhancedErrorMessaging';

export function useEnhancedErrorHandling() {
  const [currentError, setCurrentError] = useState<DeviceError | null>(null);
  const [errorHistory, setErrorHistory] = useState<DeviceError[]>([]);

  const detectBrowserType = (): 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown' => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edge')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    return 'unknown';
  };

  const classifyError = useCallback((error: any, device: 'camera' | 'microphone' | 'speaker' | 'all'): ErrorScenario => {
    if (!error) return 'unknown-error';

    const errorName = error.name?.toLowerCase() || '';
    const errorMessage = error.message?.toLowerCase() || '';

    // Permission-related errors
    if (errorName.includes('notallowed') || errorMessage.includes('permission denied')) {
      return 'permission-denied';
    }

    // Device not found errors
    if (errorName.includes('notfound') || errorMessage.includes('device not found')) {
      return 'device-not-found';
    }

    // Device in use errors
    if (errorName.includes('notreadable') || errorMessage.includes('in use') || errorMessage.includes('busy')) {
      return 'device-in-use';
    }

    // Browser support errors
    if (errorMessage.includes('not supported') || errorMessage.includes('unsupported')) {
      return 'browser-unsupported';
    }

    // Network-related errors
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return 'network-error';
    }

    // System-level blocks
    if (errorMessage.includes('system') || errorMessage.includes('policy')) {
      return 'system-blocked';
    }

    return 'unknown-error';
  }, []);

  const createDeviceError = useCallback((
    error: any, 
    device: 'camera' | 'microphone' | 'speaker' | 'all'
  ): DeviceError => {
    const type = classifyError(error, device);
    const browserType = detectBrowserType();

    const errorMessages = {
      'permission-denied': `${device === 'all' ? 'Camera and microphone' : device} access was denied`,
      'device-not-found': `No ${device} device found`,
      'device-in-use': `${device === 'all' ? 'Devices are' : device + ' is'} currently in use`,
      'browser-unsupported': 'Your browser doesn\'t support this feature',
      'system-blocked': 'System settings are blocking device access',
      'network-error': 'Network connection issue detected',
      'unknown-error': `An unexpected error occurred with your ${device}`
    };

    const errorDetails = {
      'permission-denied': 'Click "Allow" when prompted or check your browser settings',
      'device-not-found': 'Please connect your device and try again',
      'device-in-use': 'Close other applications that might be using this device',
      'browser-unsupported': 'Try updating your browser or using a different one',
      'system-blocked': 'Check your operating system privacy settings',
      'network-error': 'Please check your internet connection',
      'unknown-error': 'Please try again or contact support if the issue persists'
    };

    return {
      type,
      device,
      message: errorMessages[type],
      details: errorDetails[type],
      browserType
    };
  }, [classifyError]);

  const handleError = useCallback((error: any, device: 'camera' | 'microphone' | 'speaker' | 'all') => {
    const deviceError = createDeviceError(error, device);
    
    setCurrentError(deviceError);
    setErrorHistory(prev => [deviceError, ...prev.slice(0, 9)]); // Keep last 10 errors

    // Show toast for critical errors
    if (['permission-denied', 'system-blocked'].includes(deviceError.type)) {
      toast({
        title: deviceError.message,
        description: deviceError.details,
        variant: 'destructive'
      });
    }

    console.error('Device error:', {
      original: error,
      classified: deviceError
    });
  }, [createDeviceError]);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const retryLastAction = useCallback(async (retryFunction: () => Promise<void>) => {
    if (currentError) {
      try {
        await retryFunction();
        clearError();
        toast({
          title: 'Success!',
          description: 'The issue has been resolved',
          variant: 'default'
        });
      } catch (error) {
        handleError(error, currentError.device);
      }
    }
  }, [currentError, clearError, handleError]);

  const openSystemSettings = useCallback(() => {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    const isMac = navigator.platform.toLowerCase().includes('mac');
    
    let settingsUrl = '';
    
    if (isWindows) {
      settingsUrl = 'ms-settings:privacy-webcam'; // Windows settings URL
    } else if (isMac) {
      // macOS doesn't support direct URL opening to System Preferences
      toast({
        title: 'Open System Preferences',
        description: 'Go to System Preferences → Security & Privacy → Privacy → Camera/Microphone',
        variant: 'default'
      });
      return;
    }
    
    if (settingsUrl) {
      window.open(settingsUrl, '_blank');
    } else {
      toast({
        title: 'Manual Setup Required',
        description: 'Please check your system privacy settings for camera and microphone access',
        variant: 'default'
      });
    }
  }, []);

  const getSimilarErrors = useCallback((device: 'camera' | 'microphone' | 'speaker' | 'all') => {
    return errorHistory.filter(error => error.device === device).slice(0, 3);
  }, [errorHistory]);

  return {
    currentError,
    errorHistory,
    handleError,
    clearError,
    retryLastAction,
    openSystemSettings,
    getSimilarErrors
  };
}