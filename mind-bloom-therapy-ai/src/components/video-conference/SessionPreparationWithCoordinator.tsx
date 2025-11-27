import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Camera, Mic, MicOff, CameraOff, CheckCircle, AlertCircle, Loader2, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useVideoSessionCoordinatorContext } from '@/contexts/VideoSessionCoordinatorContext';
import { PermissionRecoveryGuide } from './preparation/PermissionRecoveryGuide';
import { EnhancedErrorMessaging } from './preparation/EnhancedErrorMessaging';

interface SessionPreparationProps {
  onJoinSession: () => void;
  sessionId: string;
}

export function SessionPreparationWithCoordinator({ onJoinSession, sessionId }: SessionPreparationProps) {
  const { toast } = useToast();
  const coordinator = useVideoSessionCoordinatorContext();
  
  const [isStartingCall, setIsStartingCall] = useState(false);

  // Initialize session preparation
  useEffect(() => {
    coordinator.initializeSession();
  }, [coordinator]);

  const handleStartCall = async () => {
    if (!coordinator.canStartCall) {
      toast({
        title: "Setup Incomplete",
        description: "Please complete device setup before starting the call",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsStartingCall(true);
      const success = await coordinator.startCall();
      
      if (success) {
        onJoinSession();
      } else {
        toast({
          title: "Call Failed",
          description: "Unable to start the video call. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to start call:', error);
      toast({
        title: "Connection Error",
        description: "Failed to establish video connection",
        variant: "destructive"
      });
    } finally {
      setIsStartingCall(false);
    }
  };

  const getOverallStatus = () => {
    if (coordinator.isInitializing) return 'initializing';
    if (coordinator.hasError) return 'error';
    if (coordinator.isCheckingPermissions) return 'checking-permissions';
    if (coordinator.isPreparingDevices) return 'preparing-devices';
    if (coordinator.isReady) return 'ready';
    if (coordinator.isConnecting) return 'connecting';
    if (coordinator.isConnected) return 'connected';
    return 'setup-incomplete';
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'initializing':
        return { 
          label: 'Initializing...', 
          color: 'secondary' as const, 
          icon: Loader2,
          description: 'Setting up your session...'
        };
      case 'checking-permissions':
        return { 
          label: 'Checking Permissions', 
          color: 'secondary' as const, 
          icon: Loader2,
          description: 'Verifying camera and microphone access...'
        };
      case 'preparing-devices':
        return { 
          label: 'Preparing Devices', 
          color: 'secondary' as const, 
          icon: Camera,
          description: 'Setting up your camera and microphone...'
        };
      case 'ready':
        return { 
          label: 'Ready to Start', 
          color: 'default' as const, 
          icon: CheckCircle,
          description: 'All systems ready for video call'
        };
      case 'connecting':
        return { 
          label: 'Connecting...', 
          color: 'secondary' as const, 
          icon: Loader2,
          description: 'Establishing video connection...'
        };
      case 'connected':
        return { 
          label: 'Connected', 
          color: 'default' as const, 
          icon: CheckCircle,
          description: 'Video call is active'
        };
      case 'error':
        return { 
          label: 'Setup Error', 
          color: 'destructive' as const, 
          icon: AlertCircle,
          description: 'Please resolve the issues below'
        };
      default:
        return { 
          label: 'Setup Incomplete', 
          color: 'secondary' as const, 
          icon: AlertCircle,
          description: 'Complete the setup to continue'
        };
    }
  };

  const overallStatus = getOverallStatus();
  const statusDisplay = getStatusDisplay(overallStatus);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Video Session Setup</CardTitle>
            <Badge variant={statusDisplay.color} className="flex items-center gap-2">
              <statusDisplay.icon className={`h-4 w-4 ${statusDisplay.icon === Loader2 ? 'animate-spin' : ''}`} />
              {statusDisplay.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{statusDisplay.description}</p>
        </CardHeader>

      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5" />
            <div>
              <div className="font-medium">Camera Access</div>
              <div className="text-sm text-muted-foreground">
                {coordinator.permissionHandler.permissionState.camera === 'granted' ? 'Enabled' : 'Required'}
              </div>
            </div>
          </div>
          <Badge variant={coordinator.permissionHandler.permissionState.camera === 'granted' ? 'default' : 'secondary'}>
            {coordinator.permissionHandler.permissionState.camera === 'granted' ? 'Granted' : 'Needed'}
          </Badge>
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5" />
            <div>
              <div className="font-medium">Microphone Access</div>
              <div className="text-sm text-muted-foreground">
                {coordinator.permissionHandler.permissionState.microphone === 'granted' ? 'Enabled' : 'Required'}
              </div>
            </div>
          </div>
          <Badge variant={coordinator.permissionHandler.permissionState.microphone === 'granted' ? 'default' : 'secondary'}>
            {coordinator.permissionHandler.permissionState.microphone === 'granted' ? 'Granted' : 'Needed'}
          </Badge>
        </div>

        {/* Device Validation Status */}
        {coordinator.coordinatorState.deviceValidationStatus.camera !== 'unknown' && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {coordinator.coordinatorState.deviceValidationStatus.camera === 'valid' ? 
                    <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
                  <div>
                    <div className="font-medium">Camera Test</div>
                    <div className="text-sm text-muted-foreground">
                      {coordinator.coordinatorState.deviceValidationStatus.camera === 'valid' ? 'Working properly' : 'Not functioning'}
                    </div>
                  </div>
                </div>
                <Badge variant={coordinator.coordinatorState.deviceValidationStatus.camera === 'valid' ? 'default' : 'destructive'}>
                  {coordinator.coordinatorState.deviceValidationStatus.camera === 'valid' ? 'Pass' : 'Fail'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {coordinator.coordinatorState.deviceValidationStatus.microphone === 'valid' ? 
                    <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                  <div>
                    <div className="font-medium">Microphone Test</div>
                    <div className="text-sm text-muted-foreground">
                      {coordinator.coordinatorState.deviceValidationStatus.microphone === 'valid' ? 'Working properly' : 'Not functioning'}
                    </div>
                  </div>
                </div>
                <Badge variant={coordinator.coordinatorState.deviceValidationStatus.microphone === 'valid' ? 'default' : 'destructive'}>
                  {coordinator.coordinatorState.deviceValidationStatus.microphone === 'valid' ? 'Pass' : 'Fail'}
                </Badge>
              </div>
            </div>
          </>
        )}

        {/* Recovery Guide */}
        {coordinator.permissionHandler.recoveryFlow.showInstructions && (
          <PermissionRecoveryGuide 
            permissionState={coordinator.permissionHandler.permissionState}
            recoveryFlow={coordinator.permissionHandler.recoveryFlow}
            onRetry={() => coordinator.permissionHandler.retryPermissions()}
            onNextStep={() => coordinator.permissionHandler.nextRecoveryStep()}
            onDismiss={() => coordinator.permissionHandler.resetRecoveryFlow()}
            getBrowserInstructions={() => coordinator.permissionHandler.getBrowserSpecificInstructions(coordinator.permissionHandler.permissionState.browserType)}
          />
        )}

        {/* Error Messaging */}
        {coordinator.errorHandler.currentError && (
          <EnhancedErrorMessaging 
            error={coordinator.errorHandler.currentError}
            onRetry={() => coordinator.errorHandler.retryLastAction(async () => {
              await coordinator.permissionHandler.requestPermissions();
            })}
            onOpenSettings={() => coordinator.errorHandler.openSystemSettings()}
            onDismiss={() => coordinator.errorHandler.clearError()}
          />
        )}

      </CardContent>

      {/* Action Buttons */}
      <div className="p-6 pt-0 space-y-3">
        {!coordinator.permissionHandler.permissionState.bothGranted && (
          <Button 
            onClick={() => coordinator.permissionHandler.requestPermissions()}
            className="w-full"
            disabled={coordinator.permissionHandler.permissionState.isChecking}
          >
            {coordinator.permissionHandler.permissionState.isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Permissions...
              </>
            ) : (
              'Grant Permissions'
            )}
          </Button>
        )}

        {coordinator.isReady && (
          <Button 
            onClick={() => coordinator.resetSession()}
            className="w-full"
            variant="outline"
          >
            Reset Setup
          </Button>
        )}

        <Button 
          onClick={handleStartCall}
          className="w-full"
          disabled={!coordinator.canStartCall || isStartingCall}
          size="lg"
        >
          {isStartingCall ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Call...
            </>
          ) : coordinator.isConnected ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Call Active
            </>
          ) : (
            <>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start Video Call
            </>
          )}
        </Button>
      </div>
      </Card>
    </div>
  );
}