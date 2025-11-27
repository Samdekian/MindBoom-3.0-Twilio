
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Video, Mic, Volume2 } from "lucide-react";
import type { VideoDevices } from "@/types/video-session";

interface DeviceSettingsProps {
  devices: VideoDevices;
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;
  onChangeDevice: (type: "camera" | "microphone" | "speaker", deviceId: string) => Promise<void>;
  onTestDevices: () => Promise<boolean>;
}

const DeviceSettings: React.FC<DeviceSettingsProps> = ({
  devices,
  selectedCamera,
  selectedMicrophone,
  selectedSpeaker,
  onChangeDevice,
  onTestDevices
}) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await onTestDevices();
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Camera</h4>
          </div>
          <Select
            value={selectedCamera || ""}
            onValueChange={(value) => onChangeDevice("camera", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a camera" />
            </SelectTrigger>
            <SelectContent>
              {devices.cameras.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Microphone</h4>
          </div>
          <Select
            value={selectedMicrophone || ""}
            onValueChange={(value) => onChangeDevice("microphone", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a microphone" />
            </SelectTrigger>
            <SelectContent>
              {devices.microphones.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Speaker</h4>
          </div>
          <Select
            value={selectedSpeaker || ""}
            onValueChange={(value) => onChangeDevice("speaker", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a speaker" />
            </SelectTrigger>
            <SelectContent>
              {devices.speakers.map((device) => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${device.deviceId.slice(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleTest} 
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Devices"
            )}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default DeviceSettings;
