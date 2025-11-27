
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Clipboard, Calendar } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

interface AvailabilitySlot {
  id: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  slot_type: 'regular' | 'emergency' | 'consultation';
  max_bookings: number;
  is_available: boolean;
  current_bookings: number;
  notes: string | null;
}

interface CopyPasteManagerProps {
  currentWeek: Date;
  slots: AvailabilitySlot[];
  onCopyDay: (date: string, slots: AvailabilitySlot[]) => void;
  onPasteDay: (targetDate: string, sourceSlots: AvailabilitySlot[]) => Promise<void>;
  onCopyWeek: (weekStart: Date, slots: AvailabilitySlot[]) => void;
  onPasteWeek: (targetWeekStart: Date, sourceSlots: AvailabilitySlot[]) => Promise<void>;
}

const CopyPasteManager: React.FC<CopyPasteManagerProps> = ({
  currentWeek,
  slots,
  onCopyDay,
  onPasteDay,
  onCopyWeek,
  onPasteWeek
}) => {
  const [copiedData, setCopiedData] = useState<{
    type: 'day' | 'week';
    date: string;
    slots: AvailabilitySlot[];
  } | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getDaySlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return slots.filter(slot => slot.slot_date === dateStr);
  };

  const getWeekSlots = (weekStart: Date) => {
    const weekEnd = addDays(weekStart, 6);
    const startStr = format(weekStart, 'yyyy-MM-dd');
    const endStr = format(weekEnd, 'yyyy-MM-dd');
    return slots.filter(slot => slot.slot_date >= startStr && slot.slot_date <= endStr);
  };

  const handleCopyDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const daySlots = getDaySlots(date);
    
    setCopiedData({
      type: 'day',
      date: dateStr,
      slots: daySlots
    });
    
    onCopyDay(dateStr, daySlots);
  };

  const handlePasteDay = async (targetDate: Date) => {
    if (!copiedData || copiedData.type !== 'day') return;
    
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    await onPasteDay(targetDateStr, copiedData.slots);
  };

  const handleCopyWeek = () => {
    const weekSlots = getWeekSlots(weekStart);
    
    setCopiedData({
      type: 'week',
      date: format(weekStart, 'yyyy-MM-dd'),
      slots: weekSlots
    });
    
    onCopyWeek(weekStart, weekSlots);
  };

  const handlePasteWeek = async () => {
    if (!copiedData || copiedData.type !== 'week') return;
    
    await onPasteWeek(weekStart, copiedData.slots);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Copy/Paste Week */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyWeek}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Week
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePasteWeek}
            disabled={!copiedData || copiedData.type !== 'week'}
            className="flex items-center gap-2"
          >
            <Clipboard className="h-4 w-4" />
            Paste Week
          </Button>
          
          {copiedData?.type === 'week' && (
            <Badge variant="secondary" className="text-xs">
              Copied week from {format(new Date(copiedData.date), 'MMM d')}
            </Badge>
          )}
        </div>

        {/* Copy/Paste Individual Days */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Copy/Paste Days</div>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => {
              const daySlots = getDaySlots(day);
              const hasCopiedDay = copiedData?.type === 'day';
              
              return (
                <div key={index} className="space-y-1">
                  <div className="text-xs text-center font-medium">
                    {format(day, 'EEE')}
                  </div>
                  <div className="text-xs text-center text-gray-500">
                    {format(day, 'M/d')}
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyDay(day)}
                          className="h-6 w-full p-0"
                          disabled={daySlots.length === 0}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy {daySlots.length} slots from {format(day, 'MMM d')}</p>
                      </TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePasteDay(day)}
                          disabled={!hasCopiedDay}
                          className="h-6 w-full p-0"
                        >
                          <Clipboard className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {hasCopiedDay 
                            ? `Paste ${copiedData.slots.length} slots to ${format(day, 'MMM d')}`
                            : 'No day copied'
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <div className="text-xs text-center text-gray-500">
                    {daySlots.length} slots
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {copiedData?.type === 'day' && (
          <Badge variant="secondary" className="text-xs">
            Copied {copiedData.slots.length} slots from {format(new Date(copiedData.date), 'MMM d')}
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
};

export default CopyPasteManager;
