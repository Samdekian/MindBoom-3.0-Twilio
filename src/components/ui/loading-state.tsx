
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export interface LoadingStateProps {
  variant?: "spinner" | "skeleton" | "progress";
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
  fullscreen?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const LoadingState = ({
  variant = "spinner",
  size = "md",
  text = "Loading...",
  className,
  fullscreen = false,
  isLoading = true,
  children,
}: LoadingStateProps) => {
  // Return children if not loading
  if (!isLoading) {
    return <>{children}</>;
  }

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const containerClasses = cn(
    "flex flex-col items-center justify-center",
    fullscreen ? "min-h-screen fixed inset-0 bg-background/80 backdrop-blur-sm z-50" : "py-6",
    className
  );

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {variant === "spinner" && (
        <>
          <Loader2 className={cn(sizeClasses[size], "animate-spin text-primary")} />
          {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
        </>
      )}

      {variant === "skeleton" && (
        <div className="w-full space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      )}

      {variant === "progress" && (
        <div className="w-full">
          <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
            <div className="h-full bg-primary animate-pulse origin-left" style={{ width: "75%" }} />
          </div>
          {text && <p className="mt-2 text-xs text-center text-muted-foreground">{text}</p>}
        </div>
      )}
    </div>
  );
};
