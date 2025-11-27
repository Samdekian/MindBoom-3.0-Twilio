
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimeZone } from '@/contexts/TimeZoneContext';
import { useTherapistList } from '@/hooks/use-therapist-list';
import { useTherapistAvailability } from '@/hooks/useAvailability';
import TherapistSelector from './TherapistSelector';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import SummarySection from './SummarySection';
import BookingProgressIndicator, { BookingStep } from '@/components/booking/BookingProgressIndicator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Check, CircleCheck } from 'lucide-react';

export interface BookingCalendarSectionProps {
  therapistId?: string;
  onBookingStart?: () => Promise<void>;
  onBookingSuccess?: (appointmentId: string) => void;
  onBookingError?: (errorMessage: string) => void;
}

const BookingCalendarSection: React.FC<BookingCalendarSectionProps> = ({
  therapistId: initialTherapistId,
  onBookingStart,
  onBookingSuccess,
  onBookingError
}) => {
  // States for tracking selections
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(initialTherapistId || null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("therapist");
  
  // Context and hooks
  const { timeZone } = useTimeZone();
  const { therapists, isLoading: isLoadingTherapists, error: therapistError } = useTherapistList();
  const { availableTimeSlots, isLoading: isLoadingAvailability, error: availabilityError } = 
    useTherapistAvailability(selectedTherapist || '', selectedDate || new Date());
  const { toast } = useToast();

  // Define booking steps
  const steps: BookingStep[] = [
    { 
      id: "therapist", 
      label: "Therapist", 
      completed: !!selectedTherapist, 
      active: activeTab === "therapist" 
    },
    { 
      id: "date", 
      label: "Date", 
      completed: !!selectedDate, 
      active: activeTab === "date" 
    },
    { 
      id: "time", 
      label: "Time", 
      completed: !!selectedTime, 
      active: activeTab === "time" 
    },
    { 
      id: "summary", 
      label: "Summary", 
      completed: false, 
      active: activeTab === "summary" 
    }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === activeTab);

  // Effect to auto-advance tabs when selection is made
  useEffect(() => {
    if (selectedTherapist && activeTab === "therapist") {
      setTimeout(() => {
        setActiveTab("date");
        toast({ 
          title: "Therapist Selected", 
          description: "Please choose an available date for your appointment.",
          variant: "success"
        });
      }, 300); // Short delay for animation
    }
  }, [selectedTherapist, activeTab, toast]);

  useEffect(() => {
    if (selectedDate && activeTab === "date") {
      setTimeout(() => {
        setActiveTab("time");
        toast({ 
          title: "Date Selected", 
          description: "Please choose an available time slot.",
          variant: "success"
        });
      }, 300); // Short delay for animation
    }
  }, [selectedDate, activeTab, toast]);

  useEffect(() => {
    if (selectedTime && activeTab === "time") {
      setTimeout(() => {
        setActiveTab("summary");
        toast({ 
          title: "Time Selected", 
          description: "Please review your appointment details.",
          variant: "success"
        });
      }, 300); // Short delay for animation
    }
  }, [selectedTime, activeTab, toast]);

  // Handle selection actions
  const handleTherapistSelect = (therapistId: string) => {
    setSelectedTherapist(therapistId);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  // Handle manual tab navigation
  const handleTabChange = (value: string) => {
    // Allow manual tab navigation only to completed steps or the current next step
    const targetStepIndex = steps.findIndex(step => step.id === value);
    const canNavigate = steps[targetStepIndex].completed || 
      (targetStepIndex <= currentStepIndex + 1 && targetStepIndex > 0 ? 
        steps[targetStepIndex - 1].completed : true);
      
    if (canNavigate) {
      setActiveTab(value);
    }
  };

  return (
    <Card className="transition-all duration-300">
      <CardHeader>
        <CardTitle>Book Your Appointment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Indicator */}
        <BookingProgressIndicator 
          steps={steps}
          currentStepIndex={currentStepIndex}
          variant="line"
          className="mb-6"
        />
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger 
              value="therapist"
              className={cn(
                steps[0].completed && "text-primary border-b-2 border-primary",
                "transition-all duration-300 group"
              )}
            >
              <div className="flex items-center">
                {steps[0].completed && <CircleCheck className="h-4 w-4 mr-1 text-green-500 animate-[pulse_2s_ease-in-out_infinite]" />}
                Therapist
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="date" 
              disabled={!selectedTherapist}
              className={cn(
                steps[1].completed && "text-primary border-b-2 border-primary",
                "transition-all duration-300"
              )}
            >
              <div className="flex items-center">
                {steps[1].completed && <CircleCheck className="h-4 w-4 mr-1 text-green-500 animate-[pulse_2s_ease-in-out_infinite]" />}
                Date
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="time" 
              disabled={!selectedDate}
              className={cn(
                steps[2].completed && "text-primary border-b-2 border-primary",
                "transition-all duration-300"
              )}
            >
              <div className="flex items-center">
                {steps[2].completed && <CircleCheck className="h-4 w-4 mr-1 text-green-500 animate-[pulse_2s_ease-in-out_infinite]" />}
                Time
              </div>
            </TabsTrigger>
            
            <TabsTrigger 
              value="summary" 
              disabled={!selectedTime}
              className={cn(
                steps[3].completed && "text-primary border-b-2 border-primary",
                "transition-all duration-300"
              )}
            >
              Summary
            </TabsTrigger>
          </TabsList>
          
          {/* Tab Contents with enhanced visual feedback */}
          <TabsContent value="therapist" className="space-y-2 animate-fade-in">
            <TherapistSelector
              therapists={therapists}
              isLoading={isLoadingTherapists}
              error={therapistError}
              onTherapistSelect={handleTherapistSelect}
              selectedTherapistId={selectedTherapist || undefined}
            />
          </TabsContent>
          
          <TabsContent value="date" className="space-y-2 animate-fade-in">
            {selectedTherapist ? (
              <DateSelector 
                onDateSelect={handleDateSelect} 
                selectedDate={selectedDate}
              />
            ) : (
              <p className="text-muted-foreground">Please select a therapist first.</p>
            )}
          </TabsContent>
          
          <TabsContent value="time" className="space-y-2 animate-fade-in">
            {selectedDate ? (
              <TimeSelector
                availableTimeSlots={availableTimeSlots || []}
                isLoading={isLoadingAvailability}
                error={availabilityError}
                onTimeSelect={handleTimeSelect}
                selectedTime={selectedTime}
              />
            ) : (
              <p className="text-muted-foreground">Please select a date first.</p>
            )}
          </TabsContent>
          
          <TabsContent value="summary" className="space-y-2 animate-fade-in">
            {selectedTime ? (
              <SummarySection
                therapistId={selectedTherapist}
                date={selectedDate}
                time={selectedTime}
                onBookingStart={onBookingStart}
                onBookingSuccess={onBookingSuccess}
                onBookingError={onBookingError}
              />
            ) : (
              <p className="text-muted-foreground">Please select a time first.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BookingCalendarSection;
