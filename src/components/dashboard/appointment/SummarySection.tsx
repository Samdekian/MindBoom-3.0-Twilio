import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTimeToAmPm } from '@/utils/time-formatter';
import { useTimeZone } from '@/contexts/TimeZoneContext';
import { useTherapistList } from '@/hooks/use-therapist-list';
import { useAppointments } from '@/hooks/use-appointments';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { format } from 'date-fns';
import { CalendarCheck, Clock, User, CalendarDays, Loader2, Check } from 'lucide-react';
import StepInstructions from './StepInstructions';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface SummarySectionProps {
  therapistId: string | null;
  date: Date | null;
  time: string | null;
  onBookingStart?: () => Promise<void>;
  onBookingSuccess?: (appointmentId: string) => void;
  onBookingError?: (errorMessage: string) => void;
}

const SummarySection: React.FC<SummarySectionProps> = ({
  therapistId,
  date,
  time,
  onBookingStart,
  onBookingSuccess,
  onBookingError
}) => {
  const { timeZone } = useTimeZone();
  const { therapists } = useTherapistList();
  const { user } = useAuthRBAC();
  const { createAppointment } = useAppointments();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStage, setBookingStage] = useState<'idle' | 'processing' | 'confirming'>('idle');
  const { toast } = useToast();
  
  const therapist = therapists?.find(t => t.id === therapistId);

  const handleBookAppointment = async () => {
    if (!therapistId || !date || !time || !user) return;
    
    try {
      setIsBooking(true);
      setBookingStage('processing');
      
      if (onBookingStart) {
        await onBookingStart();
      }
      
      // Create date object for the selected time
      const [hours, minutes] = time.split(':').map(Number);
      const appointmentDate = new Date(date);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      // End time is 50 minutes after start time by default
      const endTime = new Date(appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + 50);
      
      const result = await createAppointment.mutateAsync({
        patient_id: user.id,
        therapist_id: therapistId,
        start_time: appointmentDate.toISOString(),
        end_time: endTime.toISOString(),
        title: "Therapy Session",
        description: "Regular therapy session",
        status: "scheduled" as const,
        appointment_type: "video",
        video_enabled: true,
      });
      
      setBookingStage('confirming');
      
      setTimeout(() => {
        if (onBookingSuccess && result && typeof result === 'object' && 'id' in result) {
          const appointmentId = (result as any).id;
          onBookingSuccess(appointmentId);
          toast({
            title: "Appointment Booked!",
            description: `Your appointment has been successfully scheduled for ${format(date, 'EEEE, MMMM d')} at ${formatTimeToAmPm(time)}.`,
            variant: "default",
          });
        }
      }, 1000);
      
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      setBookingStage('idle');
      
      if (onBookingError) {
        onBookingError(error.message || "Failed to book appointment");
      }
      
      toast({
        title: "Booking Failed",
        description: error.message || "There was a problem booking your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsBooking(false);
      }, 1000);
    }
  };

  if (!therapistId || !date || !time) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">
          Please complete all previous steps before confirming your appointment.
        </p>
      </div>
    );
  }

  return (
    <Card className={cn(
      "transition-all duration-500",
      bookingStage === 'confirming' ? "bg-green-50" : ""
    )}>
      <CardContent className="pt-6">
        <StepInstructions 
          instructions="Review your appointment details before confirming. Please make sure all information is correct."
          className={cn(
            "transition-opacity duration-500",
            bookingStage === 'confirming' ? "opacity-0" : "opacity-100"
          )}
        />
        
        {bookingStage === 'confirming' && (
          <div className="bg-green-100 text-green-800 p-4 rounded-md mb-6 flex items-center gap-2 animate-fade-in">
            <Check className="h-5 w-5" />
            <span className="font-medium">Booking confirmed! Your appointment has been scheduled.</span>
          </div>
        )}
        
        <h3 className="font-medium text-lg mb-4">Appointment Summary</h3>
        
        <div className="space-y-4 mb-6">
          <div className={cn(
            "flex items-center gap-3 text-sm p-3 rounded-md transition-all duration-300",
            bookingStage === 'confirming' ? "bg-green-100" : "hover:bg-slate-50"
          )}>
            <User className="h-5 w-5 text-primary" />
            <div>
              <div className="text-muted-foreground">Therapist</div>
              <div className="font-medium">{therapist?.name || "Selected Therapist"}</div>
            </div>
          </div>
          
          <div className={cn(
            "flex items-center gap-3 text-sm p-3 rounded-md transition-all duration-300",
            bookingStage === 'confirming' ? "bg-green-100" : "hover:bg-slate-50"
          )}>
            <CalendarDays className="h-5 w-5 text-primary" />
            <div>
              <div className="text-muted-foreground">Date</div>
              <div className="font-medium">
                {date ? format(date, 'EEEE, MMMM d, yyyy') : "Selected Date"}
              </div>
            </div>
          </div>
          
          <div className={cn(
            "flex items-center gap-3 text-sm p-3 rounded-md transition-all duration-300",
            bookingStage === 'confirming' ? "bg-green-100" : "hover:bg-slate-50"
          )}>
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <div className="text-muted-foreground">Time ({timeZone})</div>
              <div className="font-medium">{formatTimeToAmPm(time)}</div>
            </div>
          </div>
          
          <div className={cn(
            "flex items-center gap-3 text-sm p-3 rounded-md transition-all duration-300",
            bookingStage === 'confirming' ? "bg-green-100" : "hover:bg-slate-50"
          )}>
            <CalendarCheck className="h-5 w-5 text-primary" />
            <div>
              <div className="text-muted-foreground">Duration</div>
              <div className="font-medium">50 minutes</div>
            </div>
          </div>
        </div>
        
        <Button
          onClick={handleBookAppointment}
          className={cn(
            "w-full transition-all duration-300",
            isBooking ? "bg-primary/80" : "",
            bookingStage === 'confirming' ? "bg-green-600 hover:bg-green-700" : ""
          )}
          disabled={isBooking}
        >
          {isBooking ? (
            <>
              {bookingStage === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Booking...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Appointment Confirmed!
                </>
              )}
            </>
          ) : (
            "Confirm Booking"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SummarySection;
