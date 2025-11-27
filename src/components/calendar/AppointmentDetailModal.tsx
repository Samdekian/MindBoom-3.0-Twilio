
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Appointment } from "@/types/appointments";
import AppointmentDetails from './appointment-detail/AppointmentDetails';
import AppointmentEditForm from './appointment-detail/AppointmentEditForm';

interface AppointmentDetailModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  timeZone?: string;
}

const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({ 
  appointment, 
  isOpen, 
  onClose,
  timeZone
}) => {
  const [isEditing, setIsEditing] = React.useState(false);

  if (!appointment) {
    return null;
  }

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      setIsEditing(false);
      onClose();
    }}>
      <DialogContent className="min-w-[350px] sm:max-w-[500px]">
        {!isEditing ? (
          <>
            <DialogHeader>
              <DialogTitle>{appointment.title || "Untitled Appointment"}</DialogTitle>
            </DialogHeader>
            <AppointmentDetails 
              appointment={appointment} 
              timeZone={timeZone}
              onEdit={() => setIsEditing(true)}
            />
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Edit Appointment</DialogTitle>
            </DialogHeader>
            <AppointmentEditForm
              startTime={new Date(appointment.start_time)}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditing(false)}
              timeZone={timeZone}
              appointment={appointment}
              isEditing={true}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDetailModal;
