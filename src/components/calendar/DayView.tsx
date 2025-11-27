
import React from 'react';
import { format, set } from 'date-fns';
import { cn } from "@/lib/utils";
import { Appointment } from "@/types/appointments";
import { useDroppable } from '@dnd-kit/core';
import { formatInUserTimeZone } from '@/utils/timezone';
import TimeGrid from './TimeGrid';

interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onAppointmentDrop?: (appointment: Appointment, newStart: Date) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  timeZone?: string;
}

const DayView: React.FC<DayViewProps> = ({
  date,
  appointments,
  onAppointmentClick,
  onAppointmentDrop,
  onTimeSlotClick,
  timeZone
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${format(date, 'yyyy-MM-dd')}`,
    data: { date }
  });

  // Filter appointments for this day, considering timezone
  const dayAppointments = appointments.filter(apt => {
    if (timeZone) {
      // Compare dates in the specified timezone
      return formatInUserTimeZone(new Date(apt.start_time), 'yyyy-MM-dd', timeZone) === 
             formatInUserTimeZone(date, 'yyyy-MM-dd', timeZone);
    }
    // Default comparison without timezone
    return format(new Date(apt.start_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (over && onAppointmentDrop) {
      const appointment = active.data.current;
      const dropData = over.data.current;
      const hourHeight = 80; // height of each hour slot in pixels
      
      // Calculate drop position to determine the hour
      const offsetY = event.delta.y;
      const currentHour = new Date(appointment.start_time).getHours();
      const dropHour = Math.floor(offsetY / hourHeight) + currentHour;
      
      const newStart = set(date, { 
        hours: dropHour, 
        minutes: 0, 
        seconds: 0, 
        milliseconds: 0 
      });
      
      onAppointmentDrop(appointment, newStart);
    }
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "h-[600px] overflow-y-auto relative",
        isOver && "bg-blue-50"
      )}
    >
      <TimeGrid 
        date={date}
        appointments={dayAppointments}
        onAppointmentClick={onAppointmentClick}
        onTimeSlotClick={onTimeSlotClick}
        timeZone={timeZone}
      />
    </div>
  );
};

export default DayView;
