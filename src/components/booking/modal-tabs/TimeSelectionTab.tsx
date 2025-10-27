
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingData } from "../ScheduleAppointmentModal";

interface TimeSelectionTabProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const TimeSelectionTab: React.FC<TimeSelectionTabProps> = ({
  bookingData,
  updateBookingData,
  onNext,
  onPrevious,
}) => {
  const handleTimeSelect = (time: string) => {
    updateBookingData({ selectedTime: time });
  };

  const handleContinue = () => {
    if (bookingData.selectedTime) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Select a Time</h3>
        <p className="text-sm text-muted-foreground">
          Choose an available time slot for your appointment
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((time) => (
              <Button
                key={time}
                variant={bookingData.selectedTime === time ? "default" : "outline"}
                className={cn(
                  "h-12 text-sm",
                  bookingData.selectedTime === time && "ring-2 ring-primary"
                )}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {bookingData.selectedTime && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Selected time: {bookingData.selectedTime}
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button 
          onClick={handleContinue}
          disabled={!bookingData.selectedTime}
        >
          Continue
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default TimeSelectionTab;
