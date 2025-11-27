
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Save, Copy, Trash2 } from "lucide-react";
import { format, addDays, eachDayOfInterval } from "date-fns";
import DurationTemplateSelector from "./DurationTemplateSelector";

interface WeeklyTemplate {
  id: string;
  name: string;
  days: {
    [key: number]: {
      enabled: boolean;
      slots: Array<{
        startTime: string;
        endTime: string;
        duration: number;
        slotType: 'regular' | 'emergency' | 'consultation';
        maxBookings: number;
      }>;
    };
  };
}

interface WeeklyTemplateManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyTemplate: (template: WeeklyTemplate, startDate: Date, weekCount: number) => Promise<void>;
  currentWeek: Date;
}

const PRESET_TEMPLATES = [
  {
    name: "Morning Hours",
    timeRange: { start: "09:00", end: "12:00" },
    duration: 60
  },
  {
    name: "Afternoon Hours", 
    timeRange: { start: "13:00", end: "17:00" },
    duration: 60
  },
  {
    name: "Evening Hours",
    timeRange: { start: "18:00", end: "21:00" },
    duration: 60
  },
  {
    name: "Full Day",
    timeRange: { start: "09:00", end: "17:00" },
    duration: 60
  }
];

const WeeklyTemplateManager: React.FC<WeeklyTemplateManagerProps> = ({
  open,
  onOpenChange,
  onApplyTemplate,
  currentWeek
}) => {
  const { toast } = useToast();
  const [templateName, setTemplateName] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri default
  const [selectedPreset, setSelectedPreset] = useState(PRESET_TEMPLATES[0]);
  const [slotDuration, setSlotDuration] = useState(60);
  const [weekCount, setWeekCount] = useState(1);
  const [maxBookings, setMaxBookings] = useState(1);
  const [slotType, setSlotType] = useState<'regular' | 'emergency' | 'consultation'>('regular');

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayToggle = (dayIndex: number) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex]
    );
  };

  const generateTimeSlots = (startTime: string, endTime: string, duration: number) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    let current = new Date(start);
    
    while (current < end) {
      const slotStart = current.toTimeString().substring(0, 5);
      current.setMinutes(current.getMinutes() + duration);
      const slotEnd = current.toTimeString().substring(0, 5);
      
      if (current <= end) {
        slots.push({
          startTime: slotStart,
          endTime: slotEnd,
          duration,
          slotType,
          maxBookings
        });
      }
    }
    
    return slots;
  };

  const handleApplyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setSelectedPreset(preset);
  };

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive"
      });
      return;
    }

    if (selectedDays.length === 0) {
      toast({
        title: "Error", 
        description: "Please select at least one day",
        variant: "destructive"
      });
      return;
    }

    const slots = generateTimeSlots(
      selectedPreset.timeRange.start,
      selectedPreset.timeRange.end,
      slotDuration
    );

    const template: WeeklyTemplate = {
      id: Date.now().toString(),
      name: templateName,
      days: {}
    };

    selectedDays.forEach(dayIndex => {
      template.days[dayIndex] = {
        enabled: true,
        slots
      };
    });

    try {
      await onApplyTemplate(template, currentWeek, weekCount);
      
      toast({
        title: "Success",
        description: `Template "${templateName}" applied to ${weekCount} week${weekCount > 1 ? 's' : ''}`
      });
      
      // Reset form
      setTemplateName("");
      setSelectedDays([1, 2, 3, 4, 5]);
      setWeekCount(1);
      
      onOpenChange(false);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to apply template",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Template Manager
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Template Name */}
          <div className="space-y-2">
            <Label htmlFor="templateName">Template Name</Label>
            <Input
              id="templateName"
              placeholder="e.g., Standard Work Week"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <Label>Quick Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_TEMPLATES.map((preset) => (
                <Button
                  key={preset.name}
                  variant={selectedPreset.name === preset.name ? "default" : "outline"}
                  onClick={() => handleApplyPreset(preset)}
                  className="justify-start"
                >
                  {preset.name}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {preset.timeRange.start}-{preset.timeRange.end}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Duration Template Selector */}
          <DurationTemplateSelector
            selectedDuration={slotDuration}
            onDurationChange={setSlotDuration}
          />

          {/* Day Selection */}
          <div className="space-y-3">
            <Label>Select Days</Label>
            <div className="flex gap-2 flex-wrap">
              {dayNames.map((day, index) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${index}`}
                    checked={selectedDays.includes(index)}
                    onCheckedChange={() => handleDayToggle(index)}
                  />
                  <Label htmlFor={`day-${index}`} className="text-sm">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Slot Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Slot Type</Label>
              <select 
                value={slotType} 
                onChange={(e) => setSlotType(e.target.value as any)}
                className="w-full p-2 border rounded"
              >
                <option value="regular">Regular</option>
                <option value="emergency">Emergency</option>
                <option value="consultation">Consultation</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label>Max Bookings per Slot</Label>
              <Input
                type="number"
                min="1"
                value={maxBookings}
                onChange={(e) => setMaxBookings(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          {/* Apply to Multiple Weeks */}
          <div className="space-y-2">
            <Label htmlFor="weekCount">Apply to Number of Weeks</Label>
            <Input
              id="weekCount"
              type="number"
              min="1"
              max="12"
              value={weekCount}
              onChange={(e) => setWeekCount(parseInt(e.target.value) || 1)}
            />
            <p className="text-sm text-gray-500">
              Template will be applied starting from {format(currentWeek, 'MMM d, yyyy')}
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <p><strong>Days:</strong> {selectedDays.map(i => dayNames[i]).join(', ')}</p>
                <p><strong>Time:</strong> {selectedPreset.timeRange.start} - {selectedPreset.timeRange.end}</p>
                <p><strong>Duration:</strong> {slotDuration} minutes</p>
                <p><strong>Slots:</strong> {generateTimeSlots(selectedPreset.timeRange.start, selectedPreset.timeRange.end, slotDuration).length} per day</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Apply Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WeeklyTemplateManager;
