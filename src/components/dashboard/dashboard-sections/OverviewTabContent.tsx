
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import MoodTracker from "@/components/dashboard/MoodTracker";
import QuickActions from "@/components/dashboard/QuickActions";
import ResourcesWidget from "@/components/dashboard/ResourcesWidget";
import ProgressMetrics from "@/components/dashboard/ProgressMetrics";

interface OverviewTabContentProps {
  isTherapist: boolean;
  isAdmin: boolean;
}

const OverviewTabContent: React.FC<OverviewTabContentProps> = ({ isTherapist, isAdmin }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Main content - 2/3 width on desktop */}
      <div className="md:col-span-2 space-y-6">
        <UpcomingAppointments />
        {!isTherapist && !isAdmin && <ProgressMetrics />}
        <ResourcesWidget />
      </div>
      
      {/* Sidebar - 1/3 width on desktop */}
      <div className="space-y-6">
        {!isTherapist && !isAdmin && <MoodTracker />}
        <QuickActions />
      </div>
    </div>
  );
};

export default OverviewTabContent;
