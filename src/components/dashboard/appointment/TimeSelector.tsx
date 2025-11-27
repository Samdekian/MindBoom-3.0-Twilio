
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, AlertCircle, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatTimeToAmPm } from '@/utils/time-formatter';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import StepInstructions from './StepInstructions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TimeSelectorProps {
  availableTimeSlots: string[];
  isLoading: boolean;
  error: Error | null;
  onTimeSelect: (time: string) => void;
  selectedTime?: string | null;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  availableTimeSlots,
  isLoading,
  error,
  onTimeSelect,
  selectedTime
}) => {
  const [localSelectedTime, setLocalSelectedTime] = useState<string | null>(selectedTime || null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTime) {
      setLocalSelectedTime(selectedTime);
    }
  }, [selectedTime]);

  const handleTimeSelect = (timeSlot: string) => {
    setLocalSelectedTime(timeSlot);
    onTimeSelect(timeSlot);
    
    toast({
      title: "Time Selected",
      description: `You've selected ${formatTimeToAmPm(timeSlot)}`,
      variant: "success",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || "Error loading available time slots"}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4">
        <StepInstructions 
          instructions="Choose a time slot for your appointment. Available times are shown below based on your therapist's schedule."
        />
        
        <h3 className="font-medium mb-3">Select a Time</h3>
        {availableTimeSlots.length > 0 ? (
          <ScrollArea className="h-64">
            <div className="grid grid-cols-2 gap-2">
              <TooltipProvider>
                {availableTimeSlots.map((timeSlot) => (
                  <Tooltip key={timeSlot} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <Button
                        key={timeSlot}
                        variant={localSelectedTime === timeSlot ? "default" : "outline"}
                        className={cn(
                          "h-10 transition-all duration-200 relative",
                          localSelectedTime === timeSlot ? 
                            "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 scale-105" : 
                            "hover:scale-105"
                        )}
                        onClick={() => handleTimeSelect(timeSlot)}
                      >
                        {formatTimeToAmPm(timeSlot)}
                        {localSelectedTime === timeSlot && (
                          <Check className="h-4 w-4 absolute top-1 right-1" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>50-minute session at {formatTimeToAmPm(timeSlot)}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="mx-auto h-8 w-8 mb-2 opacity-50" />
            <p>No available time slots for this date.</p>
            <p className="text-sm mt-1">Please select another date.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSelector;
