
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import type { BookingData } from "../ScheduleAppointmentModal";

interface DateSelectionTabProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const DateSelectionTab: React.FC<DateSelectionTabProps> = ({
  bookingData,
  updateBookingData,
  onNext,
  onPrevious,
}) => {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      updateBookingData({ selectedDate: date });
    }
  };

  const handleContinue = () => {
    if (bookingData.selectedDate) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Select a Date</h3>
        <p className="text-sm text-muted-foreground">
          Choose an available date for your appointment
        </p>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={bookingData.selectedDate}
          onSelect={handleDateSelect}
          disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
          className="rounded-md border pointer-events-auto"
        />
      </div>

      {bookingData.selectedDate && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Selected: {format(bookingData.selectedDate, 'EEEE, MMMM do, yyyy')}
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
          disabled={!bookingData.selectedDate}
        >
          Continue
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default DateSelectionTab;
