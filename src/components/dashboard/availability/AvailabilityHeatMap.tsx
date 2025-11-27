
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

interface AvailabilitySlot {
  id: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  current_bookings: number;
  max_bookings: number;
  is_available: boolean;
}

interface AvailabilityHeatMapProps {
  slots: AvailabilitySlot[];
  currentWeek: Date;
}

const AvailabilityHeatMap: React.FC<AvailabilityHeatMapProps> = ({
  slots,
  currentWeek
}) => {
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  const getSlotDensity = (day: Date, hour: number): number => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const daySlots = slots.filter(slot => slot.slot_date === dayStr);
    
    const hourSlots = daySlots.filter(slot => {
      const startHour = parseInt(slot.slot_start_time.split(':')[0]);
      const endHour = parseInt(slot.slot_end_time.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
    
    if (hourSlots.length === 0) return 0;
    
    const totalSlots = hourSlots.length;
    const bookedSlots = hourSlots.reduce((sum, slot) => sum + slot.current_bookings, 0);
    const maxSlots = hourSlots.reduce((sum, slot) => sum + slot.max_bookings, 0);
    
    return maxSlots > 0 ? (bookedSlots / maxSlots) : 0;
  };

  const getDensityColor = (density: number): string => {
    if (density === 0) return 'bg-gray-100';
    if (density <= 0.3) return 'bg-green-200';
    if (density <= 0.6) return 'bg-yellow-200';
    if (density <= 0.8) return 'bg-orange-200';
    return 'bg-red-200';
  };

  const getDensityLabel = (density: number): string => {
    if (density === 0) return 'No slots';
    if (density <= 0.3) return 'Low demand';
    if (density <= 0.6) return 'Moderate demand';
    if (density <= 0.8) return 'High demand';
    return 'Fully booked';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Availability Heat Map
        </CardTitle>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-100 rounded"></div>
            <span>No slots</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-200 rounded"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span>Full</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-8 gap-1">
          {/* Header row */}
          <div className="text-xs font-medium text-center py-2">Time</div>
          {weekDays.map((day, index) => (
            <div key={index} className="text-xs font-medium text-center py-2">
              <div>{format(day, 'EEE')}</div>
              <div className="text-gray-500">{format(day, 'M/d')}</div>
            </div>
          ))}
          
          {/* Time slots */}
          {timeSlots.map(hour => (
            <div key={hour}>
              <div className="text-xs text-gray-500 py-1 text-center">
                {hour}:00
              </div>
              {weekDays.map((day, dayIndex) => {
                const density = getSlotDensity(day, hour);
                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    className={`h-8 rounded border ${getDensityColor(density)} cursor-pointer transition-colors hover:opacity-80`}
                    title={`${format(day, 'MMM d')} ${hour}:00 - ${getDensityLabel(density)}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Weekly summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {slots.filter(slot => slot.current_bookings === 0).length}
              </div>
              <div className="text-xs text-gray-500">Available Slots</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">
                {slots.reduce((sum, slot) => sum + slot.current_bookings, 0)}
              </div>
              <div className="text-xs text-gray-500">Total Bookings</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">
                {Math.round(slots.reduce((sum, slot) => sum + (slot.current_bookings / slot.max_bookings), 0) / slots.length * 100) || 0}%
              </div>
              <div className="text-xs text-gray-500">Utilization</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvailabilityHeatMap;
