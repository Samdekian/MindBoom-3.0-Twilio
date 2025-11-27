
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, User, MessageSquare, CheckCircle } from "lucide-react";

interface InitialConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  therapist: {
    id: string;
    full_name: string;
    specialization?: string;
    hourly_rate?: number;
  };
  onBookConsultation: (consultationData: ConsultationBookingData) => void;
}

interface ConsultationBookingData {
  therapistId: string;
  consultationType: 'free' | 'paid';
  selectedDate: Date;
  selectedTime: string;
  reasonForSeeking: string;
  previousTherapy: boolean;
  urgencyLevel: string;
  preferredCommunication: string;
  specificConcerns: string;
  goals: string;
}

const InitialConsultationDialog: React.FC<InitialConsultationDialogProps> = ({
  isOpen,
  onClose,
  therapist,
  onBookConsultation
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<ConsultationBookingData>>({
    therapistId: therapist.id,
    consultationType: 'free',
    previousTherapy: false,
    urgencyLevel: 'low',
    preferredCommunication: 'video'
  });

  const availableTimes = [
    "9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"
  ];

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (formData.selectedDate && formData.selectedTime) {
      onBookConsultation(formData as ConsultationBookingData);
      onClose();
    }
  };

  const updateFormData = (key: keyof ConsultationBookingData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Initial Consultation with {therapist.full_name}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-8 h-0.5 ${
                  step > stepNumber ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Consultation Type & Scheduling */}
        {step === 1 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Choose Your Consultation Type</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.consultationType === 'free' 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => updateFormData('consultationType', 'free')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold">Free 15-minute Consultation</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Brief introductory call to discuss your needs and determine if we're a good fit.
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${
                      formData.consultationType === 'paid' 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => updateFormData('consultationType', 'paid')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold">Full Initial Session</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Complete 50-minute intake session - ${therapist.hourly_rate || 150}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-sm font-medium">Select Date</Label>
                <Calendar
                  mode="single"
                  selected={formData.selectedDate}
                  onSelect={(date) => updateFormData('selectedDate', date)}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border mt-2"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Available Times</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={formData.selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFormData('selectedTime', time)}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Background Information */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <Label htmlFor="reason">What brings you to therapy?</Label>
              <Textarea
                id="reason"
                value={formData.reasonForSeeking || ''}
                onChange={(e) => updateFormData('reasonForSeeking', e.target.value)}
                placeholder="Briefly describe what you'd like to work on..."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="concerns">Specific concerns or symptoms</Label>
              <Textarea
                id="concerns"
                value={formData.specificConcerns || ''}
                onChange={(e) => updateFormData('specificConcerns', e.target.value)}
                placeholder="Any specific symptoms, situations, or patterns you'd like to address..."
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="goals">What are you hoping to achieve?</Label>
              <Textarea
                id="goals"
                value={formData.goals || ''}
                onChange={(e) => updateFormData('goals', e.target.value)}
                placeholder="Your goals for therapy..."
                className="mt-2"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="previous-therapy"
                checked={formData.previousTherapy}
                onCheckedChange={(checked) => updateFormData('previousTherapy', checked)}
              />
              <Label htmlFor="previous-therapy">I have previous experience with therapy</Label>
            </div>
          </div>
        )}

        {/* Step 3: Preferences & Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <Label>Urgency Level</Label>
              <Select 
                value={formData.urgencyLevel} 
                onValueChange={(value) => updateFormData('urgencyLevel', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Can wait 1-2 weeks</SelectItem>
                  <SelectItem value="medium">Medium - Would like to start within a week</SelectItem>
                  <SelectItem value="high">High - Need to start as soon as possible</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Preferred Communication Method</Label>
              <Select 
                value={formData.preferredCommunication} 
                onValueChange={(value) => updateFormData('preferredCommunication', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in-person">In-Person (if available)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Confirmation Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Consultation Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Therapist:</strong> {therapist.full_name}</p>
                <p><strong>Type:</strong> {formData.consultationType === 'free' ? 'Free 15-minute consultation' : 'Full initial session'}</p>
                <p><strong>Date:</strong> {formData.selectedDate?.toLocaleDateString()}</p>
                <p><strong>Time:</strong> {formData.selectedTime}</p>
                <p><strong>Method:</strong> {formData.preferredCommunication}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button 
            variant="outline" 
            onClick={step === 1 ? onClose : handlePrevious}
          >
            {step === 1 ? 'Cancel' : 'Previous'}
          </Button>
          
          <Button 
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={
              (step === 1 && (!formData.selectedDate || !formData.selectedTime)) ||
              (step === 2 && !formData.reasonForSeeking) ||
              (step === 3 && (!formData.urgencyLevel || !formData.preferredCommunication))
            }
          >
            {step === 3 ? 'Book Consultation' : 'Next'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialConsultationDialog;
