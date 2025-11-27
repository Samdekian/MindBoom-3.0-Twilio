
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTabContent from "./OverviewTabContent";
import AppointmentsTabContent from "./AppointmentsTabContent";
import ProgressTabContent from "./ProgressTabContent";
import AvailabilityTabContent from "./AvailabilityTabContent";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import PatientsTabContent from "./PatientsTabContent";
import { useMigrationTracking } from "@/utils/migration/migration-helpers";

interface DashboardTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  isTherapist: boolean;
  isAdmin: boolean;
}

/**
 * DashboardTabs Component
 * 
 * Renders different tab sets based on user role (therapist vs patient).
 * Therapists see availability management while patients see progress tracking.
 * 
 * This component renders role-specific content while maintaining a consistent UI.
 */
const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  isTherapist,
  isAdmin 
}) => {
  const { hasRole } = useAuthRBAC();
  
  // Track migration
  useMigrationTracking('DashboardTabs', 'useAuthRBAC');
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
      <TabsList className={`grid ${isTherapist ? 'grid-cols-4' : 'grid-cols-3'} w-full max-w-md`}>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="appointments">Appointments</TabsTrigger>
        {isTherapist ? (
          <TabsTrigger value="availability">Availability</TabsTrigger>
        ) : (
          <TabsTrigger value="progress">Progress</TabsTrigger>
        )}
        {isTherapist && (
          <TabsTrigger value="patients">Patients</TabsTrigger>
        )}
      </TabsList>
      
      <TabsContent value="overview" className="mt-6">
        <OverviewTabContent isTherapist={isTherapist} isAdmin={isAdmin} />
      </TabsContent>
      
      <TabsContent value="appointments" className="mt-6">
        <AppointmentsTabContent isTherapist={isTherapist} />
      </TabsContent>
      
      <TabsContent value="progress" className="mt-6">
        {!isTherapist && <ProgressTabContent />}
      </TabsContent>
      
      <TabsContent value="availability" className="mt-6">
        {isTherapist && <AvailabilityTabContent />}
      </TabsContent>
      
      <TabsContent value="patients" className="mt-6">
        {isTherapist && <PatientsTabContent />}
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
