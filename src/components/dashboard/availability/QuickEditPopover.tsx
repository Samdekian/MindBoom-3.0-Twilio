
import React, { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Save, X, Clock, Calendar } from "lucide-react";

interface AvailabilitySlot {
  id: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  is_available: boolean;
  slot_type: 'regular' | 'emergency' | 'consultation';
  max_bookings: number;
  current_bookings: number;
  notes: string | null;
}

interface QuickEditPopoverProps {
  slot: AvailabilitySlot;
  children: React.ReactNode;
  onUpdate: (updates: Partial<AvailabilitySlot>) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const QuickEditPopover: React.FC<QuickEditPopoverProps> = ({
  slot,
  children,
  onUpdate,
  onDelete
}) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    slot_start_time: slot.slot_start_time,
    slot_end_time: slot.slot_end_time,
    is_available: slot.is_available,
    slot_type: slot.slot_type,
    max_bookings: slot.max_bookings,
    notes: slot.notes || ''
  });
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onUpdate(formData);
      setOpen(false);
      toast({
        title: "Success",
        description: "Slot updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update slot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    setIsLoading(true);
    try {
      await onDelete();
      setOpen(false);
      toast({
        title: "Success",
        description: "Slot deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete slot",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = () => {
    const start = new Date(`2000-01-01T${formData.slot_start_time}:00`);
    const end = new Date(`2000-01-01T${formData.slot_end_time}:00`);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return diffMinutes > 0 ? `${diffMinutes}min` : 'Invalid';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Quick Edit
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="start-time" className="text-xs">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.slot_start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, slot_start_time: e.target.value }))}
                className="text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-time" className="text-xs">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.slot_end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, slot_end_time: e.target.value }))}
                className="text-sm"
              />
            </div>
          </div>

          {/* Duration Display */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            Duration: {calculateDuration()}
          </div>

          {/* Slot Type */}
          <div className="space-y-2">
            <Label className="text-xs">Slot Type</Label>
            <Select 
              value={formData.slot_type} 
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, slot_type: value }))}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
                <SelectItem value="consultation">Consultation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Max Bookings */}
          <div className="space-y-2">
            <Label htmlFor="max-bookings" className="text-xs">Max Bookings</Label>
            <Input
              id="max-bookings"
              type="number"
              min="1"
              value={formData.max_bookings}
              onChange={(e) => setFormData(prev => ({ ...prev, max_bookings: parseInt(e.target.value) || 1 }))}
              className="text-sm"
            />
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is-available" className="text-xs">Available</Label>
            <Switch
              id="is-available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-xs">Notes</Label>
            <Input
              id="notes"
              placeholder="Add notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="text-xs"
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isLoading}
                className="text-xs"
              >
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QuickEditPopover;
