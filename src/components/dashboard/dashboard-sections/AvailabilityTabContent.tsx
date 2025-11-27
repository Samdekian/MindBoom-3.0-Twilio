
import React from "react";
import TherapistAvailability from "@/components/dashboard/TherapistAvailability";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

/**
 * AvailabilityTabContent Component
 * 
 * This component renders the availability management interface for therapists.
 * It provides controls for setting recurring availability slots, integrating
 * with external calendars, and managing appointment scheduling preferences.
 * 
 * This tab is only relevant for therapists and will redirect others.
 */
const AvailabilityTabContent: React.FC = () => {
  return (
    <div className="space-y-6">
      <Alert className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700">Availability Management</AlertTitle>
        <AlertDescription className="text-blue-600">
          Configure when you're available to see patients. These settings will be used
          when patients book appointments with you.
        </AlertDescription>
      </Alert>
      
      <Card>
        <CardHeader>
          <CardTitle>My Availability Settings</CardTitle>
          <CardDescription>
            Set your recurring availability and manage calendar integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TherapistAvailability />
        </CardContent>
      </Card>
    </div>
  );
};

export default AvailabilityTabContent;
