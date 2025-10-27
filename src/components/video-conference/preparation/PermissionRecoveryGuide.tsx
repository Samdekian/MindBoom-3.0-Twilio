import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Shield, 
  Monitor, 
  Smartphone, 
  RefreshCw,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { PermissionState, PermissionRecoveryFlow } from '@/hooks/video-conference/use-unified-permission-handler';

interface PermissionRecoveryGuideProps {
  permissionState: PermissionState;
  recoveryFlow: PermissionRecoveryFlow;
  onRetry: () => Promise<boolean>;
  onNextStep: () => void;
  onDismiss: () => void;
  getBrowserInstructions: (browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown') => string;
}

export const PermissionRecoveryGuide: React.FC<PermissionRecoveryGuideProps> = ({
  permissionState,
  recoveryFlow,
  onRetry,
  onNextStep,
  onDismiss,
  getBrowserInstructions
}) => {
  const getBrowserIcon = () => {
    switch (permissionState.browserType) {
      case 'chrome':
        return '🌐';
      case 'firefox':
        return '🦊';
      case 'safari':
        return '🧭';
      case 'edge':
        return '🔷';
      default:
        return '🌍';
    }
  };

  const getStepContent = () => {
    switch (recoveryFlow.instructionStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getBrowserIcon()}</span>
              <h3 className="font-semibold">Browser Permissions</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {getBrowserInstructions(permissionState.browserType)}
            </p>
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-xs font-medium mb-2">Quick Fix:</p>
              <ol className="text-xs space-y-1 list-decimal list-inside">
                <li>Look for a camera/microphone icon in your browser's address bar</li>
                <li>Click it and select "Always Allow" or "Allow"</li>
                <li>Refresh the page if needed</li>
              </ol>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              <h3 className="font-semibold">System Settings</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Check your operating system's privacy settings for camera and microphone access.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Windows</h4>
                <p className="text-xs">Settings → Privacy → Camera/Microphone</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium text-sm mb-2">macOS</h4>
                <p className="text-xs">System Preferences → Security & Privacy → Camera/Microphone</p>
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <h3 className="font-semibold">Device Check</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Ensure your camera and microphone are properly connected and not in use by other applications.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Camera is connected and working</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Microphone is connected and working</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>No other apps are using your devices</span>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <h3 className="font-semibold">Permission Required</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              We need access to your camera and microphone for video conferencing.
            </p>
            <Button onClick={onRetry} className="w-full">
              <Shield className="h-4 w-4 mr-2" />
              Grant Permissions
            </Button>
          </div>
        );
    }
  };

  if (!recoveryFlow.showInstructions) return null;

  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            Permission Setup Guide
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Step {recoveryFlow.instructionStep} of {recoveryFlow.maxSteps}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {getStepContent()}
        
        <div className="flex gap-2">
          {recoveryFlow.instructionStep > 0 && recoveryFlow.instructionStep < recoveryFlow.maxSteps && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onNextStep}
              className="flex-1"
            >
              Next Step
            </Button>
          )}
          
          <Button 
            size="sm" 
            onClick={onRetry}
            className="flex-1"
          >
            <RefreshCw className="h-3 w-3 mr-2" />
            Try Again
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        </div>
        
        <div className="pt-2 border-t">
          <Button 
            variant="link" 
            size="sm" 
            className="h-auto p-0 text-xs text-muted-foreground"
            onClick={() => window.open('https://support.google.com/chrome/answer/2693767', '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Need more help? Visit browser support docs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};