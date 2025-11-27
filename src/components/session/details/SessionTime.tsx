
import React from "react";
import { Calendar, Clock } from "lucide-react";

interface SessionTimeProps {
  appointmentDate: string;
  startTime: string;
  endTime: string;
}

export const SessionTime: React.FC<SessionTimeProps> = ({
  appointmentDate,
  startTime,
  endTime,
}) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground" />
        <span>{appointmentDate}</span>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-muted-foreground" />
        <span>{startTime} - {endTime}</span>
      </div>
    </>
  );
};

export default SessionTime;
