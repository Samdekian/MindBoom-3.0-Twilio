
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VideoBlurLevel } from "@/hooks/video-conference/types";

interface VideoEffectsProps {
  blurEnabled: boolean;
  blurLevel: VideoBlurLevel;
  toggleBlur: () => Promise<boolean>;
  updateBlurAmount: (amount: number) => Promise<boolean>;
}

interface SessionSidebarProps {
  sessionId: string;
  videoEnabled: boolean;
  audioEnabled: boolean;
  screenShareEnabled: boolean;
  toggleVideo: () => Promise<boolean>;
  toggleAudio: () => Promise<boolean>;
  toggleScreenShare: () => Promise<boolean>;
  toggleRecording: () => Promise<boolean>;
  videoEffectProps: VideoEffectsProps;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
  sessionId,
  videoEnabled,
  audioEnabled,
  screenShareEnabled,
  toggleVideo,
  toggleAudio,
  toggleScreenShare,
  toggleRecording,
  videoEffectProps,
}) => {
  const [activeTab, setActiveTab] = useState("controls");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleVideo = async () => {
    setIsLoading(true);
    await toggleVideo();
    setIsLoading(false);
  };

  const handleToggleAudio = async () => {
    setIsLoading(true);
    await toggleAudio();
    setIsLoading(false);
  };

  const handleToggleScreenShare = async () => {
    setIsLoading(true);
    await toggleScreenShare();
    setIsLoading(false);
  };

  const handleToggleRecording = async () => {
    setIsLoading(true);
    await toggleRecording();
    setIsLoading(false);
  };

  const handleToggleBlur = async () => {
    setIsLoading(true);
    await videoEffectProps.toggleBlur();
    setIsLoading(false);
  };

  const handleBlurAmountChange = async (value: number[]) => {
    const blurLevel = value[0] as VideoBlurLevel;
    await videoEffectProps.updateBlurAmount(blurLevel);
  };

  return (
    <div className="w-64 border-l bg-background p-4 flex flex-col h-full">
      <Tabs defaultValue="controls" className="flex-grow">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="controls" onClick={() => setActiveTab("controls")}>
            Controls
          </TabsTrigger>
          <TabsTrigger value="effects" onClick={() => setActiveTab("effects")}>
            Effects
          </TabsTrigger>
          <TabsTrigger value="info" onClick={() => setActiveTab("info")}>
            Info
          </TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3 text-sm">Media Controls</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="video-toggle" className="flex-1">
                  Camera
                </Label>
                <Switch
                  id="video-toggle"
                  checked={videoEnabled}
                  onCheckedChange={handleToggleVideo}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="audio-toggle" className="flex-1">
                  Microphone
                </Label>
                <Switch
                  id="audio-toggle"
                  checked={audioEnabled}
                  onCheckedChange={handleToggleAudio}
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-toggle" className="flex-1">
                  Screen Share
                </Label>
                <Switch
                  id="screen-toggle"
                  checked={screenShareEnabled}
                  onCheckedChange={handleToggleScreenShare}
                  disabled={isLoading}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="effects" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3 text-sm">Video Effects</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="blur-toggle" className="flex-1">
                  Background Blur
                </Label>
                <Switch
                  id="blur-toggle"
                  checked={videoEffectProps.blurEnabled}
                  onCheckedChange={handleToggleBlur}
                  disabled={isLoading}
                />
              </div>

              {videoEffectProps.blurEnabled && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="blur-amount" className="text-xs">
                      Blur Intensity
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {videoEffectProps.blurLevel}
                    </span>
                  </div>
                  <Slider
                    id="blur-amount"
                    defaultValue={[videoEffectProps.blurLevel]}
                    min={0}
                    max={10}
                    step={1}
                    onValueChange={handleBlurAmountChange}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <Card className="p-4">
            <h3 className="font-medium mb-3 text-sm">Session Information</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">ID:</div>
                <div className="col-span-2 truncate">{sessionId}</div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <div className="text-muted-foreground">Status:</div>
                <div className="col-span-2">
                  <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionSidebar;
