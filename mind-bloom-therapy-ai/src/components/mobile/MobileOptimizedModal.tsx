import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileOptimizedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  fullScreen?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export const MobileOptimizedModal: React.FC<MobileOptimizedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  fullScreen,
  showCloseButton = true,
  className
}) => {
  const isMobile = useIsMobile();
  const shouldBeFullScreen = fullScreen || isMobile;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          // Desktop styling
          !shouldBeFullScreen && "max-w-lg",
          
          // Mobile optimizations
          shouldBeFullScreen && [
            "h-screen max-h-screen w-screen max-w-none",
            "rounded-none border-0",
            "data-[state=open]:slide-in-from-bottom-0",
            "data-[state=closed]:slide-out-to-bottom-0"
          ],
          
          // Common optimizations
          isMobile && [
            "p-0", // Remove default padding on mobile
            "gap-0"
          ],
          
          className
        )}
        // hideCloseButton={isMobile} // Hide default close button on mobile
      >
        {/* Custom mobile header */}
        {isMobile && (title || showCloseButton) && (
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
            {title && (
              <DialogTitle className="text-lg font-semibold truncate">
                {title}
              </DialogTitle>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 flex-shrink-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </DialogHeader>
        )}

        {/* Desktop header */}
        {!isMobile && title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        )}

        {/* Content */}
        <div
          className={cn(
            "flex-1 overflow-auto",
            isMobile ? "p-4" : "p-0",
            shouldBeFullScreen && "pb-safe" // Add safe area padding on mobile
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Hook for managing mobile modal state
export const useMobileModal = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen);
  const isMobile = useIsMobile();

  const open = React.useCallback(() => {
    setIsOpen(true);
    
    // Prevent body scroll on mobile when modal is open
    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }
  }, [isMobile]);

  const close = React.useCallback(() => {
    setIsOpen(false);
    
    // Restore body scroll
    if (isMobile) {
      document.body.style.overflow = '';
    }
  }, [isMobile]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (isMobile) {
        document.body.style.overflow = '';
      }
    };
  }, [isMobile]);

  return {
    isOpen,
    open,
    close,
    toggle: () => isOpen ? close() : open()
  };
};