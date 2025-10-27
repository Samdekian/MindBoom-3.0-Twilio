
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface VideoControlButtonProps {
  active: boolean;
  onClick: () => void;
  tooltip: string;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  activeColorClass?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const VideoControlButton: React.FC<VideoControlButtonProps> = ({
  active,
  onClick,
  tooltip,
  activeIcon,
  inactiveIcon,
  activeColorClass = "bg-rose-500/20 text-rose-500 hover:bg-rose-500/30 hover:text-rose-500",
  variant = "ghost"
}) => {
  const icon = active ? activeIcon : (inactiveIcon || activeIcon);
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={onClick}
          variant={variant}
          size="icon"
          className={cn(
            "rounded-full",
            active && variant === "ghost" && activeColorClass,
            !active && variant === "ghost" && inactiveIcon && activeColorClass
          )}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default VideoControlButton;
