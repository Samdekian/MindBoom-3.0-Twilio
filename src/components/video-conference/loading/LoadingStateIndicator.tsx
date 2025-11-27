
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Camera, 
  Mic, 
  Wifi, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type LoadingStep = 
  | 'initializing'
  | 'requesting-permissions'
  | 'accessing-devices'
  | 'establishing-connection'
  | 'connecting-peer'
  | 'finalizing';

export interface LoadingProgress {
  currentStep: LoadingStep;
  completedSteps: LoadingStep[];
  estimatedTimeRemaining?: number;
  error?: string;
}

interface LoadingStateIndicatorProps {
  progress: LoadingProgress;
  className?: string;
}

const LoadingStateIndicator: React.FC<LoadingStateIndicatorProps> = ({
  progress,
  className
}) => {
  const steps: Array<{
    key: LoadingStep;
    label: string;
    icon: React.ElementType;
    description: string;
  }> = [
    {
      key: 'initializing',
      label: 'Starting Session',
      icon: Loader2,
      description: 'Setting up video session...'
    },
    {
      key: 'requesting-permissions',
      label: 'Requesting Permissions',
      icon: Camera,
      description: 'Asking for camera and microphone access'
    },
    {
      key: 'accessing-devices',
      label: 'Accessing Devices',
      icon: Mic,
      description: 'Connecting to camera and microphone'
    },
    {
      key: 'establishing-connection',
      label: 'Connecting to Server',
      icon: Wifi,
      description: 'Establishing secure connection'
    },
    {
      key: 'connecting-peer',
      label: 'Connecting to Participant',
      icon: Wifi,
      description: 'Setting up video call connection'
    },
    {
      key: 'finalizing',
      label: 'Finalizing',
      icon: CheckCircle,
      description: 'Almost ready!'
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.key === progress.currentStep);
  const progressPercentage = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">Joining Session</h3>
          <div className="flex items-center justify-center gap-2">
            <Progress value={progressPercentage} className="flex-1" />
            <Badge variant="secondary">{progressPercentage}%</Badge>
          </div>
          {progress.estimatedTimeRemaining && (
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              About {formatTime(progress.estimatedTimeRemaining)} remaining
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = progress.completedSteps.includes(step.key);
            const isCurrent = progress.currentStep === step.key;
            const isUpcoming = index > currentStepIndex;
            
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-all",
                  isCompleted && "bg-green-50 border border-green-200",
                  isCurrent && "bg-blue-50 border border-blue-200",
                  isUpcoming && "bg-gray-50 border border-gray-200"
                )}
              >
                <div className={cn(
                  "p-2 rounded-full flex-shrink-0",
                  isCompleted && "bg-green-100 text-green-600",
                  isCurrent && "bg-blue-100 text-blue-600",
                  isUpcoming && "bg-gray-100 text-gray-400"
                )}>
                  {isCompleted ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Icon className={cn(
                      "h-4 w-4",
                      isCurrent && "animate-spin"
                    )} />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "font-medium text-sm",
                    isCompleted && "text-green-700",
                    isCurrent && "text-blue-700",
                    isUpcoming && "text-gray-500"
                  )}>
                    {step.label}
                  </div>
                  <div className={cn(
                    "text-xs",
                    isCompleted && "text-green-600",
                    isCurrent && "text-blue-600",
                    isUpcoming && "text-gray-400"
                  )}>
                    {step.description}
                  </div>
                </div>

                {isCompleted && (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error State */}
        {progress.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700">{progress.error}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoadingStateIndicator;
