import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Grid3X3, 
  Focus, 
  PictureInPicture,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = 'grid' | 'spotlight' | 'pip' | 'sidebar';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  participantCount: number;
}

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  currentMode,
  onModeChange,
  participantCount
}) => {
  const modes = [
    {
      id: 'grid' as ViewMode,
      label: 'Grid View',
      icon: Grid3X3,
      description: 'Equal sized video tiles',
      disabled: participantCount < 2
    },
    {
      id: 'spotlight' as ViewMode,
      label: 'Spotlight',
      icon: Focus,
      description: 'Focus on active speaker',
      disabled: participantCount < 2
    },
    {
      id: 'pip' as ViewMode,
      label: 'Picture-in-Picture',
      icon: PictureInPicture,
      description: 'Small overlay window',
      disabled: false
    },
    {
      id: 'sidebar' as ViewMode,
      label: 'Sidebar',
      icon: Users,
      description: 'Participants on the side',
      disabled: participantCount < 2
    }
  ];

  return (
    <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm rounded-lg p-1">
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <Button
            key={mode.id}
            variant={currentMode === mode.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onModeChange(mode.id)}
            disabled={mode.disabled}
            className={cn(
              "h-8 w-8 p-0",
              currentMode === mode.id && "bg-white/20 text-white",
              !mode.disabled && "hover:bg-white/10 text-white/80 hover:text-white"
            )}
            title={`${mode.label} - ${mode.description}`}
          >
            <Icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
};

export default ViewModeSelector;