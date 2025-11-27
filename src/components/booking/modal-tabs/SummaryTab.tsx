
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";
import { useCreateAppointment } from "@/hooks/use-appointments";

interface SummaryTabProps {
  therapistId: string | null;
  selectedDate: Date | null;
  selectedTime: string | null;
  therapistName: string | null;
  onBookingSuccess: (appointmentId: string) => void;
  onBack: () => void;
}

const SummaryTab: React.FC<SummaryTabProps> = ({
  therapistId,
  selectedDate,
  selectedTime,
  therapistName,
  onBookingSuccess,
  onBack
}) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const createAppointment = useCreateAppointment();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const handleBookAppointment = async () => {
    if (!user?.id || !therapistId || !selectedDate || !selectedTime) {
      setBookingError("Missing required booking information");
      return;
    }
    
    setIsBooking(true);
    setBookingError(null);
    
    try {
      // Parse the time format (e.g., "9:00 AM" -> 9:00)
      const timeMatch = selectedTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) {
        throw new Error("Invalid time format");
      }
      
      const [, hourStr, minuteStr, ampm] = timeMatch;
      let hours = parseInt(hourStr);
      const minutes = parseInt(minuteStr) || 0;
      
      if (ampm.toUpperCase() === 'PM' && hours !== 12) {
        hours += 12;
      } else if (ampm.toUpperCase() === 'AM' && hours === 12) {
        hours = 0;
      }
      
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 50); // 50-minute session
      
      const appointmentData = {
        patient_id: user.id,
        therapist_id: therapistId,
        title: "Initial Consultation",
        description: "Initial therapy consultation session",
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: "scheduled" as const,
        video_enabled: true,
        is_initial_consultation: true,
        appointment_type: "consultation"
      };
      
      const result = await createAppointment.mutateAsync(appointmentData);
      
      if (result && typeof result === 'object' && 'id' in result) {
        const appointmentId = (result as any).id;
        
        toast({
          title: "Appointment Booked!",
          description: "Your consultation has been scheduled successfully.",
        });
        
        onBookingSuccess(appointmentId);
      } else {
        throw new Error("Failed to create appointment - invalid response");
      }
      
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      const errorMessage = error.message || "Failed to book appointment. Please try again.";
      setBookingError(errorMessage);
      
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  // Validation check
  const isValid = therapistId && selectedDate && selectedTime && therapistName;

  if (!isValid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Complete Previous Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Please complete all previous steps before confirming your appointment.
          </p>
          <div className="space-y-2 text-sm">
            {!therapistId && <p className="text-red-500">• Select a therapist</p>}
            {!selectedDate && <p className="text-red-500">• Choose a date</p>}
            {!selectedTime && <p className="text-red-500">• Pick a time</p>}
          </div>
          <Button variant="outline" onClick={onBack} className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Appointment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {bookingError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Booking Error</p>
                <p className="text-sm text-red-700">{bookingError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3  rounded-lg border">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Therapist</p>
              <p className="font-medium">{therapistName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="font-medium">{selectedTime} (50 minutes)</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg border">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">Online Video Session</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-800">
            <strong>Initial Consultation:</strong> This is your first session to discuss your needs and goals. 
            Follow-up appointments will be scheduled based on your treatment plan.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack} disabled={isBooking}>
            Back
          </Button>
          
          <Button 
            onClick={handleBookAppointment}
            disabled={isBooking}
            className="min-w-[140px]"
          >
            {isBooking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirm & Book
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryTab;
