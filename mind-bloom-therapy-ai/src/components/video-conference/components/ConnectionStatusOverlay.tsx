import React from 'react';
import { Loader2, Wifi, WifiOff, AlertCircle, CheckCircle, Camera, Mic, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ConnectionStatusOverlayProps {
  connectionState: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  isInSession: boolean;
  onRetry?: () => void;
  className?: string;
  deviceStatus?: {
    camera?: 'detecting' | 'requesting' | 'granted' | 'denied' | 'unavailable';
    microphone?: 'detecting' | 'requesting' | 'granted' | 'denied' | 'unavailable';
    step?: string;
    progress?: number;
  };
}

const ConnectionStatusOverlay: React.FC<ConnectionStatusOverlayProps> = ({
  connectionState,
  isInSession,
  onRetry,
  className,
  deviceStatus
}) => {
  // Don't show overlay when connected
  if (connectionState === 'CONNECTED' || (!isInSession && connectionState === 'IDLE')) {
    return null;
  }

  const getStatusConfig = () => {
    // If we have device status, show device-specific info
    if (deviceStatus) {
      if (deviceStatus.camera === 'detecting' || deviceStatus.microphone === 'detecting') {
        return {
          icon: <Monitor className="h-8 w-8 animate-pulse text-primary" />,
          title: "Detecting Devices",
          description: "Checking for available cameras and microphones...",
          bgColor: "bg-background/95",
          showRetry: false,
          showProgress: true,
          progress: 25
        };
      }

      if (deviceStatus.camera === 'requesting' || deviceStatus.microphone === 'requesting') {
        const requestingDevices = [];
        if (deviceStatus.camera === 'requesting') requestingDevices.push('camera');
        if (deviceStatus.microphone === 'requesting') requestingDevices.push('microphone');
        
        return {
          icon: <Camera className="h-8 w-8 animate-pulse text-primary" />,
          title: "Requesting Permissions",
          description: `Please allow access to your ${requestingDevices.join(' and ')}...`,
          bgColor: "bg-primary/10",
          showRetry: false,
          showProgress: true,
          progress: 50
        };
      }

      if (deviceStatus.camera === 'denied' || deviceStatus.microphone === 'denied') {
        const deniedDevices = [];
        if (deviceStatus.camera === 'denied') deniedDevices.push('camera');
        if (deviceStatus.microphone === 'denied') deniedDevices.push('microphone');
        
        return {
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: "Permission Required",
          description: `Please enable ${deniedDevices.join(' and ')} access in your browser settings`,
          bgColor: "bg-destructive/10",
          showRetry: true,
          showProgress: false
        };
      }

      if (deviceStatus.camera === 'unavailable' && deviceStatus.microphone === 'unavailable') {
        return {
          icon: <AlertCircle className="h-8 w-8 text-amber-500" />,
          title: "No Devices Found",
          description: "No camera or microphone detected. Please connect your devices.",
          bgColor: "bg-amber-50/95 dark:bg-amber-950/95",
          showRetry: true,
          showProgress: false
        };
      }

      if (deviceStatus.step) {
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: "Setting Up Connection",
          description: deviceStatus.step,
          bgColor: "bg-background/95",
          showRetry: false,
          showProgress: true,
          progress: deviceStatus.progress || 75
        };
      }
    }

    // Default connection status
    switch (connectionState) {
      case 'CONNECTING':
        return {
          icon: <Loader2 className="h-8 w-8 animate-spin text-primary" />,
          title: "Connecting...",
          description: "Establishing video connection",
          bgColor: "bg-background/95",
          showRetry: false,
          showProgress: true,
          progress: 75
        };
      case 'DISCONNECTED':
        return {
          icon: <WifiOff className="h-8 w-8 text-amber-500" />,
          title: "Connection Lost",
          description: "Attempting to reconnect automatically",
          bgColor: "bg-amber-50/95 dark:bg-amber-950/95",
          showRetry: true,
          showProgress: false
        };
      case 'FAILED':
        return {
          icon: <AlertCircle className="h-8 w-8 text-destructive" />,
          title: "Connection Failed",
          description: "Unable to establish video connection",
          bgColor: "bg-destructive/10",
          showRetry: true,
          showProgress: false
        };
      default:
        return {
          icon: <Wifi className="h-8 w-8 text-muted-foreground" />,
          title: "Preparing Connection",
          description: "Getting ready to connect",
          bgColor: "bg-background/95",
          showRetry: false,
          showProgress: true,
          progress: 25
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className={cn(
      "absolute inset-0 z-50 flex items-center justify-center",
      statusConfig.bgColor,
      "backdrop-blur-sm",
      className
    )}>
      <div className="flex flex-col items-center gap-4 p-6 rounded-lg max-w-sm mx-4 text-center">
        <div className="p-3 rounded-full bg-background/80 shadow-sm">
          {statusConfig.icon}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            {statusConfig.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {statusConfig.description}
          </p>
        </div>

        {/* Progress indicator */}
        {statusConfig.showProgress && (
          <div className="w-full max-w-xs space-y-2">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${statusConfig.progress || 50}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {deviceStatus?.step || "This may take a few seconds..."}
            </p>
          </div>
        )}

        {/* Device status indicators */}
        {deviceStatus && (
          <div className="flex gap-4 items-center">
            <div className="flex items-center gap-2">
              <Camera className={cn(
                "h-4 w-4",
                deviceStatus.camera === 'granted' && "text-green-500",
                deviceStatus.camera === 'denied' && "text-red-500",
                deviceStatus.camera === 'unavailable' && "text-gray-400",
                (deviceStatus.camera === 'detecting' || deviceStatus.camera === 'requesting') && "text-primary animate-pulse"
              )} />
              <span className="text-xs text-muted-foreground">
                {deviceStatus.camera === 'granted' && "Camera OK"}
                {deviceStatus.camera === 'denied' && "Camera Blocked"}
                {deviceStatus.camera === 'unavailable' && "No Camera"}
                {(deviceStatus.camera === 'detecting' || deviceStatus.camera === 'requesting') && "Camera..."}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Mic className={cn(
                "h-4 w-4",
                deviceStatus.microphone === 'granted' && "text-green-500",
                deviceStatus.microphone === 'denied' && "text-red-500",
                deviceStatus.microphone === 'unavailable' && "text-gray-400",
                (deviceStatus.microphone === 'detecting' || deviceStatus.microphone === 'requesting') && "text-primary animate-pulse"
              )} />
              <span className="text-xs text-muted-foreground">
                {deviceStatus.microphone === 'granted' && "Mic OK"}
                {deviceStatus.microphone === 'denied' && "Mic Blocked"}
                {deviceStatus.microphone === 'unavailable' && "No Mic"}
                {(deviceStatus.microphone === 'detecting' || deviceStatus.microphone === 'requesting') && "Mic..."}
              </span>
            </div>
          </div>
        )}

        {statusConfig.showRetry && onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatusOverlay;