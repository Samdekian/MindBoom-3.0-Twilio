import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { format, startOfDay, endOfDay, isAfter, isBefore, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTherapistList } from "@/hooks/use-therapist-list";
import { Textarea } from "@/components/ui/textarea";
import { useTimeZone } from "@/contexts/TimeZoneContext";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useAppointments } from "@/hooks/use-appointments";

interface BookingCalendarProps {
  therapistId: string | null;
  selectedDate: Date | null;
  onAppointmentCreated?: (appointmentId: string) => void;
  className?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  therapistId,
  selectedDate,
  onAppointmentCreated,
  className
}) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const { timeZone } = useTimeZone();
  const queryClient = useQueryClient();
  const { createAppointment } = useAppointments();
  
  const [appointmentNotes, setAppointmentNotes] = useState("");

  const { data: therapist, isLoading: isTherapistLoading } = useQuery({
    queryKey: ['therapist', therapistId],
    queryFn: async () => {
      if (!therapistId) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', therapistId)
        .single();

      if (error) {
        console.error("Error fetching therapist:", error);
        throw error;
      }

      return data;
    },
    enabled: !!therapistId,
  });

  const { data: availability, isLoading: isAvailabilityLoading, error: availabilityError } = useQuery({
    queryKey: ['availability', therapistId, selectedDate],
    queryFn: async () => {
      if (!therapistId || !selectedDate) return [];

      const start = startOfDay(selectedDate).toISOString();
      const end = endOfDay(selectedDate).toISOString();

      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .eq('therapist_id', therapistId)
        .gte('start_time', start)
        .lte('end_time', end);

      if (error) {
        console.error("Error fetching availability:", error);
        throw error;
      }

      return data;
    },
    enabled: !!therapistId && !!selectedDate,
  });

  const generateTimeSlots = (): TimeSlot[] => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const dateTime = selectedDate ? new Date(selectedDate) : new Date();
        dateTime.setHours(hour, minute, 0, 0);

        const isTimeSlotAvailable = availability?.some(slot => {
          const slotStart = slot.start_time ? parseISO(slot.start_time) : null;
          const slotEnd = slot.end_time ? parseISO(slot.end_time) : null;

          return slotStart && slotEnd && isAfter(dateTime, slotStart) && isBefore(dateTime, slotEnd);
        });

        slots.push({
          time,
          available: !!isTimeSlotAvailable,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleTimeSlotSelect = async (timeSlot: string) => {
    if (!user?.id || !therapistId || !selectedDate) return;
    
    try {
      const [hours, minutes] = timeSlot.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + 50);
      
      const result = await createAppointment.mutateAsync({
        patient_id: user.id,
        therapist_id: therapistId,
        start_time: appointmentDate.toISOString(),
        end_time: endTime.toISOString(),
        title: "Therapy Session",
        description: appointmentNotes,
        status: "scheduled" as const,
        appointment_type: "video",
        video_enabled: true,
      });
      
      if (result && typeof result === 'object' && 'id' in result) {
        const appointmentId = (result as any).id;
        onAppointmentCreated?.(appointmentId);
      }
      
      toast({
        title: "Appointment Booked!",
        description: `Your appointment has been scheduled for ${format(selectedDate, 'EEEE, MMMM d')} at ${timeSlot}.`,
      });
      
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was a problem booking your appointment.",
        variant: "destructive",
      });
    }
  };

  if (isTherapistLoading || isAvailabilityLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>Checking Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <Clock className="mr-2 h-4 w-4 animate-spin" />
            Loading availability...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!therapist || availabilityError) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>No Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 text-red-500">
            <AlertCircle className="mr-2 h-4 w-4" />
            Failed to load availability.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a Date'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-2">
          {timeSlots.map((slot) => (
            <Button
              key={slot.time}
              variant="outline"
              className="justify-start"
              disabled={!slot.available}
              onClick={() => handleTimeSlotSelect(slot.time)}
            >
              {slot.time}
              {!slot.available && (
                <Badge variant="secondary" className="ml-2">
                  Unavailable
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <div>
          <Textarea
            placeholder="Appointment notes..."
            value={appointmentNotes}
            onChange={(e) => setAppointmentNotes(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingCalendar;
