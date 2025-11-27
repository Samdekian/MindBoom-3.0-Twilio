
import React from "react";
import { Video } from "lucide-react";

interface SessionVideoLinkProps {
  videoUrl: string;
}

export const SessionVideoLink: React.FC<SessionVideoLinkProps> = ({ videoUrl }) => {
  if (!videoUrl) return null;

  return (
    <div className="flex items-center gap-2">
      <Video className="h-5 w-5 text-muted-foreground" />
      <a 
        href={videoUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        Join Video Session
      </a>
    </div>
  );
};

export default SessionVideoLink;
