
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useAppointments } from "@/hooks/use-appointments";
import { format } from 'date-fns';
import { Appointment } from '@/types/appointments';
import { DndContext } from '@dnd-kit/core';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useTimeZone } from '@/contexts/TimeZoneContext';
import { useDebounce } from '@/hooks/use-debounce';

// Import refactored components
import CalendarHeader from './CalendarHeader';
import CalendarToolbar from './CalendarToolbar';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import AppointmentForm from './AppointmentForm';
import AppointmentDetailModal from './AppointmentDetailModal';

const CalendarView = () => {
  const { appointments, updateAppointmentStatus, updateAppointment } = useAppointments();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAppointmentDate, setNewAppointmentDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const { timeZone, setTimeZone } = useTimeZone();

  // State for filters and search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // State for appointment details modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        switch (view) {
          case 'day': newDate.setDate(prev.getDate() - 1); break;
          case 'week': newDate.setDate(prev.getDate() - 7); break;
          case 'month': newDate.setMonth(prev.getMonth() - 1); break;
        }
      } else {
        switch (view) {
          case 'day': newDate.setDate(prev.getDate() + 1); break;
          case 'week': newDate.setDate(prev.getDate() + 7); break;
          case 'month': newDate.setMonth(prev.getMonth() + 1); break;
        }
      }
      return newDate;
    });
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleAppointmentDrop = async (appointment: Appointment, newStart: Date) => {
    try {
      // Calculate the duration of the appointment
      const duration = new Date(appointment.end_time).getTime() - new Date(appointment.start_time).getTime();
      
      // Calculate new end time based on the same duration
      const newEnd = new Date(newStart.getTime() + duration);
      
      // Create updated appointment object
      const updatedAppointment = {
        ...appointment,
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString()
      };
      
      await updateAppointment.mutateAsync(updatedAppointment);
      
      toast({
        title: "Appointment Updated",
        description: "The appointment has been rescheduled successfully.",
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule the appointment.",
        variant: "destructive",
      });
    }
  };

  const handleTimeSlotClick = (start: Date) => {
    setNewAppointmentDate(start);
    setIsCreateDialogOpen(true);
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    setNewAppointmentDate(null);
  };

  const handleAppointmentCreated = () => {
    setIsCreateDialogOpen(false);
    setNewAppointmentDate(null);
  };

  // Filter appointments based on status and search query
  const filteredAppointments = appointments?.filter(apt => {
    // Status filter
    if (statusFilter !== 'all' && apt.status !== statusFilter) {
      return false;
    }
    
    // Search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      return apt.title?.toLowerCase().includes(query) || 
             apt.description?.toLowerCase().includes(query);
    }
    
    return true;
  }) || [];

  return (
    <DndContext>
      <div className="space-y-4">
        <Card className="p-4">
          <CalendarHeader 
            selectedDate={selectedDate}
            view={view}
            timeZone={timeZone}
            onDateChange={handleNavigate}
            onViewChange={(v) => setView(v)}
            onTimeZoneChange={setTimeZone}
          />

          <CalendarToolbar 
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={setSearchQuery}
            onStatusChange={setStatusFilter}
          />

          <div className="mt-4">
            {view === 'day' && (
              <DayView 
                date={selectedDate}
                appointments={filteredAppointments}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentDrop={handleAppointmentDrop}
                onTimeSlotClick={handleTimeSlotClick}
                timeZone={timeZone}
              />
            )}
            {view === 'week' && (
              <WeekView 
                date={selectedDate}
                appointments={filteredAppointments}
                onAppointmentClick={handleAppointmentClick}
                onAppointmentDrop={handleAppointmentDrop}
                onTimeSlotClick={handleTimeSlotClick}
                timeZone={timeZone}
              />
            )}
            {view === 'month' && (
              <MonthView
                selectedDate={selectedDate}
                appointments={filteredAppointments}
                onDateChange={handleDateChange}
                onAppointmentClick={handleAppointmentClick}
                timeZone={timeZone}
              />
            )}
          </div>
        </Card>

        {/* Create Appointment Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
            </DialogHeader>
            {newAppointmentDate && (
              <AppointmentForm
                startTime={newAppointmentDate}
                onSuccess={handleAppointmentCreated}
                onCancel={handleCreateDialogClose}
                timeZone={timeZone}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Appointment Detail Modal */}
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          timeZone={timeZone}
        />
      </div>
    </DndContext>
  );
};

export default CalendarView;
