
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { formatInUserTimeZone } from '@/utils/timezone';
import { Appointment } from '@/types/appointments';

interface MonthViewProps {
  selectedDate: Date;
  appointments: Appointment[];
  onDateChange: (date: Date | undefined) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  timeZone: string;
}

const MonthView: React.FC<MonthViewProps> = ({
  selectedDate,
  appointments,
  onDateChange,
  onAppointmentClick,
  timeZone
}) => {
  const dailyAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.start_time);
    return appointmentDate.getDate() === selectedDate.getDate() &&
           appointmentDate.getMonth() === selectedDate.getMonth() &&
           appointmentDate.getFullYear() === selectedDate.getFullYear();
  });

  return (
    <div className="flex flex-col space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateChange}
        className="rounded-md border"
      />
      
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-4">
          Appointments for {formatInUserTimeZone(selectedDate, 'PPP', timeZone)}
        </h3>
        {dailyAppointments.length > 0 ? (
          dailyAppointments.map((appointment) => (
            <div
              key={appointment.id}
              onClick={() => onAppointmentClick(appointment)}
              className="p-3 mb-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80"
            >
              <div className="font-medium">{appointment.title}</div>
              <div className="text-sm text-muted-foreground">
                {formatInUserTimeZone(new Date(appointment.start_time), 'h:mm a', timeZone)} - 
                {formatInUserTimeZone(new Date(appointment.end_time), 'h:mm a', timeZone)}
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">No appointments for this day.</p>
        )}
      </div>
    </div>
  );
};

export default MonthView;
