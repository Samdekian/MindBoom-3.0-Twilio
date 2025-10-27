
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface SessionDurationProps {
  formatSessionDuration: () => string;
}

const SessionDuration: React.FC<SessionDurationProps> = ({ formatSessionDuration }) => {
  return (
    <Badge variant="outline" className="flex items-center bg-gray-800/80 border-gray-700 text-white">
      <Clock className="h-3 w-3 mr-1" />
      <span>{formatSessionDuration()}</span>
    </Badge>
  );
};

export default SessionDuration;
