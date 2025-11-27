
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface TimeSlotBlockProps {
  slot: {
    id: string;
    slot_start_time: string;
    slot_end_time: string;
    is_available: boolean;
    current_bookings: number;
    max_bookings: number;
    slot_type: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onToggleAvailability: () => void;
}

const TimeSlotBlock: React.FC<TimeSlotBlockProps> = ({
  slot,
  isSelected,
  onSelect,
  onToggleAvailability
}) => {
  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:MM format
  };

  const getSlotColor = () => {
    if (!slot.is_available) return 'bg-gray-200 border-gray-300';
    if (slot.current_bookings >= slot.max_bookings) return 'bg-red-100 border-red-300';
    if (slot.current_bookings > 0) return 'bg-yellow-100 border-yellow-300';
    return 'bg-green-100 border-green-300';
  };

  const getSlotTypeColor = () => {
    switch (slot.slot_type) {
      case 'emergency': return 'bg-red-500';
      case 'consultation': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div
      className={cn(
        "absolute inset-0 p-1 border rounded cursor-pointer transition-all hover:shadow-sm",
        getSlotColor(),
        isSelected && "ring-2 ring-blue-500 ring-offset-1"
      )}
      onClick={onToggleAvailability}
    >
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">
            {formatTime(slot.slot_start_time)} - {formatTime(slot.slot_end_time)}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {slot.current_bookings}/{slot.max_bookings}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => {
              if (checked !== isSelected) {
                onSelect();
              }
            }}
            onClick={(e) => e.stopPropagation()}
            className="h-3 w-3"
          />
          
          {slot.slot_type !== 'regular' && (
            <div 
              className={cn("w-2 h-2 rounded-full", getSlotTypeColor())}
              title={slot.slot_type}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TimeSlotBlock;
