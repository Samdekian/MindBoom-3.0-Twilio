
import React from "react";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

export interface EnhancedLoadingStateProps {
  text?: string;
  className?: string;
  fullscreen?: boolean;
  showConnectionStatus?: boolean;
}

export const EnhancedLoadingState = ({
  text = "Loading...",
  className,
  fullscreen = false,
  showConnectionStatus = true,
}: EnhancedLoadingStateProps) => {
  const { isOnline, supabaseConnected, hasConnection } = useConnectionStatus();

  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-4",
    fullscreen ? "min-h-screen fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "py-6",
    className
  );

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
      
      {showConnectionStatus && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span>
            {!isOnline 
              ? "No internet connection" 
              : supabaseConnected === false 
                ? "Database connection issues"
                : hasConnection 
                  ? "Connected" 
                  : "Checking connection..."
            }
          </span>
        </div>
      )}
      
      {!hasConnection && (
        <p className="text-xs text-muted-foreground max-w-md text-center">
          If this persists, please check your internet connection and try refreshing the page.
        </p>
      )}
    </div>
  );
};
