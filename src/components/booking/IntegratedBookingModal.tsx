import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, CalendarDays, Clock, User, Video, CheckCircle } from 'lucide-react';
import { useTherapistAvailability } from '@/hooks/use-therapist-availability';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, isAfter, isSameDay, addMinutes, parseISO } from 'date-fns';

interface IntegratedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string;
  therapistName: string;
  patientId?: string;
  inquiryId?: string;
  appointmentType?: 'consultation' | 'session';
}

interface AvailableSlot {
  id: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  is_available: boolean;
  current_bookings: number;
  max_bookings: number;
}

const IntegratedBookingModal: React.FC<IntegratedBookingModalProps> = ({
  isOpen,
  onClose,
  therapistId,
  therapistName,
  patientId,
  inquiryId,
  appointmentType = 'consultation'
}) => {
  const { availabilitySlots, isLoading } = useTherapistAvailability(therapistId);
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isBooking, setIsBooking] = useState(false);
  const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date');

  // Filter available slots
  const availableSlots = availabilitySlots.filter(slot => 
    slot.is_available && 
    slot.current_bookings < slot.max_bookings &&
    isAfter(new Date(`${slot.slot_date}T${slot.slot_start_time}`), new Date())
  );

  // Group slots by date
  const slotsByDate = availableSlots.reduce((acc, slot) => {
    const date = slot.slot_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, AvailableSlot[]>);

  const availableDates = Object.keys(slotsByDate).sort();
  const timeSlotsForSelectedDate = selectedDate ? slotsByDate[selectedDate] || [] : [];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
    setStep('time');
  };

  const handleTimeSelect = (slot: AvailableSlot) => {
    setSelectedSlot(slot);
    setStep('confirm');
  };

  const handleBackToDate = () => {
    setStep('date');
    setSelectedDate('');
    setSelectedSlot(null);
  };

  const handleBackToTime = () => {
    setStep('time');
    setSelectedSlot(null);
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot || !patientId) {
      toast({
        title: "Error",
        description: "Missing required information for booking",
        variant: "destructive"
      });
      return;
    }

    setIsBooking(true);

    try {
      // Calculate end time (assume 1 hour sessions)
      const startDateTime = new Date(`${selectedSlot.slot_date}T${selectedSlot.slot_start_time}`);
      const endDateTime = addMinutes(startDateTime, 60);

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
          therapist_id: therapistId,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          title: `${appointmentType === 'consultation' ? 'Initial Consultation' : 'Therapy Session'} with ${therapistName}`,
          description: appointmentType === 'consultation' 
            ? 'Initial consultation to discuss goals and treatment approach'
            : 'Therapy session',
          status: 'scheduled',
          appointment_type: appointmentType,
          is_initial_consultation: appointmentType === 'consultation',
          video_enabled: true
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Update availability slot booking count
      const { error: slotError } = await supabase
        .from('therapist_availability_slots')
        .update({ 
          current_bookings: selectedSlot.current_bookings + 1 
        })
        .eq('id', selectedSlot.id);

      if (slotError) throw slotError;

      // If this booking is from an inquiry, update the relationship status
      if (inquiryId) {
        // Check if relationship exists
        const { data: existingRelationship, error: relationshipCheckError } = await supabase
          .from('patient_therapist_relationships')
          .select('id')
          .eq('patient_id', patientId)
          .eq('therapist_id', therapistId)
          .single();

        if (relationshipCheckError && relationshipCheckError.code !== 'PGRST116') {
          console.error('Error checking relationship:', relationshipCheckError);
        }

        if (existingRelationship) {
          // Update existing relationship
          const { error: updateError } = await supabase
            .from('patient_therapist_relationships')
            .update({ 
              relationship_status: 'consultation_scheduled',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingRelationship.id);

          if (updateError) console.error('Error updating relationship:', updateError);
        } else {
          // Create new relationship
          const { error: createError } = await supabase
            .from('patient_therapist_relationships')
            .insert({
              patient_id: patientId,
              therapist_id: therapistId,
              relationship_status: 'consultation_scheduled',
              start_date: new Date().toISOString().split('T')[0]
            });

          if (createError) console.error('Error creating relationship:', createError);
        }

        // Update inquiry status if provided
        const { error: inquiryError } = await supabase
          .from('patient_inquiries')
          .update({ status: 'resolved' })
          .eq('id', inquiryId);

        if (inquiryError) console.error('Error updating inquiry:', inquiryError);
      }

      toast({
        title: "Appointment Booked Successfully! 🎉",
        description: `Your ${appointmentType} with ${therapistName} has been scheduled for ${format(startDateTime, 'PPP')} at ${format(startDateTime, 'p')}.`
      });

      onClose();
    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book appointment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBooking(false);
    }
  };

  const resetModal = () => {
    setStep('date');
    setSelectedDate('');
    setSelectedSlot(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetModal();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Book {appointmentType === 'consultation' ? 'Initial Consultation' : 'Appointment'} with {therapistName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center gap-2 ${step === 'date' ? 'text-primary' : (step === 'time' || step === 'confirm') ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'date' ? 'bg-primary text-white' : 
                (step === 'time' || step === 'confirm') ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                {(step === 'time' || step === 'confirm') ? <CheckCircle className="h-4 w-4" /> : '1'}
              </div>
              <span className="text-sm font-medium">Select Date</span>
            </div>
            
            <div className={`w-8 h-0.5 ${step === 'time' || step === 'confirm' ? 'bg-green-600' : 'bg-gray-200'}`} />
            
            <div className={`flex items-center gap-2 ${step === 'time' ? 'text-primary' : step === 'confirm' ? 'text-green-600' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'time' ? 'bg-primary text-white' : 
                step === 'confirm' ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                {step === 'confirm' ? <CheckCircle className="h-4 w-4" /> : '2'}
              </div>
              <span className="text-sm font-medium">Select Time</span>
            </div>
            
            <div className={`w-8 h-0.5 ${step === 'confirm' ? 'bg-primary' : 'bg-gray-200'}`} />
            
            <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step === 'confirm' ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="text-sm font-medium">Confirm</span>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Step 1: Date Selection */}
              {step === 'date' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Available Dates</h3>
                  {availableDates.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No available dates found. Please contact the therapist directly to schedule an appointment.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableDates.map(date => (
                        <Card 
                          key={date}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleDateSelect(date)}
                        >
                          <CardContent className="p-4">
                            <div className="text-center">
                              <p className="font-medium">{format(parseISO(date), 'EEEE')}</p>
                              <p className="text-lg font-bold">{format(parseISO(date), 'MMM d')}</p>
                              <p className="text-sm text-muted-foreground">{format(parseISO(date), 'yyyy')}</p>
                              <Badge variant="secondary" className="mt-2 text-xs">
                                {slotsByDate[date].length} slots
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Time Selection */}
              {step === 'time' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      Available Times for {format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <Button variant="outline" size="sm" onClick={handleBackToDate}>
                      ← Back to Dates
                    </Button>
                  </div>
                  
                  {timeSlotsForSelectedDate.length === 0 ? (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No available times for this date.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {timeSlotsForSelectedDate.map(slot => (
                        <Card
                          key={slot.id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleTimeSelect(slot)}
                        >
                          <CardContent className="p-3">
                            <div className="text-center">
                              <p className="font-medium">{slot.slot_start_time}</p>
                              <p className="text-xs text-muted-foreground">
                                {slot.max_bookings - slot.current_bookings} available
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Confirmation */}
              {step === 'confirm' && selectedSlot && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Confirm Your Appointment</h3>
                    <Button variant="outline" size="sm" onClick={handleBackToTime}>
                      ← Back to Times
                    </Button>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Video className="h-5 w-5" />
                        Appointment Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Therapist</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                <User className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <p className="font-medium">{therapistName}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Appointment Type</p>
                          <p className="font-medium capitalize mt-1">
                            {appointmentType === 'consultation' ? 'Initial Consultation' : 'Therapy Session'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Date</p>
                          <p className="font-medium mt-1">
                            {format(parseISO(selectedSlot.slot_date), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Time</p>
                          <p className="font-medium mt-1">
                            {selectedSlot.slot_start_time} - {selectedSlot.slot_end_time}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Duration</p>
                          <p className="font-medium mt-1">60 minutes</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Session Format</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Video className="h-4 w-4" />
                            <p className="font-medium">Video Call</p>
                          </div>
                        </div>
                      </div>

                      {appointmentType === 'consultation' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-medium text-blue-800 mb-2">What to Expect</h4>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Discussion of your goals and concerns</li>
                            <li>• Overview of therapeutic approach</li>
                            <li>• Assessment of fit and next steps</li>
                            <li>• Opportunity to ask questions</li>
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="flex gap-3">
                    <Button 
                      onClick={handleBookAppointment}
                      disabled={isBooking}
                      className="flex-1"
                    >
                      {isBooking ? "Booking..." : "Confirm Appointment"}
                    </Button>
                    <Button variant="outline" onClick={onClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntegratedBookingModal;