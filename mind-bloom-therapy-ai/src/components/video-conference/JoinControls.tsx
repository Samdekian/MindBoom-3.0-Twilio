
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import DeviceSettings from "./DeviceSettings";
import type { VideoDevices } from "@/types/video-session";
import { Loader2, Settings, Video } from "lucide-react";
import { Card } from "@/components/ui/card";

interface VideoState {
  selectedCamera: string | null;
  selectedMicrophone: string | null;
  selectedSpeaker: string | null;
}

interface JoinControlsProps {
  onJoinSession: () => Promise<void>;
  devices: VideoDevices;
  videoState: VideoState;
  changeDevice: (type: "camera" | "microphone" | "speaker", deviceId: string) => Promise<void>;
  testDevices: () => Promise<boolean>;
}

const JoinControls: React.FC<JoinControlsProps> = ({
  onJoinSession, devices, videoState, changeDevice, testDevices
}) => {
  const [isJoining, setIsJoining] = useState(false);
  
  const handleJoin = async () => {
    setIsJoining(true);
    try {
      await onJoinSession();
    } finally {
      setIsJoining(false);
    }
  };
  
  return (
    <div className="h-full flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Video className="h-10 w-10 text-primary" />
          </div>
        </div>
        
        <div>
          <h3 className="text-2xl font-semibold mb-2">Ready to join your session?</h3>
          <p className="text-muted-foreground">
            Make sure your camera and microphone are working properly before joining.
          </p>
        </div>
        
        <div className="space-x-2">
          <Button 
            onClick={handleJoin} 
            size="lg" 
            disabled={isJoining} 
            className="px-6"
          >
            {isJoining ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Joining...
              </>
            ) : (
              <>Join Session</>
            )}
          </Button>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Settings className="mr-2 h-4 w-4" />
                Device Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Device Settings</DialogTitle>
                <DialogDescription>
                  Configure your camera, microphone, and speaker before joining.
                </DialogDescription>
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
      </Card>
    </div>
  );
};

export default JoinControls;
