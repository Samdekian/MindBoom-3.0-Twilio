
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { addDays, isBefore, startOfDay } from 'date-fns';
import StepInstructions from './StepInstructions';
import { cn } from '@/lib/utils';

interface DateSelectorProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date | null;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onDateSelect, selectedDate }) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate ? new Date(selectedDate) : undefined);
  const today = startOfDay(new Date());
  const twoMonthsFromNow = addDays(today, 60);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      onDateSelect(date);
    }
  };

  return (
    <Card>
      <CardContent className="pt-4">
        <StepInstructions instructions="Select a date for your appointment. Available days are highlighted and you can choose any date within the next 60 days." />
        
        <div className="relative">
          {date && (
            <div className="absolute -top-1 -right-1 z-10 bg-green-500 text-white text-xs px-2.5 py-1 rounded-full font-medium animate-fade-in">
              Date Selected
            </div>
          )}
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            fromDate={today}
            toDate={twoMonthsFromNow}
            disabled={(date) => isBefore(date, today)}
            className={cn(
              "rounded-md border", 
              date ? "ring-2 ring-primary ring-offset-2 transition-all duration-300" : ""
            )}
            classNames={{
              day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground scale-110 transition-transform"
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DateSelector;
