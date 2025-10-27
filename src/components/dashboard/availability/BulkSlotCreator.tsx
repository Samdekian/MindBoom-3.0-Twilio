
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAvailability } from '@/hooks/use-availability';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { format, addDays, startOfWeek } from 'date-fns';
import { Calendar, Clock, Plus } from 'lucide-react';

const BulkSlotCreator: React.FC = () => {
  const { createAvailabilitySlot } = useAvailability();
  const { user } = useAuthRBAC();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const handleBulkCreate = async () => {
    if (!user?.id) return;
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = start; date <= end; date = addDays(date, 1)) {
        if (selectedDays.includes(date.getDay())) {
          await createAvailabilitySlot.mutateAsync({
            slot_date: format(date, 'yyyy-MM-dd'),
            slot_start_time: startTime,
            slot_end_time: endTime,
            is_available: true,
            slot_type: 'regular',
            max_bookings: 1,
            current_bookings: 0
          });
        }
      }
    } catch (error) {
      console.error('Error creating bulk slots:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Availability Slot Creator</CardTitle>
        <CardDescription>Create multiple availability slots at once.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="start-date">Start Date</Label>
          <Input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="end-date">End Date</Label>
          <Input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex space-x-4">
          <div>
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              type="time"
              id="start-time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="end-time">End Time</Label>
            <Input
              type="time"
              id="end-time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label>Select Days of the Week</Label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 0].map((day) => (
              <div key={day} className="flex items-center space-x-1">
                <Checkbox
                  id={`day-${day}`}
                  checked={selectedDays.includes(day)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedDays([...selectedDays, day]);
                    } else {
                      setSelectedDays(selectedDays.filter((d) => d !== day));
                    }
                  }}
                />
                <Label htmlFor={`day-${day}`}>
                  {format(addDays(startOfWeek(new Date()), day), 'EEE')}
                </Label>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={handleBulkCreate} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Create Slots
        </Button>
      </CardContent>
    </Card>
  );
};

export default BulkSlotCreator;
