
import React, { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useGoogleCalendarCalendars } from "@/hooks/use-google-calendar-calendars";
import BookingCalendarSection from "./appointment/BookingCalendarSection";
import BookingSuccessMessage from "./appointment/BookingSuccessMessage";
import BookingFooter from "./appointment/BookingFooter";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { NotificationPreferences } from "./appointment/NotificationPreferences";
import { useMediaQuery } from "@/hooks/use-mobile";
import { useAppointments } from "@/hooks/use-appointments";
import { useAppointmentRecurrence } from '@/hooks/use-appointment-recurrence';
import { useTimeZone } from '@/contexts/TimeZoneContext';

const AppointmentBooking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const { selectedCalendarId } = useGoogleCalendarCalendars();
  const { createRecurringAppointments, isCreatingRecurrence } = useAppointmentRecurrence();
  const [lastAppointmentId, setLastAppointmentId] = useState<string | null>(null);
  const { timeZone } = useTimeZone();
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const handleBookingStart = async () => {
    setIsLoading(true);
    setError(null);
  };

  const handleBookingSuccess = useCallback((appointmentId: string) => {
    setLastAppointmentId(appointmentId);
    setIsLoading(false);
    setIsBookingComplete(true);
    
    toast({
      title: "Appointment Scheduled",
      description: "Your appointment was successfully scheduled.",
      variant: "success",
    });
  }, [toast]);

  const handleBookingError = useCallback((errorMessage: string) => {
    setIsLoading(false);
    
    // Enhanced error messages
    let enhancedMessage = errorMessage;
    
    if (errorMessage.includes("conflicts")) {
      enhancedMessage = "This time slot conflicts with another appointment. Please select a different time.";
    } else if (errorMessage.includes("network")) {
      enhancedMessage = "Network connection issue. Please check your connection and try again.";
    } else if (errorMessage.includes("Scheduling conflicts")) {
      enhancedMessage = "This therapist is already booked during this time. Please select a different time or therapist.";
    }
    
    setError(enhancedMessage);
    
    toast({
      title: "Booking Failed",
      description: enhancedMessage,
      variant: "destructive",
    });
  }, [toast]);

  const resetBooking = () => {
    setIsBookingComplete(false);
    setError(null);
    setLastAppointmentId(null);
  };

  // Clear any errors on component mount
  useEffect(() => {
    setError(null);
  }, []);

  return (
    <Card className={isMobile ? "w-full shadow-sm" : ""}>
      <CardHeader className={isMobile ? "px-4 py-4" : ""}>
        <CardTitle className="text-primary">Book an Appointment</CardTitle>
        <CardDescription>Complete the steps below to schedule a session with your therapist</CardDescription>
      </CardHeader>
      <CardContent className={isMobile ? "px-4 py-4" : ""}>
        {isBookingComplete ? (
          <>
            <BookingSuccessMessage 
              onReset={resetBooking} 
              appointmentId={lastAppointmentId} 
            />
            {lastAppointmentId && (
              <div className="mt-6 border-t pt-4">
                <NotificationPreferences appointmentId={lastAppointmentId} />
              </div>
            )}
          </>
        ) : (
          <>
            {error && (
              <Alert variant="destructive" className="mb-4 animate-fade-in">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <BookingCalendarSection
              onBookingStart={handleBookingStart}
              onBookingSuccess={handleBookingSuccess}
              onBookingError={handleBookingError}
            />
          </>
        )}
      </CardContent>
      {!isLoading && !isBookingComplete && <BookingFooter />}
    </Card>
  );
};

export default AppointmentBooking;
