
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SessionStatusProps {
  connectionState: string;
  isInSession: boolean;
  waitingRoomActive: boolean;
}

const SessionStatus: React.FC<SessionStatusProps> = ({
  connectionState,
  isInSession,
  waitingRoomActive
}) => {
  const getStatusText = () => {
    if (!isInSession && waitingRoomActive) {
      return "Waiting Room";
    }
    
    if (!isInSession) {
      return "Not Connected";
    }
    
    switch (connectionState) {
      case 'connected': return "Connected";
      case 'connecting': return "Connecting";
      case 'disconnected': return "Disconnected";
      case 'failed': return "Connection Failed";
      case 'closed': return "Connection Closed";
      default: return "Connection State: " + connectionState;
    }
  };
  
  const getVariant = () => {
    if (!isInSession && waitingRoomActive) {
      return "warning";
    }
    
    if (!isInSession) {
      return "default";
    }
    
    switch (connectionState) {
      case 'connected': return "success";
      case 'connecting': return "default";
      case 'disconnected': return "warning";
      case 'failed': return "destructive";
      case 'closed': return "secondary";
      default: return "default";
    }
  };

  return (
    <Badge variant={getVariant()}>
      {getStatusText()}
    </Badge>
  );
};

export default SessionStatus;
