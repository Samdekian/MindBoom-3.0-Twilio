
import React from 'react';
import { format, addDays, startOfWeek, set } from 'date-fns';
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/appointments";
import DayView from './DayView';
import { formatInUserTimeZone } from '@/utils/timezone';

interface WeekViewProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onAppointmentDrop?: (appointment: Appointment, newStart: Date) => void;
  onTimeSlotClick?: (start: Date) => void;
  timeZone?: string;
}

const WeekView: React.FC<WeekViewProps> = ({
  date,
  appointments,
  onAppointmentClick,
  onAppointmentDrop,
  onTimeSlotClick,
  timeZone
}) => {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleTimeSlotClick = (day: Date, hour: number) => {
    if (onTimeSlotClick) {
      const newDate = set(day, { hours: hour, minutes: 0, seconds: 0, milliseconds: 0 });
      onTimeSlotClick(newDate);
    }
  };

  const isToday = (day: Date) => {
    const today = new Date();
    return day.getDate() === today.getDate() &&
           day.getMonth() === today.getMonth() &&
           day.getFullYear() === today.getFullYear();
  };

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-4 min-w-[1200px]">
        {weekDays.map((day, index) => (
          <div key={index} className="flex flex-col">
            <div className={cn(
              "text-center p-2 border-b",
              isToday(day) && "bg-primary text-primary-foreground"
            )}>
              <div className="font-medium">
                {timeZone ? formatInUserTimeZone(day, 'EEE', timeZone) : format(day, 'EEE')}
              </div>
              <div className="text-sm">
                {timeZone ? formatInUserTimeZone(day, 'MMM d', timeZone) : format(day, 'MMM d')}
              </div>
            </div>
            <DayView 
              date={day}
              appointments={appointments}
              onAppointmentClick={onAppointmentClick}
              onAppointmentDrop={onAppointmentDrop}
              onTimeSlotClick={(_, hour) => handleTimeSlotClick(day, hour)}
              timeZone={timeZone}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekView;
