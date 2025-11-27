
import React from "react";
import ProgressMetrics from "@/components/dashboard/ProgressMetrics";
import MoodTracker from "@/components/dashboard/MoodTracker";

const ProgressTabContent: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <ProgressMetrics />
      </div>
      <div>
        <MoodTracker />
      </div>
    </div>
  );
};

export default ProgressTabContent;
