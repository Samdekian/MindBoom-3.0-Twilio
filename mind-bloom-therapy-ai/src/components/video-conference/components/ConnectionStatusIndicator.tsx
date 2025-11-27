import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wifi, WifiOff, Signal, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConnectionStatus = 'excellent' | 'good' | 'poor' | 'disconnected' | 'connecting' | 'reconnecting';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  status,
  showLabel = false,
  size = 'md',
  className
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'excellent':
        return {
          icon: Wifi,
          label: 'Excellent',
          variant: 'default' as const,
          className: 'bg-emerald-500/20 text-emerald-700 border-emerald-200',
          tooltip: 'Connection is excellent - High quality video and audio'
        };
      case 'good':
        return {
          icon: Signal,
          label: 'Good',
          variant: 'secondary' as const,
          className: 'bg-blue-500/20 text-blue-700 border-blue-200',
          tooltip: 'Connection is good - Stable video and audio'
        };
      case 'poor':
        return {
          icon: AlertTriangle,
          label: 'Poor',
          variant: 'outline' as const,
          className: 'bg-amber-500/20 text-amber-700 border-amber-200',
          tooltip: 'Poor connection - Video and audio may be unstable'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          label: 'Disconnected',
          variant: 'destructive' as const,
          className: 'bg-red-500/20 text-red-700 border-red-200',
          tooltip: 'No connection - Attempting to reconnect...'
        };
      case 'connecting':
        return {
          icon: Wifi,
          label: 'Connecting...',
          variant: 'outline' as const,
          className: 'bg-gray-500/20 text-gray-700 border-gray-200',
          tooltip: 'Establishing connection...'
        };
      case 'reconnecting':
        return {
          icon: Wifi,
          label: 'Reconnecting...',
          variant: 'outline' as const,
          className: 'bg-orange-500/20 text-orange-700 border-orange-200 animate-pulse',
          tooltip: 'Attempting to restore connection...'
        };
      default:
        return {
          icon: WifiOff,
          label: 'Unknown',
          variant: 'outline' as const,
          className: 'bg-gray-500/20 text-gray-700 border-gray-200',
          tooltip: 'Connection status unknown'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const iconSize = sizeClasses[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={cn(
              'flex items-center gap-1.5 font-medium',
              config.className,
              className
            )}
          >
            <Icon className={cn(iconSize, status === 'reconnecting' && 'animate-spin')} />
            {showLabel && <span className="text-xs">{config.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatusIndicator;