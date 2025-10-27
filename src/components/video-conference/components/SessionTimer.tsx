import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause } from "lucide-react";

interface SessionTimerProps {
  isActive: boolean;
  startTime?: Date;
  showControls?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SessionTimer: React.FC<SessionTimerProps> = ({
  isActive,
  startTime,
  showControls = false,
  size = 'md'
}) => {
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      if (startTime) {
        setDuration(Math.floor((Date.now() - startTime.getTime()) / 1000));
      } else {
        setDuration(prev => prev + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime, isPaused]);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  if (!isActive) {
    return (
      <Badge variant="outline" className={sizeClasses[size]}>
        <Clock className={`${iconSizes[size]} mr-1`} />
        Not started
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Badge 
        variant={isPaused ? "secondary" : "default"} 
        className={`${sizeClasses[size]} font-mono`}
      >
        <Clock className={`${iconSizes[size]} mr-1`} />
        {formatDuration(duration)}
        {isPaused && (
          <Pause className={`${iconSizes[size]} ml-1 opacity-60`} />
        )}
      </Badge>
      
      {showControls && (
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title={isPaused ? "Resume timer" : "Pause timer"}
        >
          {isPaused ? (
            <Play className={iconSizes[size]} />
          ) : (
            <Pause className={iconSizes[size]} />
          )}
        </button>
      )}
    </div>
  );
};

export default SessionTimer;