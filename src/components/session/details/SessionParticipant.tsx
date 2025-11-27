
import React from "react";
import { User } from "lucide-react";

interface SessionParticipantProps {
  participantName: string;
  isTherapist: boolean;
}

export const SessionParticipant: React.FC<SessionParticipantProps> = ({
  participantName,
  isTherapist,
}) => {
  return (
    <div className="flex items-center gap-2">
      <User className="h-5 w-5 text-muted-foreground" />
      <span>
        {isTherapist ? `Patient: ${participantName}` : `Therapist: ${participantName}`}
      </span>
    </div>
  );
};

export default SessionParticipant;
