import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTherapistAvailability } from "@/hooks/use-therapist-availability";

const AvailabilityManager = () => {
  const { availabilitySlots, isLoading, createAvailabilitySlot, deleteAvailabilitySlot } = useTherapistAvailability();
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxBookings, setMaxBookings] = useState(1);
  const [notes, setNotes] = useState("");

  const handleDeleteSlot = (slotId: string) => {
    deleteAvailabilitySlot.mutate(slotId);
  };

  const handleAddSlot = () => {
    createAvailabilitySlot.mutate({
      slot_date: selectedDate,
      slot_start_time: startTime,
      slot_end_time: endTime,
      is_available: true,
      current_bookings: 0,
      slot_type: "regular",
      max_bookings: maxBookings,
      notes: notes,
    });
    
    // Reset form
    setSelectedDate("");
    setStartTime("");
    setEndTime("");
    setMaxBookings(1);
    setNotes("");
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Availability Manager</h2>

      <Card className="mb-4">
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    {selectedDate ? (
                      format(new Date(selectedDate), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center" side="bottom">
                  <Calendar
                    mode="single"
                    selected={selectedDate ? new Date(selectedDate) : undefined}
                    onSelect={(date) => setSelectedDate(date ? format(date, 'yyyy-MM-dd') : "")}
                    disabled={(date) =>
                      date > new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="maxBookings">Max Bookings</Label>
              <Input
                type="number"
                id="maxBookings"
                value={maxBookings}
                onChange={(e) => setMaxBookings(parseInt(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for this slot"
            />
          </div>

          <Button onClick={handleAddSlot} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Slot"}
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-xl font-semibold mb-2">Available Slots</h3>
        {availabilitySlots && availabilitySlots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availabilitySlots.map((slot) => (
              <Card key={slot.id}>
                <CardContent>
                  <p>Date: {slot.slot_date}</p>
                  <p>Time: {slot.slot_start_time} - {slot.slot_end_time}</p>
                  <p>Max Bookings: {slot.max_bookings}</p>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteSlot(slot.id)} disabled={isLoading}>
                    {isLoading ? "Deleting..." : "Delete"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>No availability slots found.</p>
        )}
      </div>
    </div>
  );
};

export default AvailabilityManager;
