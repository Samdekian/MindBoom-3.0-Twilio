import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface MobileOptimizedButtonProps extends ButtonProps {
  touchOptimized?: boolean;
  hapticFeedback?: boolean;
}

export const MobileOptimizedButton = React.forwardRef<
  HTMLButtonElement,
  MobileOptimizedButtonProps
>(({ 
  className, 
  touchOptimized = true, 
  hapticFeedback = true,
  children, 
  onClick, 
  ...props 
}, ref) => {
  const isMobile = useIsMobile();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // Add haptic feedback on mobile devices
    if (isMobile && hapticFeedback && 'vibrate' in navigator) {
      navigator.vibrate(10); // Short haptic feedback
    }

    if (onClick) {
      onClick(event);
    }
  };

  return (
    <Button
      ref={ref}
      className={cn(
        // Base mobile optimizations
        isMobile && touchOptimized && [
          "min-h-[44px]", // iOS HIG minimum touch target
          "min-w-[44px]", 
          "touch-manipulation", // Optimize touch handling
          "select-none", // Prevent text selection on touch
          "active:scale-95", // Visual feedback on touch
          "transition-transform duration-150",
        ],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Button>
  );
});

MobileOptimizedButton.displayName = "MobileOptimizedButton";