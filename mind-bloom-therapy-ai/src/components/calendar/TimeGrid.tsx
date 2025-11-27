
import React from 'react';
import { format } from 'date-fns';
import { cn } from "@/lib/utils";
import { formatInUserTimeZone } from '@/utils/timezone';
import { Appointment } from "@/types/appointments";
import AppointmentItem from './AppointmentItem';

interface TimeGridProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  timeZone?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const TimeGrid: React.FC<TimeGridProps> = ({
  date,
  appointments,
  onAppointmentClick,
  onTimeSlotClick,
  timeZone
}) => {
  return (
    <div className="relative grid grid-cols-[60px_1fr] gap-4">
      {/* Time labels */}
      <div className="sticky top-0">
        {HOURS.map((hour) => (
          <div 
            key={hour} 
            className="h-20 text-sm text-muted-foreground text-right pr-2"
          >
            {timeZone 
              ? formatInUserTimeZone(new Date(new Date().setHours(hour, 0, 0, 0)), 'h a', timeZone) 
              : format(new Date().setHours(hour, 0, 0, 0), 'h a')
            }
          </div>
        ))}
      </div>

      {/* Time slots and appointments */}
      <div className="relative">
        {/* Time slot backgrounds */}
        {HOURS.map((hour) => (
          <div 
            key={hour}
            onClick={() => onTimeSlotClick?.(date, hour)}
            className={cn(
              "h-20 border-t border-gray-200 relative",
              "hover:bg-gray-50 cursor-pointer",
              hour === new Date().getHours() && "bg-blue-50/30"
            )}
          >
            {hour === new Date().getHours() && (
              <div className="absolute left-0 right-0 border-t border-red-400" style={{ 
                top: `${new Date().getMinutes() / 60 * 80}px` 
              }} />
            )}
          </div>
        ))}

        {/* Appointments */}
        <div className="absolute inset-0">
          {appointments.map((appointment) => (
            <AppointmentItem
              key={appointment.id}
              appointment={appointment}
              onAppointmentClick={onAppointmentClick}
              timeZone={timeZone}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TimeGrid;
