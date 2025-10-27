import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ConnectionStatusIndicator = () => {
  const { 
    isOnline, 
    supabaseConnected, 
    realtimeConnected, 
    hasConnection,
    connectionAttempts 
  } = useConnectionStatus();

  const getStatusColor = () => {
    if (!isOnline) return 'text-destructive';
    if (!hasConnection) return 'text-warning';
    if (realtimeConnected) return 'text-success';
    return 'text-muted-foreground';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (supabaseConnected === false) return 'Database disconnected';
    if (connectionAttempts > 0) return `Reconnecting... (${connectionAttempts}/3)`;
    if (!realtimeConnected) return 'Limited connectivity';
    return 'Connected';
  };

  const StatusIcon = () => {
    if (!isOnline || !hasConnection) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (connectionAttempts > 0) {
      return <AlertCircle className="h-4 w-4" />;
    }
    return <Wifi className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <StatusIcon />
      <span className={cn("font-medium", getStatusColor())}>
        {getStatusText()}
      </span>
      {connectionAttempts > 0 && (
        <div className="animate-pulse">
          <div className="h-2 w-2 bg-current rounded-full" />
        </div>
      )}
    </div>
  );
};