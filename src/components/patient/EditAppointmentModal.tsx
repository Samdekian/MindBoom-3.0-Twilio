import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar as CalendarIcon, AlertTriangle, X } from "lucide-react";
import { format, addDays, isBefore } from "date-fns";
import { useAppointmentCrud } from "@/hooks/appointment/use-appointment-crud";

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: {
    id: string;
    title: string;
    start_time: string;
    end_time: string;
    therapist_profile?: {
      full_name: string;
    };
  };
}

const timeSlots = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM"
];

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
}) => {
  const { updateAppointment, deleteAppointment } = useAppointmentCrud();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const canEdit24Hours = () => {
    const appointmentDate = new Date(appointment.start_time);
    const now = new Date();
    const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff >= 24;
  };

  const handleUpdateAppointment = async () => {
    if (!selectedDate || !selectedTime) return;

    setIsUpdating(true);
    try {
      // Parse the time and create new appointment datetime
      const [time, period] = selectedTime.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;

      const newStartTime = new Date(selectedDate);
      newStartTime.setHours(hour24, minutes || 0, 0, 0);
      
      // Calculate end time (maintain original duration)
      const originalStart = new Date(appointment.start_time);
      const originalEnd = new Date(appointment.end_time);
      const duration = originalEnd.getTime() - originalStart.getTime();
      const newEndTime = new Date(newStartTime.getTime() + duration);

      await updateAppointment.mutateAsync({
        ...appointment,
        start_time: newStartTime.toISOString(),
        end_time: newEndTime.toISOString(),
        status: 'scheduled' as const,
      });

      onClose();
    } catch (error) {
      console.error('Error updating appointment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelAppointment = async () => {
    setIsCancelling(true);
    try {
      await deleteAppointment.mutateAsync(appointment.id);
      onClose();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  const minDate = addDays(new Date(), 1); // Tomorrow is the earliest

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Edit Appointment
          </DialogTitle>
          <DialogDescription>
            Update your appointment date and time, or cancel if needed
          </DialogDescription>
        </DialogHeader>

        {/* 24-hour policy notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">24-Hour Policy</p>
                <p className="text-xs text-amber-700">
                  Appointments can only be rescheduled or cancelled at least 24 hours before the scheduled time.
                  {!canEdit24Hours() && " This appointment is within 24 hours and cannot be modified."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current appointment details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Appointment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{appointment.therapist_profile?.full_name || 'Therapist'}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              {format(new Date(appointment.start_time), 'EEEE, MMMM do, yyyy')}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {format(new Date(appointment.start_time), 'h:mm a')} - {format(new Date(appointment.end_time), 'h:mm a')}
            </div>
          </CardContent>
        </Card>

        {canEdit24Hours() ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select New Date</CardTitle>
                <CardDescription>Choose a new date for your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => isBefore(date, minDate)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Select New Time</CardTitle>
                <CardDescription>Choose a new time for your appointment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                  {timeSlots.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="justify-start"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-center">
              <X className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Cannot Edit Appointment</h3>
              <p className="text-sm text-red-700">
                This appointment is scheduled within 24 hours and cannot be modified according to our policy.
                Please contact support if you have an emergency.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4">
          <div className="flex gap-2">
            {canEdit24Hours() && (
              <Button
                variant="destructive"
                onClick={handleCancelAppointment}
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Cancel Appointment"}
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {canEdit24Hours() && (
              <Button
                onClick={handleUpdateAppointment}
                disabled={!selectedDate || !selectedTime || isUpdating}
              >
                {isUpdating ? "Updating..." : "Update Appointment"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentModal;
