
import React from "react";
import { Progress } from "@/components/ui/progress";

interface PreparationProgressProps {
  prepProgress: number;
}

/**
 * PreparationProgress Component
 * 
 * Displays a progress bar for video conference preparation steps
 * 
 * @param {number} prepProgress - The current preparation progress percentage (0-100)
 * @returns {React.ReactElement} A progress bar component
 */
const PreparationProgress: React.FC<PreparationProgressProps> = ({ 
  prepProgress 
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Preparation Progress</span>
        <span className="text-sm font-medium">{prepProgress}%</span>
      </div>
      <Progress
        value={prepProgress}
        className="h-2"
        aria-label="Preparation progress"
        aria-valuenow={prepProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
};

export default PreparationProgress;
