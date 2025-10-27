import React from 'react';
import { Loader2, Video, Wifi, Settings, UserPlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  variant: 'joining' | 'connecting' | 'device-setup' | 'waiting-admission' | 'reconnecting';
  title?: string;
  description?: string;
  progress?: number;
  className?: string;
}

const LoadingStates: React.FC<LoadingStateProps> = ({
  variant,
  title,
  description,
  progress,
  className
}) => {
  const getConfig = () => {
    switch (variant) {
      case 'joining':
        return {
          icon: UserPlus,
          defaultTitle: 'Joining Session',
          defaultDescription: 'Setting up your video session...',
          color: 'bg-blue-500/10 text-blue-600'
        };
      case 'connecting':
        return {
          icon: Wifi,
          defaultTitle: 'Connecting',
          defaultDescription: 'Establishing connection with other participants...',
          color: 'bg-emerald-500/10 text-emerald-600'
        };
      case 'device-setup':
        return {
          icon: Settings,
          defaultTitle: 'Setting Up Devices',
          defaultDescription: 'Configuring your camera and microphone...',
          color: 'bg-purple-500/10 text-purple-600'
        };
      case 'waiting-admission':
        return {
          icon: Video,
          defaultTitle: 'Waiting for Admission',
          defaultDescription: 'Your therapist will admit you shortly...',
          color: 'bg-amber-500/10 text-amber-600'
        };
      case 'reconnecting':
        return {
          icon: Loader2,
          defaultTitle: 'Reconnecting',
          defaultDescription: 'Attempting to restore your connection...',
          color: 'bg-red-500/10 text-red-600'
        };
      default:
        return {
          icon: Loader2,
          defaultTitle: 'Loading',
          defaultDescription: 'Please wait...',
          color: 'bg-gray-500/10 text-gray-600'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <Card className={cn("border-0 shadow-lg", className)}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={cn("rounded-full p-4", config.color)}>
            <Icon className="h-8 w-8 animate-spin" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {title || config.defaultTitle}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {description || config.defaultDescription}
            </p>
          </div>

          {progress !== undefined && (
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  config.color.split(' ')[1] // Extract color class
                )}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s'
                }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingStates;