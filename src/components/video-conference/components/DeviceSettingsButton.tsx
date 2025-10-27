
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import DeviceSettings from "../DeviceSettings";
import { VideoSessionState, VideoDevices } from "@/contexts/VideoSessionContext";

interface DeviceSettingsButtonProps {
  deviceSettingsOpen: boolean;
  setDeviceSettingsOpen: (open: boolean) => void;
  devices: VideoDevices;
  videoState: VideoSessionState;
  changeDevice: (type: "camera" | "microphone" | "speaker", deviceId: string) => Promise<void>;
  testDevices: () => Promise<boolean>;
}

const DeviceSettingsButton: React.FC<DeviceSettingsButtonProps> = ({
  deviceSettingsOpen,
  setDeviceSettingsOpen,
  devices,
  videoState,
  changeDevice,
  testDevices,
}) => {
  return (
    <Dialog open={deviceSettingsOpen} onOpenChange={setDeviceSettingsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Device Settings</DialogTitle>
          <DialogDescription>Adjust your input and output devices.</DialogDescription>
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
  );
};

export default DeviceSettingsButton;
