import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Grid3x3, 
  User, 
  Sidebar, 
  Maximize2, 
  Minimize2,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutControlsProps {
  currentLayout: "grid" | "speaker" | "sidebar";
  onLayoutChange: (layout: "grid" | "speaker" | "sidebar") => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  participantCount: number;
  className?: string;
}

export const LayoutControls: React.FC<LayoutControlsProps> = ({
  currentLayout,
  onLayoutChange,
  isFullscreen = false,
  onToggleFullscreen,
  participantCount,
  className
}) => {
  const layouts = [
    {
      key: "grid" as const,
      icon: Grid3x3,
      label: "Grid View",
      description: "Equal-sized participants",
      available: true
    },
    {
      key: "speaker" as const,
      icon: User,
      label: "Speaker View", 
      description: "Focus on active speaker",
      available: participantCount > 1
    },
    {
      key: "sidebar" as const,
      icon: Sidebar,
      label: "Sidebar View",
      description: "Main view with sidebar",
      available: participantCount > 1
    }
  ];

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Layout selection buttons */}
      <div className="flex items-center bg-muted rounded-lg p-1">
        {layouts.map((layout) => (
          <Tooltip key={layout.key}>
            <TooltipTrigger asChild>
              <Button
                variant={currentLayout === layout.key ? "default" : "ghost"}
                size="sm"
                onClick={() => onLayoutChange(layout.key)}
                disabled={!layout.available}
                className={cn(
                  "h-8 px-2",
                  currentLayout === layout.key && "shadow-sm"
                )}
              >
                <layout.icon className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-medium">{layout.label}</p>
                <p className="text-xs text-muted-foreground">{layout.description}</p>
                {!layout.available && (
                  <p className="text-xs text-amber-400">Requires multiple participants</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
      
      {/* Fullscreen toggle */}
      {onToggleFullscreen && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFullscreen}
              className="h-8 px-2"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* Participant count indicator */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
        <Users className="w-4 h-4" />
        <span>{participantCount}</span>
      </div>
    </div>
  );
};