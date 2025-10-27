
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimeZoneSelector from './TimeZoneSelector';
import { formatInUserTimeZone } from '@/utils/timezone';

interface CalendarHeaderProps {
  selectedDate: Date;
  view: 'day' | 'week' | 'month';
  timeZone: string;
  onDateChange: (direction: 'prev' | 'next') => void;
  onViewChange: (view: 'day' | 'week' | 'month') => void;
  onTimeZoneChange: (timeZone: string) => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  selectedDate,
  view,
  timeZone,
  onDateChange,
  onViewChange,
  onTimeZoneChange
}) => {
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-4">
      <div className="flex items-center gap-2">
        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-medium">Calendar</h2>
      </div>
      
      <div className="flex flex-wrap items-center gap-2 md:gap-4">
        <div className="flex items-center">
          <Button variant="outline" size="sm" onClick={() => onDateChange('prev')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-medium mx-2">
            {formatInUserTimeZone(selectedDate, view === 'month' ? 'MMMM yyyy' : 'MMM d, yyyy', timeZone)}
          </div>
          <Button variant="outline" size="sm" onClick={() => onDateChange('next')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <TimeZoneSelector 
            value={timeZone} 
            onChange={onTimeZoneChange} 
          />
          <Tabs value={view} onValueChange={(v: any) => onViewChange(v)}>
            <TabsList>
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader;
