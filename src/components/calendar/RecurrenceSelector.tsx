
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

export interface RecurrenceSelectorProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  onRecurrenceChange?: (newRecurrence: { rule: string | null; endDate: Date | null }) => void;
}

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({ 
  value = "none", 
  onChange,
  onRecurrenceChange,
  className
}) => {
  // Calculate default end date (3 months from now)
  const [endDate, setEndDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3);
    return date;
  });

  // When value changes, update parent component if onRecurrenceChange is provided
  useEffect(() => {
    if (onRecurrenceChange) {
      onRecurrenceChange({
        rule: value === "none" ? null : value,
        endDate: value === "none" ? null : endDate
      });
    }
  }, [value, endDate, onRecurrenceChange]);

  // Handle internal change and propagate to parent
  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
    
    if (onRecurrenceChange) {
      onRecurrenceChange({
        rule: newValue === "none" ? null : newValue,
        endDate: newValue === "none" ? null : endDate
      });
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="recurrence">Repeat</Label>
      <Select 
        value={value} 
        onValueChange={handleChange}
      >
        <SelectTrigger id="recurrence">
          <SelectValue placeholder="No repeat" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No repeat</SelectItem>
          <SelectItem value="FREQ=DAILY">Daily</SelectItem>
          <SelectItem value="FREQ=WEEKLY">Weekly</SelectItem>
          <SelectItem value="FREQ=BIWEEKLY">Every two weeks</SelectItem>
          <SelectItem value="FREQ=MONTHLY">Monthly</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RecurrenceSelector;
export { RecurrenceSelector };
