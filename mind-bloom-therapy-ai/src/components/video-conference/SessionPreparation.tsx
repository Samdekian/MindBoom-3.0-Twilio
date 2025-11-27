
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  Mic, 
  Check, 
  X, 
  AlertTriangle,
  Play,
  Shield,
  RefreshCw,
  Volume2
} from "lucide-react";
import { useEnhancedDeviceTesting } from "@/hooks/video-conference/use-enhanced-device-testing";
import { useUnifiedPermissionHandler } from "@/hooks/video-conference/use-unified-permission-handler";
import { PermissionRecoveryGuide } from "@/components/video-conference/preparation/PermissionRecoveryGuide";
import { EnhancedErrorMessaging } from "@/components/video-conference/preparation/EnhancedErrorMessaging";
import { useEnhancedErrorHandling } from "@/hooks/video-conference/use-enhanced-error-handling";

interface SessionPreparationProps {
  appointmentId: string;
  onComplete: (permissionsValidated: boolean) => void;
}

const SessionPreparation: React.FC<SessionPreparationProps> = ({
  appointmentId,
  onComplete
}) => {
  const { 
    testResult, 
    isTestingDevices, 
    runCompleteDeviceTest
  } = useEnhancedDeviceTesting();

  const {
    permissionState,
    recoveryFlow,
    requestPermissions,
    retryPermissions,
    resetRecoveryFlow,
    nextRecoveryStep,
    getBrowserSpecificInstructions
  } = useUnifiedPermissionHandler();

  const {
    currentError,
    handleError,
    clearError,
    retryLastAction,
    openSystemSettings
  } = useEnhancedErrorHandling();

  const [hasTestedDevices, setHasTestedDevices] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState({
    camera: null as string | null,
    microphone: null as string | null,
    speaker: null as string | null
  });

  const allChecksComplete = testResult.overall && hasTestedDevices && permissionState.bothGranted;

  const handleTestDevices = async () => {
    try {
      const success = await runCompleteDeviceTest();
      setHasTestedDevices(true);
      if (!success) {
        handleError(new Error('Device test failed'), 'all');
      }
    } catch (error) {
      handleError(error, 'all');
    }
  };

  const handleDeviceTest = async (deviceType: 'camera' | 'microphone' | 'speaker'): Promise<boolean> => {
    try {
      // Simulate device testing - replace with actual device test logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      handleError(error, deviceType);
      return false;
    }
  };

  const handleDeviceChange = (deviceType: 'camera' | 'microphone' | 'speaker', deviceId: string) => {
    setSelectedDevices(prev => ({
      ...prev,
      [deviceType]: deviceId
    }));
  };

  const handleRequestPermissions = async (): Promise<void> => {
    try {
      const success = await requestPermissions();
      if (success) {
        resetRecoveryFlow();
        clearError();
      }
    } catch (error) {
      handleError(error, 'all');
    }
  };

  const CheckItem = ({ 
    label, 
    status, 
    icon: Icon,
    showPermissionButton = false
  }: { 
    label: string; 
    status: boolean | null; 
    icon: React.ElementType;
    showPermissionButton?: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        {status === null ? (
          <Badge variant="secondary">Not Tested</Badge>
        ) : (
          <Badge variant={status ? "default" : "destructive"}>
            {status ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          </Badge>
        )}
        {showPermissionButton && !permissionState.bothGranted && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleRequestPermissions}
          >
            <Shield className="h-3 w-3 mr-1" />
            Allow
          </Button>
        )}
      </div>
    </div>
  );

  const getPermissionStatus = () => {
    if (!permissionState.bothGranted) {
      return (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Permission Required
            </span>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            Please allow camera and microphone access to continue. Click "Allow Access" below.
          </p>
          <Button 
            onClick={handleRequestPermissions}
            size="sm"
            className="w-full"
          >
            <Shield className="h-4 w-4 mr-2" />
            Allow Camera & Microphone Access
          </Button>
        </div>
      );
    }

    if (permissionState.bothGranted && !hasTestedDevices) {
      return (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            Permissions granted! Now test your devices to ensure they're working properly.
          </p>
        </div>
      );
    }

    if (!testResult.overall && hasTestedDevices) {
      return (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <X className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              Device Issues Detected
            </span>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Some devices are not working properly. Please check your connections and try again.
          </p>
          <Button 
            onClick={handleTestDevices}
            size="sm"
            variant="outline"
            disabled={isTestingDevices}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Again
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Session Preparation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Let's make sure your devices are working properly before joining the session.
          </p>
          
          <div className="space-y-3">
            <CheckItem 
              label="Camera" 
              status={hasTestedDevices ? testResult.camera : null} 
              icon={Video}
              showPermissionButton={true}
            />
            <CheckItem 
              label="Microphone" 
              status={hasTestedDevices ? testResult.microphone : null} 
              icon={Mic}
              showPermissionButton={true}
            />
            <CheckItem 
              label="Speakers" 
              status={hasTestedDevices ? testResult.speakers : null} 
              icon={Volume2}
            />
          </div>

          {getPermissionStatus()}
          
          <PermissionRecoveryGuide
            permissionState={permissionState}
            recoveryFlow={recoveryFlow}
            onRetry={retryPermissions}
            onNextStep={nextRecoveryStep}
            onDismiss={resetRecoveryFlow}
            getBrowserInstructions={getBrowserSpecificInstructions}
          />

          {currentError && (
            <EnhancedErrorMessaging
              error={currentError}
              onRetry={() => retryLastAction(handleTestDevices)}
              onOpenSettings={openSystemSettings}
              onDismiss={clearError}
            />
          )}

          <div className="flex space-x-2">
            <Button 
              onClick={handleTestDevices} 
              disabled={isTestingDevices || !permissionState.bothGranted}
              className="flex-1"
            >
              {isTestingDevices ? "Testing..." : "Test All Devices"}
            </Button>
            
            {allChecksComplete && (
              <Button 
                onClick={() => onComplete(true)}
                className="flex-1"
                variant="default"
              >
                <Play className="h-4 w-4 mr-2" />
                Join Session
              </Button>
            )}
          </div>
          
          {hasTestedDevices && !allChecksComplete && (
            <div className="text-center">
              <Button 
                onClick={() => onComplete(permissionState.bothGranted)}
                variant="outline"
                className="w-full"
              >
                Skip Testing & Join Anyway
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                You can join even if device testing failed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionPreparation;
