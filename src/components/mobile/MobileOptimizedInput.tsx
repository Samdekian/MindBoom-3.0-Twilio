import React from "react";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface MobileOptimizedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  preventZoom?: boolean;
  touchOptimized?: boolean;
}

export const MobileOptimizedInput = React.forwardRef<
  HTMLInputElement,
  MobileOptimizedInputProps
>(({ 
  className, 
  preventZoom = true, 
  touchOptimized = true,
  ...props 
}, ref) => {
  const isMobile = useIsMobile();

  return (
    <Input
      ref={ref}
      className={cn(
        // Mobile-first optimizations
        isMobile && touchOptimized && [
          "min-h-[44px]", // iOS HIG minimum touch target
          "touch-manipulation",
          "text-base", // Prevents zoom on iOS when font-size < 16px
        ],
        className
      )}
      style={
        isMobile && preventZoom 
          ? { fontSize: '16px' } // Prevent zoom on iOS
          : undefined
      }
      {...props}
    />
  );
});

MobileOptimizedInput.displayName = "MobileOptimizedInput";