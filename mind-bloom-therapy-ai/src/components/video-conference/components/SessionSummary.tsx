
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock, Calendar, Video } from "lucide-react";
import { format, formatDuration, intervalToDuration } from "date-fns";

interface SessionSummaryProps {
  appointmentId: string;
  sessionDuration: number;
  therapistName?: string;
  patientName?: string;
  appointmentTitle?: string;
  appointmentDate?: string;
  isRecorded?: boolean;
  isTherapist: boolean;
  onClose: () => void;
}

const SessionSummary: React.FC<SessionSummaryProps> = ({
  appointmentId,
  sessionDuration,
  therapistName = "Therapist",
  patientName = "Patient",
  appointmentTitle = "Therapy Session",
  appointmentDate,
  isRecorded = false,
  isTherapist,
  onClose
}) => {
  const navigate = useNavigate();
  
  // Format session duration
  const formatSessionDuration = () => {
    const duration = intervalToDuration({ start: 0, end: sessionDuration * 1000 });
    return formatDuration(duration, { format: ['hours', 'minutes', 'seconds'] });
  };
  
  // Format date
  const formattedDate = appointmentDate 
    ? format(new Date(appointmentDate), "EEEE, MMMM d, yyyy")
    : format(new Date(), "EEEE, MMMM d, yyyy");
  
  const handleViewDetails = () => {
    navigate(`/sessions/${appointmentId}`);
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Session Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <Video className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-center">{appointmentTitle}</h3>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex flex-col items-center border rounded-md p-3">
              <Calendar className="h-5 w-5 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-sm font-medium">{formattedDate}</p>
            </div>
            
            <div className="flex flex-col items-center border rounded-md p-3">
              <Clock className="h-5 w-5 mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{formatSessionDuration()}</p>
            </div>
          </div>
          
          <div className="border rounded-md p-3 mt-4">
            <p className="text-sm text-muted-foreground">Participants</p>
            <div className="flex justify-between mt-1">
              <p className="text-sm">Therapist:</p>
              <p className="text-sm font-medium">{therapistName}</p>
            </div>
            <div className="flex justify-between mt-1">
              <p className="text-sm">Patient:</p>
              <p className="text-sm font-medium">{patientName}</p>
            </div>
          </div>
          
          {isRecorded && (
            <div className="border border-blue-200 bg-blue-50 rounded-md p-3">
              <p className="text-sm text-blue-700">
                This session was recorded and will be securely stored according to HIPAA guidelines.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          {isTherapist && (
            <Button 
              onClick={handleViewDetails} 
              className="w-full"
            >
              View Session Details
            </Button>
          )}
          <Button 
            onClick={onClose} 
            variant="outline" 
            className="w-full"
          >
            Close Summary
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SessionSummary;
