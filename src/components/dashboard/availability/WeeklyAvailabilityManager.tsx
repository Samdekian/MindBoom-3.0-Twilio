
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/use-availability';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Calendar, Clock, Plus, Edit, Trash2 } from 'lucide-react';

const WeeklyAvailabilityManager: React.FC = () => {
  const { 
    availability, 
    isLoading, 
    error, 
    createAvailabilitySlot, 
    updateAvailabilitySlot, 
    deleteAvailabilitySlot 
  } = useAvailability();
  const { user } = useAuthRBAC();

  const [selectedWeek, setSelectedWeek] = useState(new Date());

  const createSlotForDate = async (date: Date, startTime: string, endTime: string) => {
    if (!user?.id) return;
    
    try {
      await createAvailabilitySlot.mutateAsync({
        slot_date: format(date, 'yyyy-MM-dd'),
        slot_start_time: startTime,
        slot_end_time: endTime,
        is_available: true,
        slot_type: 'regular',
        max_bookings: 1,
        current_bookings: 0
      });
    } catch (error) {
      console.error('Error creating availability slot:', error);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const handleWeekChange = (direction: number) => {
    setSelectedWeek(addDays(selectedWeek, direction * 7));
  };

  const weekDays = getWeekDays();

  const getSlotsForDay = (day: Date) => {
    return availability?.filter(slot => isSameDay(new Date(slot.slot_date), day)) || [];
  };

  const handleCreateSlot = (day: Date) => {
    const defaultStartTime = '09:00';
    const defaultEndTime = '17:00';
    createSlotForDate(day, defaultStartTime, defaultEndTime);
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await deleteAvailabilitySlot.mutateAsync(slotId);
    } catch (error) {
      console.error('Error deleting availability slot:', error);
    }
  };

  const handleToggleAvailability = async (slotId: string, isCurrentlyAvailable: boolean) => {
    try {
      const slot = availability?.find(slot => slot.id === slotId);
      if (!slot) {
        console.error('Slot not found for ID:', slotId);
        return;
      }
      
      await updateAvailabilitySlot.mutateAsync({
        id: slotId,
        is_available: !isCurrentlyAvailable
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability Manager</CardTitle>
        <CardDescription>Manage your availability slots for the week.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Button variant="outline" onClick={() => handleWeekChange(-1)}>
            Previous Week
          </Button>
          <h2>{format(weekDays[0], 'MMMM d')} - {format(weekDays[6], 'MMMM d, yyyy')}</h2>
          <Button variant="outline" onClick={() => handleWeekChange(1)}>
            Next Week
          </Button>
        </div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="mb-4">
            <h3>{format(day, 'EEEE, MMMM d')}</h3>
            <ul className="list-none pl-0">
              {getSlotsForDay(day).map(slot => (
                <li key={slot.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <span>{slot.slot_start_time} - {slot.slot_end_time}</span>
                  <div>
                    <Badge variant={slot.is_available ? 'default' : 'secondary'}>
                      {slot.is_available ? 'Available' : 'Unavailable'}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleToggleAvailability(slot.id, slot.is_available)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Toggle
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="ghost" onClick={() => handleCreateSlot(day)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeeklyAvailabilityManager;
