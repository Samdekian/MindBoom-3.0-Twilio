import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, CheckCircle } from "lucide-react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useTherapistList } from "@/hooks/use-therapist-list";
import { useAppointments } from "@/hooks/use-appointments";

interface SimplifiedBookingFlowProps {
  onBookingComplete?: (appointmentId: string) => void;
}

const SimplifiedBookingFlow: React.FC<SimplifiedBookingFlowProps> = ({ onBookingComplete }) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const { therapists } = useTherapistList();
  const { createAppointment } = useAppointments();

  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const availableTimes = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  const handleBookAppointment = async () => {
    if (!user?.id || !selectedTherapistId || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select therapist, date, and time before booking.",
        variant: "destructive",
      });
      return;
    }

    setIsBooking(true);

    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const endTime = new Date(appointmentDate);
      endTime.setMinutes(endTime.getMinutes() + 50);

      const result = await createAppointment.mutateAsync({
        patient_id: user.id,
        therapist_id: selectedTherapistId,
        start_time: appointmentDate.toISOString(),
        end_time: endTime.toISOString(),
        title: "Therapy Session",
        description: "Regular therapy session",
        status: "scheduled" as const,
        appointment_type: "video",
        video_enabled: true,
      });

      if (result && typeof result === "object" && "id" in result) {
        const appointmentId = (result as any).id;
        toast({
          title: "Appointment Booked!",
          description: `Your appointment has been scheduled for ${format(selectedDate, "EEEE, MMMM d")} at ${selectedTime}.`,
        });
        onBookingComplete?.(appointmentId);
      }
    } catch (error: any) {
      console.error("Error booking appointment:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simplified Booking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Select Therapist</label>
          <select
            className="w-full border rounded p-2"
            value={selectedTherapistId || ""}
            onChange={(e) => setSelectedTherapistId(e.target.value || null)}
          >
            <option value="">-- Select Therapist --</option>
            {therapists?.map((therapist) => (
              <option key={therapist.id} value={therapist.id}>
                {therapist.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Select Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
            onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Select Time</label>
          <select
            className="w-full border rounded p-2"
            value={selectedTime || ""}
            onChange={(e) => setSelectedTime(e.target.value || null)}
          >
            <option value="">-- Select Time --</option>
            {availableTimes.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleBookAppointment} disabled={isBooking}>
          {isBooking ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SimplifiedBookingFlow;
