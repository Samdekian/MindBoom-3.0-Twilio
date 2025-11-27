
import React from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyAppointmentsProps {
  isTherapist: boolean;
  onSchedule: () => void;
}

const EmptyAppointments: React.FC<EmptyAppointmentsProps> = ({ isTherapist, onSchedule }) => {
  return (
    <div className="text-center py-6">
      <CalendarClock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
      <p className="text-muted-foreground">No upcoming appointments</p>
      {!isTherapist && (
        <Button variant="outline" size="sm" className="mt-2" onClick={onSchedule}>
          Schedule your first session
        </Button>
      )}
    </div>
  );
};

export default EmptyAppointments;
