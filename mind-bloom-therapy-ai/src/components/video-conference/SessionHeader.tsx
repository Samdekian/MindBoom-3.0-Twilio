
import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import DeviceSettings from "./DeviceSettings";
import type { VideoSessionState, VideoDevices } from "@/types/video-session";

interface SessionHeaderProps {
  title: string;
  isInSession: boolean;
  waitingRoomActive: boolean;
  isRecording: boolean;
  formatSessionDuration: () => string;
  deviceSettingsOpen: boolean;
  setDeviceSettingsOpen: (val: boolean) => void;
  devices: VideoDevices;
  videoState: VideoSessionState;
  changeDevice: (type: "camera" | "microphone" | "speaker", deviceId: string) => Promise<void>;
  testDevices: () => Promise<boolean>;
}

const SessionHeader: React.FC<SessionHeaderProps> = ({
  title,
  isInSession,
  waitingRoomActive,
  isRecording,
  formatSessionDuration,
  deviceSettingsOpen,
  setDeviceSettingsOpen,
  devices,
  videoState,
  changeDevice,
  testDevices
}) => {
  return (
    <CardHeader className="px-4 py-3 border-b">
      <div className="flex justify-between items-center">
        <div>
          <CardTitle className="text-lg">{title || "Therapy Session"}</CardTitle>
          {isInSession && (
            <div className="text-sm text-muted-foreground">
              Duration: {formatSessionDuration()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {waitingRoomActive && (
            <Badge variant="outline" className="bg-amber-500/20 text-amber-500">
              Waiting Room
            </Badge>
          )}
          {isInSession && !waitingRoomActive && (
            <Badge variant="outline" className="bg-green-500/20 text-green-500">
              In Session
            </Badge>
          )}
          {isRecording && (
            <Badge variant="outline" className="bg-red-500/20 text-red-500 animate-pulse">
              Recording
            </Badge>
          )}
          <Dialog open={deviceSettingsOpen} onOpenChange={setDeviceSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Device Settings</DialogTitle>
                <DialogDescription>Manage your camera, microphone, and speaker.</DialogDescription>
              </DialogHeader>
              <DeviceSettings
                devices={devices}
                selectedCamera={videoState.selectedCamera}
                selectedMicrophone={videoState.selectedMicrophone}
                selectedSpeaker={videoState.selectedSpeaker}
                onChangeDevice={changeDevice}
                onTestDevices={testDevices}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </CardHeader>
  );
};

export default SessionHeader;
