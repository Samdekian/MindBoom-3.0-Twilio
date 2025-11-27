import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Video, Calendar as CalendarIcon, CheckCircle } from "lucide-react";
import { format, addDays, setHours, setMinutes } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface OnboardingScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string;
}

export const OnboardingScheduleModal: React.FC<OnboardingScheduleModalProps> = ({
  isOpen,
  onClose,
  therapistId,
}) => {
  const { user } = useAuthRBAC();
  const { markStepComplete, setStep } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Get therapist info
  const { data: therapist } = useQuery({
    queryKey: ['therapist', therapistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', therapistId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!therapistId,
  });

  // Available time slots (simplified for onboarding)
  const timeSlots = [
    "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"
  ];

  const bookAppointmentMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedDate || !selectedTime) {
        throw new Error("Missing required information");
      }

      const [hours, minutes] = selectedTime.split(':').map(Number);
      const startTime = setMinutes(setHours(selectedDate, hours), minutes);
      const endTime = setMinutes(setHours(selectedDate, hours + 1), minutes); // 1 hour session

      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: user.id,
          therapist_id: therapistId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          title: 'Initial Consultation',
          appointment_type: 'video',
          is_initial_consultation: true,
          status: 'scheduled',
          video_enabled: true,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Session Scheduled!",
        description: "Your first consultation has been booked successfully.",
      });
      
      // Invalidate queries to update onboarding status
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['patient-dashboard-stats'] });
      
      // Mark step complete and move to next step
      markStepComplete('hasScheduledFirstSession');
      setStep('goals');
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookSession = () => {
    bookAppointmentMutation.mutate();
  };

  // Disable past dates and weekends for simplicity
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0 || date.getDay() === 6;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Schedule Your First Session
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Book your initial consultation with {therapist?.full_name || 'your therapist'}
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose a Date</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={isDateDisabled}
                fromDate={new Date()}
                toDate={addDays(new Date(), 30)}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Time Selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose a Time</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDate ? (
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className="justify-center"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Please select a date first
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Session Info */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  About Your First Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>60-minute initial consultation</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Video call from the comfort of your home</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Discuss your goals and create a treatment plan</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>No commitment - see if it's a good fit</span>
                </div>
              </CardContent>
            </Card>

            {/* Summary & Book Button */}
            {selectedDate && selectedTime && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <h3 className="font-medium text-green-800 mb-2">Session Summary</h3>
                  <div className="space-y-1 text-sm text-green-700">
                    <p><span className="font-medium">Date:</span> {format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                    <p><span className="font-medium">Time:</span> {selectedTime}</p>
                    <p><span className="font-medium">Duration:</span> 60 minutes</p>
                    <p><span className="font-medium">Type:</span> Video Call</p>
                  </div>
                  <Button 
                    className="w-full mt-4" 
                    onClick={handleBookSession}
                    disabled={bookAppointmentMutation.isPending}
                  >
                    {bookAppointmentMutation.isPending ? 'Booking...' : 'Book This Session'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Preparation Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Preparing for Your First Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">What to Expect:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Introductions and getting to know each other</li>
                  <li>• Discussion of your concerns and goals</li>
                  <li>• Overview of therapy approaches</li>
                  <li>• Q&A about the process</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">How to Prepare:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Think about what brought you to therapy</li>
                  <li>• Consider your hopes and goals</li>
                  <li>• Prepare any questions you have</li>
                  <li>• Find a quiet, private space</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};