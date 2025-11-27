import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAvailability } from '@/hooks/use-availability';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Plus } from 'lucide-react';

const AvailabilityManager: React.FC = () => {
  const { 
    availability: availabilitySlots, 
    isLoading, 
    error, 
    createAvailabilitySlot, 
    updateAvailabilitySlot, 
    deleteAvailabilitySlot 
  } = useAvailability();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability Manager</CardTitle>
        <CardDescription>Manage your weekly availability slots</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="text-center">Loading availability...</div>
        ) : error ? (
          <div className="text-center text-red-500">Error: {error.message}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availabilitySlots?.map((slot) => (
              <Card key={slot.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <Clock className="inline-block h-4 w-4 mr-2" />
                    {slot.start_time} - {slot.end_time}
                    <Calendar className="inline-block h-4 w-4 ml-4 mr-2" />
                    {slot.date}
                  </div>
                  <Badge variant={slot.available ? "outline" : "secondary"}>
                    {slot.available ? "Available" : "Booked"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Availability Slot
        </Button>
      </CardContent>
    </Card>
  );
};

export default AvailabilityManager;
