
import React from 'react';
import DashboardHeader from './DashboardHeader';
import TodaysSessionsCard from './TodaysSessionsCard';
import TreatmentPlanningWidget from './TreatmentPlanningWidget';
import AvailabilityWidget from './AvailabilityWidget';
import CalendarWidget from './CalendarWidget';
import DailyOverview from './DailyOverview';
import { useMigrationTracking } from "@/utils/migration/migration-helpers";

const TherapistOverview: React.FC = () => {
  // Track migration
  useMigrationTracking('TherapistOverview', 'useAuthRBAC');

  return (
    <div className="space-y-6">
      <DashboardHeader />
      
      <DailyOverview />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodaysSessionsCard />
        <TreatmentPlanningWidget />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AvailabilityWidget />
        <CalendarWidget />
      </div>
    </div>
  );
};

export default TherapistOverview;
