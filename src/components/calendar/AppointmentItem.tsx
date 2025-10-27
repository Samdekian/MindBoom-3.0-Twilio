
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/appointments";
import { formatInUserTimeZone } from '@/utils/timezone';
import { format } from 'date-fns';

interface AppointmentItemProps {
  appointment: Appointment;
  onAppointmentClick?: (appointment: Appointment) => void;
  timeZone?: string;
}

const AppointmentItem: React.FC<AppointmentItemProps> = ({ 
  appointment, 
  onAppointmentClick,
  timeZone
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: appointment.id,
    data: appointment
  });

  const startTime = new Date(appointment.start_time);
  const endTime = new Date(appointment.end_time);
  
  // Get start and end hours considering timezone
  const startHour = startTime.getHours() + (startTime.getMinutes() / 60);
  const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return "bg-green-100 hover:bg-green-200";
      case 'cancelled':
        return "bg-gray-100 hover:bg-gray-200";
      case 'completed':
        return "bg-blue-50 hover:bg-blue-100";
      case 'no-show':
        return "bg-red-50 hover:bg-red-100";
      case 'in-progress':
        return "bg-yellow-100 hover:bg-yellow-200";
      default:
        return "bg-blue-100 hover:bg-blue-200";
    }
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => onAppointmentClick?.(appointment)}
      className={cn(
        "absolute left-0 right-4 p-2 rounded-md cursor-move",
        "transition-colors border-l-4",
        getStatusColor(appointment.status),
        appointment.status === "confirmed" && "border-l-green-500",
        appointment.status === "cancelled" && "border-l-gray-500",
        appointment.status === "completed" && "border-l-blue-500",
        appointment.status === "no-show" && "border-l-red-500",
        appointment.status === "in-progress" && "border-l-yellow-500",
        appointment.status === "scheduled" && "border-l-blue-400",
        isDragging && "opacity-50 ring-2 ring-primary"
      )}
      style={{
        top: `${startHour * (80/1)}px`,
        height: `${durationHours * (80/1)}px`,
      }}
    >
      <div className="text-sm font-medium truncate">{appointment.title}</div>
      <div className="text-xs text-muted-foreground">
        {timeZone 
          ? `${formatInUserTimeZone(startTime, 'h:mm a', timeZone)} - ${formatInUserTimeZone(endTime, 'h:mm a', timeZone)}`
          : `${format(startTime, 'h:mm a')} - ${format(endTime, 'h:mm a')}`
        }
      </div>
      {appointment.conflicts && appointment.conflicts.length > 0 && (
        <div className="text-xs mt-1 text-red-600 font-medium">
          ⚠️ {appointment.conflicts.length} conflict{appointment.conflicts.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default AppointmentItem;
