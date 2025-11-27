
import React from "react";
import { Badge } from "@/components/ui/badge";

interface SessionStatusBadgesProps {
  waitingRoomActive: boolean;
  isInSession: boolean;
  isRecording: boolean;
}

const SessionStatusBadges: React.FC<SessionStatusBadgesProps> = ({
  waitingRoomActive,
  isInSession,
  isRecording,
}) => {
  return (
    <div className="flex items-center gap-2">
      {waitingRoomActive && (
        <Badge variant="outline" className="bg-amber-500/20 text-amber-500">
          Waiting Room
        </Badge>
      )}
      {isInSession && !waitingRoomActive && (
        <Badge variant="outline" className="bg-green-500/20 text-green-500">
          In Session
        </Badge>
      )}
      {isRecording && (
        <Badge variant="outline" className="bg-red-500/20 text-red-500 animate-pulse">
          Recording
        </Badge>
      )}
    </div>
  );
};

export default SessionStatusBadges;
