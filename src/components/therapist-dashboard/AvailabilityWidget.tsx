import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTherapistAvailability } from '@/hooks/use-therapist-availability';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Clock, Calendar, Plus } from 'lucide-react';

const AvailabilityWidget: React.FC = () => {
  const { 
    availabilitySlots, 
    isLoading, 
    error 
  } = useTherapistAvailability();

  const weeklyAvailability = availabilitySlots?.filter(slot => {
    const slotDate = new Date(slot.slot_date);
    const currentWeek = startOfWeek(new Date());
    return slotDate >= currentWeek && slotDate < addDays(currentWeek, 7);
  });
  const currentWeekSlots = weeklyAvailability;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Availability</CardTitle>
        <CardDescription>Manage your availability for the week</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading availability...</div>
        ) : error ? (
          <div>Error: {error.message}</div>
        ) : (
          <div className="space-y-2">
            {currentWeekSlots?.map(slot => (
              <div key={slot.id} className="flex items-center justify-between">
                <span>
                  {format(new Date(slot.slot_date), 'EEE, MMM d')}: {slot.slot_start_time} - {slot.slot_end_time}
                </span>
                <Badge variant={slot.is_available ? "default" : "secondary"}>
                  {slot.is_available ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            ))}
            {currentWeekSlots?.length === 0 && (
              <div>No availability slots for this week.</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityWidget;
