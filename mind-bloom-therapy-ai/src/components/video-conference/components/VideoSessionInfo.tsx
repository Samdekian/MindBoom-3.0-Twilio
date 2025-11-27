
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import type { VideoDevices, VideoSessionState } from "@/types/video-session";
import DeviceSettings from "../DeviceSettings";
import SessionStatus from "./SessionStatus";
import SessionDuration from "./SessionDuration";

interface VideoSessionInfoProps {
  appointmentDetails: any;
  isInSession: boolean;
  waitingRoomActive: boolean;
  isRecording: boolean;
  deviceSettingsOpen: boolean;
  setDeviceSettingsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  videoState: VideoSessionState;
  devices: VideoDevices;
  changeDevice: (type: "camera" | "microphone" | "speaker", deviceId: string) => Promise<void>;
  testDevices: () => Promise<boolean>;
  formatSessionDuration: () => string;
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
  formatSessionDuration,
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between py-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">{appointmentDetails.title || "Video Session"}</h3>
          <SessionStatus
            connectionState={videoState.connectionQuality}
            isInSession={isInSession}
            waitingRoomActive={waitingRoomActive}
          />
          {isInSession && (
            <SessionDuration formatSessionDuration={formatSessionDuration} />
          )}
          {isRecording && (
            <div className="flex items-center">
              <span className="relative flex h-3 w-3 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-sm font-medium text-red-500">Recording</span>
            </div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeviceSettingsOpen(!deviceSettingsOpen)}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </CardHeader>

      {deviceSettingsOpen && (
        <CardContent>
          <DeviceSettings
            devices={devices}
            selectedCamera={videoState.selectedCamera}
            selectedMicrophone={videoState.selectedMicrophone}
            selectedSpeaker={videoState.selectedSpeaker}
            onChangeDevice={changeDevice}
            onTestDevices={testDevices}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default VideoSessionInfo;
