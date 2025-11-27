
import React from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepInstructionsProps {
  instructions: string;
  className?: string;
  icon?: boolean;
}

const StepInstructions: React.FC<StepInstructionsProps> = ({ 
  instructions,
  className,
  icon = true
}) => {
  return (
    <div className={cn(
      "bg-blue-50 text-blue-700 p-3 rounded-md mb-4 text-sm flex items-start gap-2",
      className
    )}>
      {icon && <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />}
      <p>{instructions}</p>
    </div>
  );
};

export default StepInstructions;
