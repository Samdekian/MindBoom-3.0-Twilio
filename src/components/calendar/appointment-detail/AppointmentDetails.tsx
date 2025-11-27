
import React from 'react';
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types/appointments";
import { formatInUserTimeZone } from "@/utils/timezone";
import AppointmentActions from './AppointmentActions';
import AppointmentStatusButtons from './AppointmentStatusButtons';
import VideoSessionButton from '@/components/appointment/VideoSessionButton';

interface AppointmentDetailsProps {
  appointment: Appointment;
  timeZone?: string;
  onEdit: () => void;
}

const AppointmentDetails: React.FC<AppointmentDetailsProps> = ({ 
  appointment, 
  timeZone,
  onEdit 
}) => {
  // Format dates for display
  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  
  const formattedStart = timeZone 
    ? formatInUserTimeZone(startTime, 'PPp', timeZone)
    : startTime.toLocaleString();
  
  const formattedEnd = timeZone 
    ? formatInUserTimeZone(endTime, 'h:mm a', timeZone)
    : endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="mt-4 space-y-4">
      <div className="flex items-start gap-2">
        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div>
          <div className="font-medium">{formattedStart}</div>
          <div className="text-muted-foreground">to {formattedEnd}</div>
        </div>
      </div>
      
      {appointment.description && (
        <div className="mt-2">
          <h3 className="font-medium mb-1">Description</h3>
          <p className="text-muted-foreground">{appointment.description}</p>
        </div>
      )}
      
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant={
          appointment.status === 'confirmed' ? 'default' :
          appointment.status === 'cancelled' ? 'destructive' :
          appointment.status === 'completed' ? 'outline' :
          'secondary'
        }>
          {appointment.status}
        </Badge>
        
        {appointment.conflicts && appointment.conflicts.length > 0 && (
          <Badge variant="destructive">
            {appointment.conflicts.length} Conflict{appointment.conflicts.length > 1 ? 's' : ''}
          </Badge>
        )}

        {appointment.video_enabled && (
          <Badge variant="outline">
            Video Enabled
          </Badge>
        )}
      </div>

      {/* Video Session Button */}
      {appointment.video_enabled && (
        <div className="pt-2">
          <VideoSessionButton 
            appointment={appointment}
            variant="default"
            size="sm"
          />
        </div>
      )}

      <AppointmentStatusButtons appointment={appointment} />
      <AppointmentActions appointment={appointment} onEdit={onEdit} />
    </div>
  );
};

export default AppointmentDetails;
