
import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConnectionQualityBadgeProps {
  quality: "excellent" | "good" | "poor" | "disconnected";
}

const ConnectionQualityBadge: React.FC<ConnectionQualityBadgeProps> = ({ quality }) => {
  return (
    <div className="mx-2">
      <Badge 
        variant="outline" 
        className={cn(
          "px-2 py-1 text-xs font-medium",
          quality === "excellent" && "bg-green-500/20 text-green-500",
          quality === "good" && "bg-blue-500/20 text-blue-500",
          quality === "poor" && "bg-amber-500/20 text-amber-500",
          quality === "disconnected" && "bg-rose-500/20 text-rose-500 animate-pulse"
        )}
      >
        {quality.charAt(0).toUpperCase() + quality.slice(1)}
      </Badge>
    </div>
  );
};

export default ConnectionQualityBadge;
