
import React from "react";
import { Slider } from "@/components/ui/slider";
import VideoControlButton from "./VideoControlButton";

interface BlurControlsProps {
  blurEnabled: boolean;
  blurAmount: number;
  onToggleBlur: () => void;
  onChangeBlurAmount?: (value: number) => void;
}

const BlurControls: React.FC<BlurControlsProps> = ({
  blurEnabled,
  blurAmount,
  onToggleBlur,
  onChangeBlurAmount
}) => {
  // Custom blur icons
  const BlurEnabledIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M17.75 12a5.75 5.75 0 1 0-11.5 0" />
    </svg>
  );
  
  const BlurDisabledIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M13.5 8.4a4 4 0 0 0-5.7 5.6" />
      <path d="m2 2 20 20" />
    </svg>
  );
  
  return (
    <>
      <VideoControlButton
        active={blurEnabled}
        onClick={onToggleBlur}
        tooltip={blurEnabled ? "Disable blur effect" : "Enable blur effect"}
        activeIcon={<BlurEnabledIcon />}
        inactiveIcon={<BlurDisabledIcon />}
        activeColorClass="bg-purple-500/20 text-purple-500 hover:bg-purple-500/30 hover:text-purple-500"
      />

      {blurEnabled && onChangeBlurAmount && (
        <div className="px-2 w-24 hidden md:block">
          <Slider
            value={[blurAmount]}
            min={1}
            max={10}
            step={1}
            onValueChange={(values) => onChangeBlurAmount(values[0])}
            className="w-full"
          />
        </div>
      )}
    </>
  );
};

export default BlurControls;
