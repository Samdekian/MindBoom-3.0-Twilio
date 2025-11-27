
import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface SessionLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Modern full-screen session layout that maximizes screen real estate
 * Provides responsive grid system for optimal video positioning
 */
const SessionLayout: React.FC<SessionLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      "h-screen w-full overflow-hidden bg-gray-900",
      "flex flex-col",
      // Remove any default padding/margins for full viewport utilization
      "p-0 m-0",
      className
    )}>
      <div className={cn(
        "flex-1 relative",
        // Responsive grid system
        isMobile 
          ? "flex flex-col" 
          : "grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5"
      )}>
        {children}
      </div>
    </div>
  );
};

export default SessionLayout;
