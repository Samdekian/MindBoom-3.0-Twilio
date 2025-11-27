import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useTherapistAvailability } from "@/hooks/use-therapist-availability";

const AddAvailabilityForm = () => {
  const { createAvailabilitySlot } = useTherapistAvailability();

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [maxBookings, setMaxBookings] = useState(1);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createAvailabilitySlot.mutate({
      slot_date: date,
      slot_start_time: startTime,
      slot_end_time: endTime,
      is_available: true,
      current_bookings: 0,
      slot_type: "regular",
      max_bookings: maxBookings,
      notes: notes,
    });

    // Reset form
    setDate("");
    setStartTime("");
    setEndTime("");
    setMaxBookings(1);
    setNotes("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          type="date"
          id="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="startTime">Start Time</Label>
        <Input
          type="time"
          id="startTime"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="endTime">End Time</Label>
        <Input
          type="time"
          id="endTime"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="maxBookings">Max Bookings</Label>
        <Input
          type="number"
          id="maxBookings"
          value={maxBookings}
          onChange={(e) => setMaxBookings(Number(e.target.value))}
          min="1"
          required
        />
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
      <Button type="submit">Add Availability</Button>
    </form>
  );
};

export default AddAvailabilityForm;
