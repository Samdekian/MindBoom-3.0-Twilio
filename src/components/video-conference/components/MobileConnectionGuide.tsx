import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Wifi, 
  Video, 
  Mic, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileConnectionGuideProps {
  onClose: () => void;
  onRetry: () => void;
  permissionState: {
    camera: 'granted' | 'denied' | 'prompt' | 'unknown';
    microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
    bothGranted: boolean;
    isChecking: boolean;
    realCameraAccess?: boolean;
    realMicrophoneAccess?: boolean;
  };
}

const MobileConnectionGuide: React.FC<MobileConnectionGuideProps> = ({
  onClose,
  onRetry,
  permissionState
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Wifi className="h-6 w-6" />,
      title: "Check Connection",
      description: "Ensure you have a stable internet connection",
      isComplete: true
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Camera Permission",
      description: "Allow camera access for video calls",
      isComplete: permissionState.camera === 'granted'
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Microphone Permission", 
      description: "Allow microphone access for audio",
      isComplete: permissionState.microphone === 'granted'
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Browser Settings",
      description: "Check if browser supports WebRTC",
      isComplete: typeof RTCPeerConnection !== 'undefined'
    }
  ];

  const hasPermissionIssues = permissionState.camera === 'denied' || permissionState.microphone === 'denied';

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg border shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Mobile Connection Help</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {hasPermissionIssues && (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                <p className="text-sm font-medium">Permission Required</p>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Please allow camera and microphone access in your browser settings
              </p>
            </div>
          )}

          <div className="space-y-3">
            {steps.map((step, index) => (
              <div 
                key={index}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  step.isComplete 
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                    : "bg-muted/50 border-border"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full",
                  step.isComplete 
                    ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {step.isComplete ? <CheckCircle className="h-4 w-4" /> : step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Mobile Browser Tips
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Use Chrome, Safari, or Firefox for best compatibility</li>
              <li>• Ensure you're using HTTPS (secure connection)</li>
              <li>• Close other apps using camera/microphone</li>
              <li>• Try refreshing the page if issues persist</li>
            </ul>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={onRetry} className="flex-1">
              <Wifi className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileConnectionGuide;