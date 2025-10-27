
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUserTimeZone, getTimeZones } from '@/utils/timezone';

interface TimeZoneSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({ value, onChange }) => {
  const [timeZones, setTimeZones] = useState<{value: string, label: string}[]>([]);
  
  useEffect(() => {
    // Load time zones
    setTimeZones(getTimeZones());
  }, []);

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-sm font-medium text-muted-foreground">Time Zone</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select time zone" />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          <SelectGroup>
            {timeZones.map((tz) => (
              <SelectItem key={tz.value} value={tz.value}>
                {tz.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TimeZoneSelector;
