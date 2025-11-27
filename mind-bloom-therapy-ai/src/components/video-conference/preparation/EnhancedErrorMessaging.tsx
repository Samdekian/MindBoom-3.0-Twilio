import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Settings, 
  ExternalLink,
  Camera,
  Mic,
  Monitor
} from 'lucide-react';

export type ErrorScenario = 
  | 'permission-denied'
  | 'device-not-found'
  | 'device-in-use'
  | 'browser-unsupported'
  | 'system-blocked'
  | 'network-error'
  | 'unknown-error';

export interface DeviceError {
  type: ErrorScenario;
  device: 'camera' | 'microphone' | 'speaker' | 'all';
  message: string;
  details?: string;
  browserType: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
}

interface EnhancedErrorMessagingProps {
  error: DeviceError;
  onRetry: () => Promise<void>;
  onOpenSettings: () => void;
  onDismiss: () => void;
}

export const EnhancedErrorMessaging: React.FC<EnhancedErrorMessagingProps> = ({
  error,
  onRetry,
  onOpenSettings,
  onDismiss
}) => {
  const getErrorIcon = () => {
    switch (error.device) {
      case 'camera': return <Camera className="h-4 w-4" />;
      case 'microphone': return <Mic className="h-4 w-4" />;
      case 'speaker': return <Monitor className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getErrorSeverity = (): 'warning' | 'destructive' => {
    switch (error.type) {
      case 'permission-denied':
      case 'system-blocked':
        return 'destructive';
      default:
        return 'warning';
    }
  };

  const getBrowserSpecificSolution = () => {
    switch (error.type) {
      case 'permission-denied':
        return getBrowserPermissionSteps();
      case 'device-not-found':
        return getDeviceConnectionSteps();
      case 'device-in-use':
        return getDeviceInUseSteps();
      case 'browser-unsupported':
        return getBrowserUpdateSteps();
      case 'system-blocked':
        return getSystemPermissionSteps();
      default:
        return getGeneralTroubleshootingSteps();
    }
  };

  const getBrowserPermissionSteps = () => {
    const steps = {
      chrome: [
        'Click the camera icon in the address bar',
        'Select "Always allow on this site"',
        'Refresh the page'
      ],
      firefox: [
        'Click the shield icon in the address bar',
        'Click "Allow" for camera and microphone',
        'Reload the page if needed'
      ],
      safari: [
        'Go to Safari → Preferences → Websites',
        'Find Camera and Microphone settings',
        'Set this site to "Allow"'
      ],
      edge: [
        'Click the camera icon in the address bar',
        'Choose "Allow" for this site',
        'Refresh if necessary'
      ],
      unknown: [
        'Look for a camera/microphone icon in your browser',
        'Click it and allow permissions',
        'Refresh the page'
      ]
    };

    return steps[error.browserType] || steps.unknown;
  };

  const getDeviceConnectionSteps = () => [
    'Check that your camera/microphone is connected',
    'Try unplugging and reconnecting the device',
    'Test the device in another application',
    'Check device drivers and updates'
  ];

  const getDeviceInUseSteps = () => [
    'Close other video/audio applications',
    'End video calls in other browser tabs',
    'Restart your browser',
    'Check task manager for apps using your devices'
  ];

  const getBrowserUpdateSteps = () => [
    'Update your browser to the latest version',
    'Enable WebRTC in browser settings',
    'Try using a different supported browser',
    'Clear browser cache and cookies'
  ];

  const getSystemPermissionSteps = () => {
    const isWindows = navigator.platform.toLowerCase().includes('win');
    const isMac = navigator.platform.toLowerCase().includes('mac');
    
    if (isWindows) {
      return [
        'Open Windows Settings → Privacy & Security',
        'Go to Camera/Microphone settings',
        'Enable "Allow apps to access camera/microphone"',
        'Restart your browser'
      ];
    }
    
    if (isMac) {
      return [
        'Open System Preferences → Security & Privacy',
        'Go to Privacy tab → Camera/Microphone',
        'Check the box next to your browser',
        'Restart your browser'
      ];
    }
    
    return [
      'Check your operating system privacy settings',
      'Enable camera/microphone access for browsers',
      'Restart your browser',
      'Contact system administrator if needed'
    ];
  };

  const getGeneralTroubleshootingSteps = () => [
    'Refresh the page and try again',
    'Check your internet connection',
    'Restart your browser',
    'Try using an incognito/private window'
  ];

  const getHelpUrl = () => {
    switch (error.browserType) {
      case 'chrome':
        return 'https://support.google.com/chrome/answer/2693767';
      case 'firefox':
        return 'https://support.mozilla.org/en-US/kb/how-manage-your-camera-and-microphone-permissions';
      case 'safari':
        return 'https://support.apple.com/guide/safari/websites-ibrwe2159f50/mac';
      case 'edge':
        return 'https://support.microsoft.com/en-us/microsoft-edge/camera-and-microphone-permissions-in-microsoft-edge-87b1fa41-5755-2b04-e4b8-cb53893c5b7a';
      default:
        return 'https://support.google.com/meet/answer/7380413';
    }
  };

  return (
    <Alert variant={getErrorSeverity()} className="mb-4">
      <div className="flex items-start gap-3">
        {getErrorIcon()}
        <div className="flex-1 min-w-0">
          <AlertTitle className="flex items-center gap-2 mb-2">
            {error.message}
            <Badge variant="outline" className="text-xs">
              {error.device} issue
            </Badge>
          </AlertTitle>
          
          <AlertDescription className="space-y-3">
            {error.details && (
              <p className="text-sm text-muted-foreground">{error.details}</p>
            )}
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Quick Fix Steps:</h4>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                {getBrowserSpecificSolution().map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={onRetry}
                className="flex-1 min-w-fit"
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Try Again
              </Button>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={onOpenSettings}
              >
                <Settings className="h-3 w-3 mr-2" />
                Settings
              </Button>
              
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => window.open(getHelpUrl(), '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Help
              </Button>
            </div>
            
            <Button 
              variant="link" 
              size="sm" 
              onClick={onDismiss}
              className="h-auto p-0 text-xs"
            >
              Dismiss this message
            </Button>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};