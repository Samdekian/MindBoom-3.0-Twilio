
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  RefreshCw, 
  Settings, 
  HelpCircle,
  Camera,
  Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConnectionErrorType = 
  | 'network-timeout'
  | 'permission-denied'
  | 'device-not-found'
  | 'server-error'
  | 'peer-connection-failed'
  | 'bandwidth-insufficient';

export interface ConnectionError {
  type: ConnectionErrorType;
  message: string;
  details?: string;
  timestamp: Date;
}

interface ConnectionErrorCardProps {
  error: ConnectionError;
  onRetry: () => void;
  onOpenSettings?: () => void;
  onGetHelp?: () => void;
  className?: string;
}

const ConnectionErrorCard: React.FC<ConnectionErrorCardProps> = ({
  error,
  onRetry,
  onOpenSettings,
  onGetHelp,
  className
}) => {
  const getErrorConfig = (type: ConnectionErrorType) => {
    switch (type) {
      case 'network-timeout':
        return {
          icon: WifiOff,
          title: 'Connection Timeout',
          severity: 'warning' as const,
          actions: [
            { label: 'Retry Connection', action: onRetry, variant: 'default' as const }
          ],
          tips: [
            'Check your internet connection',
            'Try moving closer to your router',
            'Close other apps using internet'
          ]
        };
      
      case 'permission-denied':
        return {
          icon: AlertTriangle,
          title: 'Camera/Microphone Access Denied',
          severity: 'destructive' as const,
          actions: [
            { label: 'Open Settings', action: onOpenSettings, variant: 'default' as const },
            { label: 'Retry', action: onRetry, variant: 'outline' as const }
          ],
          tips: [
            'Allow camera and microphone access in your browser',
            'Check site permissions in browser settings',
            'Refresh the page and try again'
          ]
        };
      
      case 'device-not-found':
        return {
          icon: Camera,
          title: 'Camera or Microphone Not Found',
          severity: 'warning' as const,
          actions: [
            { label: 'Check Devices', action: onOpenSettings, variant: 'default' as const },
            { label: 'Retry', action: onRetry, variant: 'outline' as const }
          ],
          tips: [
            'Make sure your camera and microphone are connected',
            'Try unplugging and reconnecting your devices',
            'Check if other apps are using your camera'
          ]
        };
      
      case 'bandwidth-insufficient':
        return {
          icon: Wifi,
          title: 'Poor Connection Quality',
          severity: 'warning' as const,
          actions: [
            { label: 'Continue in Audio Mode', action: onRetry, variant: 'default' as const }
          ],
          tips: [
            'Switch to audio-only mode to improve quality',
            'Close other devices using your network',
            'Move closer to your router'
          ]
        };
      
      default:
        return {
          icon: AlertTriangle,
          title: 'Connection Error',
          severity: 'destructive' as const,
          actions: [
            { label: 'Retry', action: onRetry, variant: 'default' as const }
          ],
          tips: [
            'Check your internet connection',
            'Refresh the page',
            'Contact support if the problem persists'
          ]
        };
    }
  };

  const config = getErrorConfig(error.type);
  const Icon = config.icon;

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-full",
            config.severity === 'destructive' && "bg-red-100 text-red-600",
            config.severity === 'warning' && "bg-yellow-100 text-yellow-600"
          )}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-lg">{config.title}</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert variant={config.severity}>
          <AlertTitle>What happened?</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          {error.details && (
            <AlertDescription className="mt-2 text-sm text-muted-foreground">
              {error.details}
            </AlertDescription>
          )}
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Try these solutions:</h4>
          <ul className="space-y-2">
            {config.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2 pt-2">
          {config.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              onClick={action.action}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {action.label}
            </Button>
          ))}
          
          {onGetHelp && (
            <Button variant="ghost" size="icon" onClick={onGetHelp}>
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionErrorCard;
