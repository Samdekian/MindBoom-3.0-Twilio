
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Settings, 
  Clock,
  Users,
  Calendar,
  AlertCircle
} from "lucide-react";

interface VideoSessionInfoProps {
  appointmentDetails: {
    title: string;
    patient_id: string;
    therapist_id: string;
    recording_consent?: boolean | null;
  };
  isInSession: boolean;
  waitingRoomActive: boolean;
  isRecording: boolean;
  deviceSettingsOpen: boolean;
  setDeviceSettingsOpen: (open: boolean) => void;
  videoState: {
    isVideoEnabled: boolean;
    isAudioEnabled: boolean;
    isScreenSharing: boolean;
    isRecording: boolean;
    isChatOpen: boolean;
  };
  devices: any;
  changeDevice: (deviceId: string, deviceType: string) => Promise<void>;
  testDevices: () => Promise<boolean>;
  formatSessionDuration: (seconds: number) => string;
}

const VideoSessionInfo: React.FC<VideoSessionInfoProps> = ({
  appointmentDetails,
  isInSession,
  waitingRoomActive,
  isRecording,
  deviceSettingsOpen,
  setDeviceSettingsOpen,
  videoState,
  devices,
  changeDevice,
  testDevices,
  formatSessionDuration
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <CardTitle className="text-lg">{appointmentDetails.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={isInSession ? "default" : "secondary"}>
                  {isInSession ? "In Session" : "Not Started"}
                </Badge>
                {waitingRoomActive && (
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    Waiting Room
                  </Badge>
                )}
                {isRecording && (
                  <Badge variant="destructive">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-1" />
                    Recording
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isInSession && (
              <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{formatSessionDuration(0)}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-1">
              {videoState.isVideoEnabled ? (
                <Video className="h-4 w-4 text-green-600" />
              ) : (
                <VideoOff className="h-4 w-4 text-red-600" />
              )}
              {videoState.isAudioEnabled ? (
                <Mic className="h-4 w-4 text-green-600" />
              ) : (
                <MicOff className="h-4 w-4 text-red-600" />
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeviceSettingsOpen(!deviceSettingsOpen)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!appointmentDetails.recording_consent && (
        <CardContent className="pt-0">
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Recording consent not provided. Session will not be recorded.
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default VideoSessionInfo;
