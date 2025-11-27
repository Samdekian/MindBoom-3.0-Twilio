
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, Mic, Video, Monitor } from "lucide-react";

interface DeviceCheckSectionProps {
  deviceChecklist: {
    camera: boolean;
    microphone: boolean;
    speaker: boolean;
  };
  updateDeviceChecklist: (key: "camera" | "microphone" | "speaker", value: boolean) => void;
  runDeviceTests: () => Promise<void>;
  isLoading: boolean;
}

const DeviceCheckSection: React.FC<DeviceCheckSectionProps> = ({
  deviceChecklist,
  updateDeviceChecklist,
  runDeviceTests,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Device Check</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant={deviceChecklist.camera ? "default" : "outline"} 
          className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
          onClick={() => updateDeviceChecklist("camera", !deviceChecklist.camera)}
        >
          <Video className="h-8 w-8" />
          <span>Camera</span>
          {deviceChecklist.camera && <Check className="h-4 w-4 text-white" />}
        </Button>
        
        <Button 
          variant={deviceChecklist.microphone ? "default" : "outline"} 
          className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
          onClick={() => updateDeviceChecklist("microphone", !deviceChecklist.microphone)}
        >
          <Mic className="h-8 w-8" />
          <span>Microphone</span>
          {deviceChecklist.microphone && <Check className="h-4 w-4 text-white" />}
        </Button>
        
        <Button 
          variant="secondary"
          className="h-auto py-6 flex flex-col items-center justify-center space-y-2"
          onClick={runDeviceTests}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <Monitor className="h-8 w-8" />
          )}
          <span>Test Devices</span>
        </Button>
      </div>
    </div>
  );
};

export default DeviceCheckSection;
