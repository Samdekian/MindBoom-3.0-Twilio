import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  isConnected: boolean;
  isDegraded: boolean;
  className?: string;
}

/**
 * Simple connection status indicator for the UI
 * Replaces complex connection dashboard
 */
export const ConnectionStatusIndicator: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isDegraded,
  className
}) => {
  if (isDegraded) {
    return (
      <Badge variant="secondary" className={cn("gap-1", className)}>
        <AlertTriangle className="h-3 w-3" />
        Limited
      </Badge>
    );
  }

  if (isConnected) {
    return (
      <Badge variant="default" className={cn("gap-1", className)}>
        <Wifi className="h-3 w-3" />
        Connected
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className={cn("gap-1", className)}>
      <WifiOff className="h-3 w-3" />
      Offline
    </Badge>
  );
};