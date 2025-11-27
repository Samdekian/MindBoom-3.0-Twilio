
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface BookingStep {
  id: string;
  label: string;
  completed: boolean;
  active: boolean;
}

interface BookingProgressIndicatorProps {
  steps: BookingStep[];
  currentStepIndex: number;
  className?: string;
  variant?: 'pills' | 'line' | 'circles';
}

const BookingProgressIndicator: React.FC<BookingProgressIndicatorProps> = ({
  steps,
  currentStepIndex,
  className,
  variant = 'pills'
}) => {
  
  if (variant === 'line') {
    return (
      <div className={cn("mb-6", className)}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium transition-all duration-200",
                  step.completed ? "bg-primary text-primary-foreground" : 
                    step.active ? "bg-primary/20 text-primary border-2 border-primary" : 
                      "bg-gray-100 text-gray-400"
                )}>
                  {step.completed ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <div className="text-xs mt-1 font-medium text-center">
                  <span className={cn(
                    "transition-colors duration-200",
                    step.active || step.completed ? "text-primary" : "text-gray-500"
                  )}>
                    {step.label}
                  </span>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className="h-0.5 bg-gray-200 relative">
                    <div 
                      className="absolute top-0 left-0 h-0.5 bg-primary transition-all duration-500"
                      style={{ 
                        width: `${index < currentStepIndex ? 100 : index === currentStepIndex ? 50 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (variant === 'circles') {
    return (
      <div className={cn("flex justify-between mb-6", className)}>
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className="flex flex-col items-center"
          >
            <div 
              className={cn(
                "h-3 w-3 rounded-full transition-all duration-300",
                step.completed ? "bg-primary scale-125" : 
                  step.active ? "bg-primary/50 scale-110" : 
                    "bg-gray-300"
              )}
            />
            <span className={cn(
              "text-xs mt-1 transition-colors duration-300",
              step.active ? "text-primary font-medium" : 
                step.completed ? "text-primary" : 
                  "text-gray-500"
            )}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    );
  }
  
  // Default pills variant
  return (
    <div className={cn("flex mb-6 bg-gray-100 rounded-full p-1", className)}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "flex-1 text-center py-1.5 px-2 text-sm rounded-full transition-all duration-300",
            step.active && "bg-primary text-white font-medium",
            step.completed && !step.active && "text-primary font-medium",
            (!step.active && !step.completed) && "text-gray-500"
          )}
        >
          <span className="flex items-center justify-center">
            {step.completed ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <span className="inline-flex items-center justify-center rounded-full h-5 w-5 mr-1.5 text-xs">
                {index + 1}
              </span>
            )}
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BookingProgressIndicator;
