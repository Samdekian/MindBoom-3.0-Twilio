
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, formatDistanceStrict } from "date-fns";
import { Clock, Video, FileText, Download, Share2 } from "lucide-react";

interface SessionSummaryCardProps {
  appointmentId: string;
  appointmentTitle: string;
  startTime: string;
  endTime: string;
  durationInSeconds: number;
  participantNames: string[];
  wasRecorded: boolean;
  recordingUrl?: string;
  notes?: string;
  onDownload?: () => void;
  onViewNotes?: () => void;
  onShare?: () => void;
}

const SessionSummaryCard: React.FC<SessionSummaryCardProps> = ({
  appointmentId,
  appointmentTitle,
  startTime,
  endTime,
  durationInSeconds,
  participantNames,
  wasRecorded,
  recordingUrl,
  notes,
  onDownload,
  onViewNotes,
  onShare
}) => {
  const formatTime = (timeString: string) => {
    try {
      return format(new Date(timeString), "h:mm a");
    } catch (e) {
      return "Invalid time";
    }
  };
  
  const formatDate = (timeString: string) => {
    try {
      return format(new Date(timeString), "MMMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{appointmentTitle || "Session Summary"}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="border-b pb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium">{formatDate(startTime)}</span>
          </div>
          
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Time</span>
            <span className="font-medium">{formatTime(startTime)} - {formatTime(endTime)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duration</span>
            <span className="font-medium flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDuration(durationInSeconds)}
            </span>
          </div>
        </div>
        
        <div className="border-b pb-3">
          <h4 className="text-sm font-semibold mb-2">Participants</h4>
          <ul className="text-sm space-y-1">
            {participantNames.map((name, index) => (
              <li key={index} className="flex items-center">
                <span className="text-muted-foreground mr-2">•</span>
                <span>{name}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {(wasRecorded || notes) && (
          <div>
            <h4 className="text-sm font-semibold mb-2">Resources</h4>
            <div className="space-y-2">
              {wasRecorded && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <Video className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>Session Recording</span>
                  </div>
                  {recordingUrl && onDownload && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={onDownload}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
              
              {notes && (
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <span>Session Notes</span>
                  </div>
                  {onViewNotes && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={onViewNotes}
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {onShare && (
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={onShare}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share Summary
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default SessionSummaryCard;
