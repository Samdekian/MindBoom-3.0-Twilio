
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, Video, User, Clock, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDate as formatDateUtil, formatDuration } from "@/utils/date/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTimeZone } from "@/contexts/TimeZoneContext";
import { ShareButton } from "./ShareButton";

interface BookingSuccessMessageProps {
  onReset: () => void;
  appointmentId: string | null;
}

const BookingSuccessMessage: React.FC<BookingSuccessMessageProps> = ({ onReset, appointmentId }) => {
  const navigate = useNavigate();
  const { timeZone } = useTimeZone();

  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      if (!appointmentId) throw new Error("No appointment ID provided");
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patient_id(full_name),
          therapist:therapist_id(full_name)
        `)
        .eq('id', appointmentId)
        .single();
      
      if (error) throw error;
      
      return data as unknown as {
        id: string;
        title: string; 
        start_time: string;
        end_time: string;
        video_enabled: boolean;
        recurrence_rule: string | null;
        appointment_type: string;
        patient: { full_name: string | null };
        therapist: { full_name: string | null };
      };
    },
    enabled: !!appointmentId
  });

  const viewAppointments = () => {
    navigate("/calendar");
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center space-y-6">
      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-10 w-10 text-green-500" />
      </div>
      
      <div>
        <h3 className="text-xl font-bold">Appointment Scheduled!</h3>
        <p className="text-muted-foreground">Your appointment has been successfully booked.</p>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-2/3 mx-auto"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Could not load appointment details</AlertDescription>
        </Alert>
      ) : appointment ? (
        <div className="bg-muted p-4 rounded-lg max-w-md w-full mx-auto">
          <div className="space-y-3">
            {appointment.title && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.title}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatDateUtil(appointment.start_time)}, {" "}
                {formatDuration((new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime()) / 1000).substring(0, 5)}
              </span>
              <span className="text-xs text-muted-foreground">({timeZone})</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>
                With {appointment.therapist?.full_name || "your therapist"}
              </span>
            </div>
            
            {appointment.appointment_type === 'video' && appointment.video_enabled && (
              <div className="flex items-center gap-2 text-sm">
                <Video className="h-4 w-4 text-muted-foreground" />
                <span>Video session enabled</span>
              </div>
            )}
            
            {appointment.recurrence_rule && (
              <div className="mt-2 text-xs text-muted-foreground border-t pt-2">
                <span>Recurring appointment</span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="w-full max-w-md">
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            A confirmation email has been sent with your appointment details.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
        <Button variant="outline" onClick={onReset} className="flex-1">
          Book Another
        </Button>
        <Button onClick={viewAppointments} className="flex-1">
          View Calendar
        </Button>
      </div>

      {appointment && (
        <div className="pt-2 border-t w-full max-w-md">
          <ShareButton appointmentId={appointment.id} appointmentDetails={appointment} />
        </div>
      )}
    </div>
  );
};

export default BookingSuccessMessage;
