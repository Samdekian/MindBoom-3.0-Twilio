
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, User } from "lucide-react";
import { useAvailabilityManagement } from "@/hooks/use-availability-management";
import { useUpcomingAppointments } from "@/hooks/useUpcomingAppointments";
import { format, isToday, isTomorrow, parseISO } from "date-fns";

interface CalendarDashboardWidgetProps {
  className?: string;
}

const CalendarDashboardWidget: React.FC<CalendarDashboardWidgetProps> = ({ className }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { availability: availabilitySlots, isLoading: slotsLoading } = useAvailabilityManagement();
  const { data: appointments, isLoading: appointmentsLoading } = useUpcomingAppointments('therapist');

  // Filter today's and upcoming appointments
  const todayAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.start_time);
      return isToday(aptDate);
    });
  }, [appointments]);

  const upcomingAppointments = useMemo(() => {
    if (!appointments) return [];
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.start_time);
      return !isToday(aptDate);
    }).slice(0, 3);
  }, [appointments]);

  // Get today's availability
  const todayAvailability = useMemo(() => {
    if (!availabilitySlots) return [];
    const today = format(new Date(), 'yyyy-MM-dd');
    return availabilitySlots.filter(slot => 
      slot.date === today && slot.is_available
    );
  }, [availabilitySlots]);

  const formatTime = (timeString: string) => {
    try {
      const date = parseISO(timeString);
      return format(date, 'h:mm a');
    } catch {
      return timeString;
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'default';
      case 'scheduled': return 'secondary';
      case 'completed': return 'outline';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM dd');
  };

  if (slotsLoading || appointmentsLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Calendar Overview</CardTitle>
          </div>
          <Button size="sm" variant="outline">
            <Plus className="h-4 w-4 mr-1" />
            Manage Schedule
          </Button>
        </div>
        <CardDescription>
          Today's schedule and upcoming appointments
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Today's Schedule */}
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Today's Schedule
          </h4>
          
          {todayAppointments.length > 0 ? (
            <div className="space-y-2">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">
                      {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {appointment.patient_profile?.full_name || 'Unknown Patient'}
                      </span>
                    </div>
                  </div>
                  <Badge variant={getAppointmentStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No appointments scheduled for today</p>
            </div>
          )}
          
          {/* Today's Available Slots */}
          {todayAvailability.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2 text-muted-foreground">Available Time Slots</h5>
              <div className="flex flex-wrap gap-2">
                {todayAvailability.map((slot) => (
                  <Badge key={slot.id} variant="outline" className="text-xs">
                    {slot.start_time} - {slot.end_time}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        {upcomingAppointments.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Upcoming Appointments</h4>
            <div className="space-y-2">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {getDateLabel(appointment.start_time)}
                    </Badge>
                    <span className="text-sm">
                      {appointment.patient_profile?.full_name || 'Unknown Patient'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTime(appointment.start_time)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{todayAppointments.length}</div>
            <div className="text-xs text-muted-foreground">Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{upcomingAppointments.length}</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarDashboardWidget;
