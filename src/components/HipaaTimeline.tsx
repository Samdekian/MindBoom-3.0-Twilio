
import React from "react";
import { cn } from "@/lib/utils";

export interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({ children, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {children}
    </div>
  );
};

export interface TimelineItemProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ children, className }) => {
  return (
    <div className={cn("flex", className)}>
      {children}
    </div>
  );
};

export interface TimelineSeparatorProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineSeparator: React.FC<TimelineSeparatorProps> = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col items-center mr-4", className)}>
      {children}
    </div>
  );
};

export interface TimelineDotProps {
  children?: React.ReactNode;
  className?: string;
}

export const TimelineDot: React.FC<TimelineDotProps> = ({ children, className }) => {
  return (
    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white", className)}>
      {children}
    </div>
  );
};

export interface TimelineConnectorProps {
  className?: string;
}

export const TimelineConnector: React.FC<TimelineConnectorProps> = ({ className }) => {
  return (
    <div className={cn("w-1 bg-gray-200 flex-grow my-2", className)}></div>
  );
};

export interface TimelineContentProps {
  children: React.ReactNode;
  className?: string;
}

export const TimelineContent: React.FC<TimelineContentProps> = ({ children, className }) => {
  return (
    <div className={cn("pt-1 pb-8", className)}>
      {children}
    </div>
  );
};
