
import React from 'react';
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles } from 'lucide-react';
import { VideoBlurLevel } from '@/hooks/video-conference/types';

interface VideoEffectsControlsProps {
  blurEnabled: boolean;
  blurLevel: VideoBlurLevel;
  toggleBlur: () => Promise<boolean>;
  updateBlurAmount: (amount: number) => Promise<boolean>;
}

const VideoEffectsControls: React.FC<VideoEffectsControlsProps> = ({
  blurEnabled,
  blurLevel,
  toggleBlur,
  updateBlurAmount
}) => {
  const handleBlurToggle = async () => {
    await toggleBlur();
  };

  const handleBlurLevelChange = async (value: number[]) => {
    await updateBlurAmount(value[0]);
  };

  return (
    <div className="space-y-4" data-testid="video-effects-controls">
      {/* Background blur toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Label htmlFor="blur-toggle" className="text-sm">Background Blur</Label>
          <Sparkles className="h-4 w-4 text-blue-400" aria-hidden="true" />
        </div>
        <Switch
          id="blur-toggle"
          checked={blurEnabled}
          onCheckedChange={handleBlurToggle}
          aria-label="Toggle background blur"
        />
      </div>

      {/* Blur intensity slider - only visible when blur is enabled */}
      {blurEnabled && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="blur-intensity" className="text-xs text-gray-400">Blur Intensity</Label>
            <span className="text-xs text-gray-400">{blurLevel}/10</span>
          </div>
          <Slider
            id="blur-intensity"
            defaultValue={[blurLevel]}
            max={10}
            step={1}
            onValueChange={handleBlurLevelChange}
            aria-label="Adjust blur intensity"
            className="my-2" 
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Subtle</span>
            <span>Strong</span>
          </div>
        </div>
      )}

      {/* High contrast mode for accessibility */}
      <div className="flex items-center justify-between pt-2">
        <Label htmlFor="high-contrast" className="text-sm">High Contrast Mode</Label>
        <Switch
          id="high-contrast"
          aria-label="Toggle high contrast mode"
        />
      </div>
    </div>
  );
};

export default VideoEffectsControls;
