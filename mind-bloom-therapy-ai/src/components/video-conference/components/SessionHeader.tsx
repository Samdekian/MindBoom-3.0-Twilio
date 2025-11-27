
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Video, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface SessionHeaderProps {
  patientName: string;
  therapistName: string;
  recording: boolean;
  title?: string;
  status?: string;
  duration?: string;
}

/**
 * SessionHeader Component
 * 
 * Displays the header information for a video session, including:
 * - Session title and status
 * - Participant names
 * - Recording indicator
 * - Session duration
 * 
 * Provides important context and status information for the session.
 */
const SessionHeader: React.FC<SessionHeaderProps> = ({
  patientName,
  therapistName,
  recording,
  title = 'Therapy Session',
  status = 'active',
  duration
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-b">
      <div className="flex items-center">
        <h2 className="font-semibold text-lg mr-3">{title}</h2>
        <Badge 
          variant="outline" 
          className={cn(
            "capitalize", 
            status === 'active' && "bg-emerald-50 text-emerald-700 border-emerald-200",
            status === 'waiting' && "bg-amber-50 text-amber-700 border-amber-200"
          )}
        >
          {status}
        </Badge>
        
        {recording && (
          <Badge variant="destructive" className="ml-2 flex items-center animate-pulse">
            <Video className="h-3 w-3 mr-1" />
            Recording
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {duration && (
          <div className="hidden md:flex items-center text-sm text-slate-600 dark:text-slate-400">
            <Clock className="h-3.5 w-3.5 mr-1.5" />
            <span>{duration}</span>
          </div>
        )}
        
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <Info className="h-3.5 w-3.5" />
              <span className="sr-only md:not-sr-only text-sm">Session Info</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="max-w-xs">
            <div className="text-sm">
              <p className="font-medium mb-1">Session Participants:</p>
              <p className="text-muted-foreground">Therapist: {therapistName}</p>
              <p className="text-muted-foreground">Patient: {patientName}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default SessionHeader;
