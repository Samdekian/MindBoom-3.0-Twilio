import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConnectionStatusProps {
  connectionState: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  connectionStates?: Record<string, RTCPeerConnectionState>;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  connectionState,
  connectionStates = {},
  className
}) => {
  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'CONNECTING':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'CONNECTED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'DISCONNECTED':
        return <WifiOff className="h-4 w-4 text-orange-500" />;
      default:
        return <Wifi className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusText = () => {
    const peerCount = Object.keys(connectionStates).length;
    const connectedPeers = Object.values(connectionStates).filter(state => state === 'connected').length;
    
    switch (connectionState) {
      case 'CONNECTING':
        return 'Connecting to session...';
      case 'CONNECTED':
        return peerCount > 0 
          ? `Connected (${connectedPeers}/${peerCount} participants)`
          : 'Connected - waiting for participants';
      case 'FAILED':
        return 'Connection failed';
      case 'DISCONNECTED':
        return 'Connection lost - attempting to reconnect';
      default:
        return 'Ready to connect';
    }
  };

  const getStatusVariant = () => {
    switch (connectionState) {
      case 'CONNECTED':
        return 'default';
      case 'CONNECTING':
        return 'secondary';
      case 'FAILED':
        return 'destructive';
      case 'DISCONNECTED':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const showDetailedStatus = connectionState === 'CONNECTED' && Object.keys(connectionStates).length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {getConnectionIcon()}
        <Badge variant={getStatusVariant()} className="text-xs">
          {getStatusText()}
        </Badge>
      </div>

      {/* Show connection failures as alerts */}
      {connectionState === 'FAILED' && (
        <Alert variant="destructive" className="text-xs">
          <XCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            Unable to establish connection. Check your internet connection and try again.
          </AlertDescription>
        </Alert>
      )}

      {connectionState === 'DISCONNECTED' && (
        <Alert className="text-xs">
          <AlertTriangle className="h-3 w-3" />
          <AlertDescription className="text-xs">
            Connection temporarily lost. Attempting to reconnect...
          </AlertDescription>
        </Alert>
      )}

      {/* Show detailed peer connection states when connected */}
      {showDetailedStatus && (
        <div className="text-xs text-muted-foreground space-y-1">
          {Object.entries(connectionStates).map(([userId, state]) => (
            <div key={userId} className="flex items-center gap-2">
              <div className={cn(
                "h-2 w-2 rounded-full",
                state === 'connected' ? 'bg-green-500' : 
                state === 'connecting' ? 'bg-yellow-500' : 
                'bg-red-500'
              )} />
              <span>Participant: {state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};