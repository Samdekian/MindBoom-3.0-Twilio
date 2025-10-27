
import React from 'react';
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointments";
import { useAppointments } from "@/hooks/use-appointments";
import { useToast } from "@/hooks/use-toast";

interface AppointmentStatusButtonsProps {
  appointment: Appointment;
}

const AppointmentStatusButtons: React.FC<AppointmentStatusButtonsProps> = ({ 
  appointment 
}) => {
  const { updateAppointmentStatus } = useAppointments();
  const { toast } = useToast();

  const handleStatusChange = async (status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      await updateAppointmentStatus.mutateAsync({ id: appointment.id, status });
      toast({
        title: "Status Updated",
        description: `Appointment ${status} successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
      <Button 
        onClick={() => handleStatusChange('confirmed')} 
        variant="outline" 
        size="sm"
        disabled={appointment.status === 'confirmed'}
      >
        Confirm
      </Button>
      <Button 
        onClick={() => handleStatusChange('cancelled')} 
        variant="outline" 
        size="sm"
        disabled={appointment.status === 'cancelled'}
      >
        Cancel
      </Button>
      <Button 
        onClick={() => handleStatusChange('completed')} 
        variant="outline" 
        size="sm"
        disabled={appointment.status === 'completed'}
      >
        Mark as Done
      </Button>
    </div>
  );
};

export default AppointmentStatusButtons;
