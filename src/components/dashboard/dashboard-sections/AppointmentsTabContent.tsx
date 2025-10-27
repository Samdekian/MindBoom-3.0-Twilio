
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AppointmentBooking from "@/components/dashboard/AppointmentBooking";
import UpcomingAppointments from "@/components/dashboard/UpcomingAppointments";
import TherapistAvailability from "@/components/dashboard/TherapistAvailability";

interface AppointmentsTabContentProps {
  isTherapist: boolean;
}

const AppointmentsTabContent: React.FC<AppointmentsTabContentProps> = ({ isTherapist }) => {
  if (isTherapist) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Calendar Integration</CardTitle>
          <CardDescription>Manage your calendar and availability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <TherapistAvailability />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <AppointmentBooking />
      <UpcomingAppointments />
    </div>
  );
};

export default AppointmentsTabContent;
