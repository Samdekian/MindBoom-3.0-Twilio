
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import ConnectionStatusOverlay from "./ConnectionStatusOverlay";

interface ResponsiveVideoGridProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localLabel?: string;
  remoteLabel?: string;
  isScreenSharing: boolean;
  isMobileView?: boolean;
  connectionQuality: "excellent" | "good" | "poor" | "disconnected";
  connectionState: 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED' | 'FAILED';
  isInSession: boolean;
  onSwapLayout?: () => void;
  onRetryConnection?: () => void;
  className?: string;
}

const ResponsiveVideoGrid: React.FC<ResponsiveVideoGridProps> = ({
  localVideoRef,
  remoteVideoRef,
  localLabel = "You",
  remoteLabel = "Participant",
  isScreenSharing,
  isMobileView: forceMobileView,
  connectionQuality,
  connectionState,
  isInSession,
  onSwapLayout,
  onRetryConnection,
  className
}) => {
  const isMobile = useIsMobile();
  const mobileView = forceMobileView !== undefined ? forceMobileView : isMobile;
  
  const isDisconnected = connectionQuality === "disconnected";

  // Determine layout based on screen sharing status
  const isVerticalLayout = mobileView || isScreenSharing;

  return (
    <div 
      className={cn(
        "w-full h-full relative", 
        isVerticalLayout ? "flex flex-col gap-2" : "grid grid-cols-2 gap-2",
        className
      )}
    >
      <ConnectionStatusOverlay 
        connectionState={connectionState}
        isInSession={isInSession}
        onRetry={onRetryConnection}
      />
      {/* Remote video (larger when sharing screen) */}
      <div 
        className={cn(
          "relative bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center",
          isScreenSharing && "flex-1"
        )}
      >
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {isDisconnected && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col gap-2">
            <p className="text-red-400 text-lg font-medium">Connection Lost</p>
            <p className="text-white text-sm">Attempting to reconnect...</p>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
          {remoteLabel}{isScreenSharing ? " (Screen)" : ""}
        </div>
      </div>

      {/* Local video (smaller when sharing screen) */}
      <div 
        className={cn(
          "relative bg-slate-900 rounded-lg overflow-hidden",
          isScreenSharing ? "h-32" : (isVerticalLayout ? "h-1/3" : "h-full")
        )}
      >
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">
          {localLabel}
        </div>
        
        {/* Connection quality indicator */}
        <div className={cn(
          "absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium flex items-center gap-1",
          connectionQuality === "excellent" && "bg-green-500/70 text-white",
          connectionQuality === "good" && "bg-blue-500/70 text-white",
          connectionQuality === "poor" && "bg-amber-500/70 text-white",
          connectionQuality === "disconnected" && "bg-red-500/70 text-white animate-pulse"
        )}>
          {connectionQuality === "excellent" && (
            <>
              <span className="w-2 h-2 rounded-full bg-green-300"></span>
              Excellent
            </>
          )}
          {connectionQuality === "good" && (
            <>
              <span className="w-2 h-2 rounded-full bg-blue-300"></span>
              Good
            </>
          )}
          {connectionQuality === "poor" && (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-300"></span>
              Poor
            </>
          )}
          {connectionQuality === "disconnected" && (
            <>
              <span className="w-2 h-2 rounded-full bg-red-300"></span>
              Disconnected
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveVideoGrid;
