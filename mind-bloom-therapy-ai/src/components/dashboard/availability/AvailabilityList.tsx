import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/use-availability';
import { Clock, Calendar, Edit, Trash2 } from 'lucide-react';

const AvailabilityList: React.FC = () => {
  const { 
    availability, 
    isLoading, 
    error, 
    updateAvailabilitySlot, 
    deleteAvailabilitySlot 
  } = useAvailability();

  const toggleSlotAvailability = async (slotId: string, currentStatus: boolean) => {
    try {
      await updateAvailabilitySlot.mutateAsync({
        id: slotId,
        is_available: !currentStatus
      });
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Slots</CardTitle>
        <CardDescription>Manage your available time slots for appointments</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading availability slots...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error.message}</p>
        ) : (
          <div className="space-y-4">
            {availability?.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between border rounded-md p-4">
                <div>
                  <Clock className="inline-block h-4 w-4 mr-2" />
                  {slot.start_time} - {slot.end_time}
                  <Calendar className="inline-block h-4 w-4 ml-4 mr-2" />
                  {slot.date}
                  <Badge className="ml-2">{slot.is_available ? 'Available' : 'Unavailable'}</Badge>
                </div>
                <div className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => toggleSlotAvailability(slot.id, slot.is_available)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Toggle
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteAvailabilitySlot.mutate(slot.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {availability?.length === 0 && <p>No availability slots found.</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AvailabilityList;
