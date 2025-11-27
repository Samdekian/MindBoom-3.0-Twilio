
import React from 'react';
import { Button } from "@/components/ui/button";
import { Appointment } from "@/types/appointments";
import { useAppointments } from "@/hooks/use-appointments";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AppointmentActionsProps {
  appointment: Appointment;
  onEdit: () => void;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({ 
  appointment,
  onEdit
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const { deleteAppointment } = useAppointments();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      // Pass the full appointment object instead of just the ID
      await deleteAppointment.mutateAsync(appointment);
      toast({
        title: "Success",
        description: "Appointment deleted successfully"
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <div className="flex justify-end pt-4 gap-2">
        <Button onClick={onEdit} variant="outline">
          Edit
        </Button>
        <Button onClick={() => setIsDeleteDialogOpen(true)} variant="destructive">
          Delete
        </Button>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the appointment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppointmentActions;
