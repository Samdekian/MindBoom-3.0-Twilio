import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import TimeSlotBlock from "./TimeSlotBlock";
import QuickEditPopover from "./QuickEditPopover";

interface DraggableTimeSlotProps {
  slot: {
    id: string;
    slot_start_time: string;
    slot_end_time: string;
    is_available: boolean;
    current_bookings: number;
    max_bookings: number;
    slot_type: 'regular' | 'emergency' | 'consultation';
    slot_date: string;
    notes: string | null;
  };
  isSelected: boolean;
  onSelect: () => void;
  onToggleAvailability: () => void;
  onQuickUpdate: (updates: any) => Promise<void>;
  onDelete?: () => Promise<void>;
  dayIndex: number;
  hourIndex: number;
}

const DraggableTimeSlot: React.FC<DraggableTimeSlotProps> = ({
  slot,
  isSelected,
  onSelect,
  onToggleAvailability,
  onQuickUpdate,
  onDelete,
  dayIndex,
  hourIndex
}) => {
  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    transform,
    isDragging
  } = useDraggable({
    id: slot.id,
    data: {
      slot,
      dayIndex,
      hourIndex
    }
  });

  const {
    setNodeRef: setDropRef,
    isOver
  } = useDroppable({
    id: `drop-${dayIndex}-${hourIndex}`,
    data: {
      dayIndex,
      hourIndex
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  const handleQuickEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setDropRef}
      className={`relative ${isOver ? 'bg-blue-50 ring-2 ring-blue-200' : ''}`}
    >
      <div
        ref={setDragRef}
        style={style}
        className={`cursor-move ${isDragging ? 'shadow-lg' : ''}`}
        {...attributes}
        {...listeners}
      >
        <QuickEditPopover
          slot={slot}
          onUpdate={onQuickUpdate}
          onDelete={onDelete}
        >
          <div onClick={handleQuickEdit}>
            <TimeSlotBlock
              slot={slot}
              isSelected={isSelected}
              onSelect={onSelect}
              onToggleAvailability={onToggleAvailability}
            />
          </div>
        </QuickEditPopover>
      </div>
    </div>
  );
};

export default DraggableTimeSlot;
