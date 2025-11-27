
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAvailability } from '@/hooks/use-availability';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock } from 'lucide-react';

interface AddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddAvailabilityModal: React.FC<AddAvailabilityModalProps> = ({ isOpen, onClose }) => {
  const { createAvailabilitySlot } = useAvailability();
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "User not authenticated.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await createAvailabilitySlot.mutateAsync({
        slot_date: date,
        slot_start_time: startTime,
        slot_end_time: endTime,
        is_available: true,
        slot_type: 'regular',
        max_bookings: 1,
        current_bookings: 0
      });
      
      toast({
        title: "Availability Added",
        description: "Your availability has been successfully added.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add availability. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Availability</DialogTitle>
          <DialogDescription>
            Add a new availability slot for your schedule.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Start Time
            </Label>
            <Input
              type="time"
              id="startTime"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              End Time
            </Label>
            <Input
              type="time"
              id="endTime"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
        </form>
        <DialogFooter>
          <Button type="button" onClick={handleSubmit}>Add Availability</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddAvailabilityModal;
