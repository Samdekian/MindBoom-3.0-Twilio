
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TherapistSelectionTab from "./modal-tabs/TherapistSelectionTab";
import DateSelectionTab from "./modal-tabs/DateSelectionTab";
import TimeSelectionTab from "./modal-tabs/TimeSelectionTab";
import SummaryTab from "./modal-tabs/SummaryTab";
import { useToast } from "@/hooks/use-toast";

interface ScheduleAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId?: string;
  onBookingComplete?: () => void;
}

export interface BookingData {
  therapistId?: string;
  therapistName?: string;
  selectedDate?: Date;
  selectedTime?: string;
  appointmentType?: string;
}

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  isOpen,
  onClose,
  therapistId,
  onBookingComplete,
}) => {
  const [activeTab, setActiveTab] = useState("therapist");
  const [bookingData, setBookingData] = useState<BookingData>({
    appointmentType: "Video Call",
    therapistId: therapistId,
  });
  const [isBookingComplete, setIsBookingComplete] = useState(false);
  const { toast } = useToast();

  const tabs = [
    { id: "therapist", label: "Therapist", completed: !!bookingData.therapistId },
    { id: "date", label: "Date", completed: !!bookingData.selectedDate },
    { id: "time", label: "Time", completed: !!bookingData.selectedTime },
    { id: "summary", label: "Summary", completed: isBookingComplete },
  ];

  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);

  const handleNext = () => {
    const nextIndex = currentTabIndex + 1;
    if (nextIndex < tabs.length) {
      setActiveTab(tabs[nextIndex].id);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentTabIndex - 1;
    if (prevIndex >= 0) {
      setActiveTab(tabs[prevIndex].id);
    }
  };

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...updates }));
  };

  const handleClose = () => {
    // Reset form when closing
    setActiveTab("therapist");
    setBookingData({ appointmentType: "Video Call", therapistId: therapistId });
    setIsBookingComplete(false);
    onClose();
  };

  const handleBookingSuccess = (appointmentId: string) => {
    console.log('Booking successful, appointment ID:', appointmentId);
    setIsBookingComplete(true);
    
    toast({
      title: "Booking Confirmed!",
      description: "Your appointment has been successfully scheduled. You'll receive a confirmation email shortly.",
    });

    // Close modal after a short delay to show success state
    setTimeout(() => {
      if (onBookingComplete) {
        onBookingComplete();
      }
      handleClose();
    }, 2000);
  };

  // Determine if we can navigate to next step
  const canProceedToNext = (tabId: string) => {
    switch (tabId) {
      case "therapist":
        return !!bookingData.therapistId;
      case "date":
        return !!bookingData.selectedDate;
      case "time":
        return !!bookingData.selectedTime;
      default:
        return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] sm:w-[90vw] sm:max-w-[600px] lg:max-w-[900px] xl:max-w-[1000px] max-h-[85vh] overflow-hidden p-0">
        <div className="flex flex-col h-full max-h-[85vh]">
          {/* Header */}
          <DialogHeader className="px-4 sm:px-6 py-4 border-b shrink-0">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-center">
              {isBookingComplete ? "Booking Confirmed!" : "Schedule Initial Consultation"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {isBookingComplete 
                ? "Your appointment has been successfully scheduled"
                : "Book your first session to begin your therapeutic journey"
              }
            </p>
          </DialogHeader>

          {/* Progress Indicators */}
          <div className="px-4 sm:px-6 py-4 border-b shrink-0">
            <div className="flex items-center justify-center">
              {tabs.map((tab, index) => (
                <div key={tab.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium transition-all",
                        tab.completed || isBookingComplete
                          ? "bg-green-500 text-white"
                          : tab.id === activeTab
                          ? "bg-primary/20 text-primary border-2 border-primary"
                          : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {tab.completed || isBookingComplete ? <Check className="h-3 w-3 sm:h-4 sm:w-4" /> : index + 1}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-1 font-medium hidden sm:block",
                        tab.id === activeTab || tab.completed || isBookingComplete
                          ? "text-primary"
                          : "text-gray-500"
                      )}
                    >
                      {tab.label}
                    </span>
                  </div>
                  {index < tabs.length - 1 && (
                    <div className="w-8 sm:w-12 h-0.5 bg-gray-200 mx-1 sm:mx-2 mt-[-12px]">
                      <div
                        className="h-0.5 bg-primary transition-all duration-300"
                        style={{
                          width: `${
                            index < currentTabIndex || isBookingComplete
                              ? 100 
                              : index === currentTabIndex 
                              ? 50 
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Success State */}
          {isBookingComplete && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Appointment Confirmed!</h3>
                <p className="text-muted-foreground max-w-md">
                  Your consultation with {bookingData.therapistName} has been scheduled for{' '}
                  {bookingData.selectedDate && bookingData.selectedTime && 
                    `${bookingData.selectedDate.toLocaleDateString()} at ${bookingData.selectedTime}`
                  }.
                </p>
                <p className="text-sm text-muted-foreground">
                  You'll receive a confirmation email with video session details shortly.
                </p>
              </div>
            </div>
          )}

          {/* Tabs Content */}
          {!isBookingComplete && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="hidden">
                {tabs.map(tab => (
                  <TabsTrigger key={tab.id} value={tab.id}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="flex-1 overflow-auto px-4 sm:px-6 py-4">
                <TabsContent value="therapist" className="mt-0 h-full">
                  <TherapistSelectionTab
                    bookingData={bookingData}
                    updateBookingData={updateBookingData}
                    onNext={handleNext}
                  />
                </TabsContent>

                <TabsContent value="date" className="mt-0 h-full">
                  <DateSelectionTab
                    bookingData={bookingData}
                    updateBookingData={updateBookingData}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                  />
                </TabsContent>

                <TabsContent value="time" className="mt-0 h-full">
                  <TimeSelectionTab
                    bookingData={bookingData}
                    updateBookingData={updateBookingData}
                    onNext={handleNext}
                    onPrevious={handlePrevious}
                  />
                </TabsContent>

                <TabsContent value="summary" className="mt-0 h-full">
                  <SummaryTab
                    therapistId={bookingData.therapistId || null}
                    selectedDate={bookingData.selectedDate || null}
                    selectedTime={bookingData.selectedTime || null}
                    therapistName={bookingData.therapistName || null}
                    onBookingSuccess={handleBookingSuccess}
                    onBack={handlePrevious}
                  />
                </TabsContent>
              </div>
            </Tabs>
          )}

          {/* Footer */}
          {!isBookingComplete && (
            <div className="px-4 sm:px-6 py-4 border-t shrink-0 bg-gray-50/50">
              <p className="text-xs text-muted-foreground text-center">
                Initial consultations can be rescheduled or cancelled up to 24 hours before the scheduled time.
                Follow-up appointments will be scheduled during your consultation based on your treatment plan.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleAppointmentModal;
