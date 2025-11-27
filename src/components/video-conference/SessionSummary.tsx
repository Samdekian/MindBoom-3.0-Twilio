
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Users, 
  Video,
  FileText,
  Download,
  X
} from "lucide-react";

interface SessionSummaryProps {
  appointmentId: string;
  sessionDuration: number;
  therapistName?: string;
  patientName?: string;
  appointmentTitle: string;
  isRecorded: boolean;
  isTherapist: boolean;
  onClose: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
  appointmentId,
  sessionDuration,
  therapistName,
  patientName,
  appointmentTitle,
  isRecorded,
  isTherapist,
  onClose
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Session Complete</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <h3 className="font-semibold">{appointmentTitle}</h3>
            <p className="text-sm text-muted-foreground">
              Session ended successfully
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Duration</span>
              </div>
              <Badge variant="outline">{formatDuration(sessionDuration)}</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="text-sm">Participants</span>
              </div>
              <div className="text-sm">
                {isTherapist ? patientName || 'Patient' : therapistName || 'Therapist'}
              </div>
            </div>
            
            {isRecorded && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Video className="h-4 w-4" />
                  <span className="text-sm">Recording</span>
                </div>
                <Badge variant="default">Available</Badge>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            {isTherapist && (
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Add Session Notes
              </Button>
            )}
            
            {isRecorded && (
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Recording
              </Button>
            )}
            
            <Button className="w-full" onClick={onClose}>
              Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionSummary;
