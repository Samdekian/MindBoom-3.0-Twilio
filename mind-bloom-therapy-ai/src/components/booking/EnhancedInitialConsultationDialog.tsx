import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useInitialConsultations } from "@/hooks/use-initial-consultations";

interface EnhancedInitialConsultationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  therapistId: string;
  onBookingComplete: () => void;
}

const EnhancedInitialConsultationDialog = ({ isOpen, onClose, therapistId, onBookingComplete }) => {
  const { createConsultation } = useInitialConsultations();

  const [selectedConsultationType, setSelectedConsultationType] = useState("");
  const [reasonForSeeking, setReasonForSeeking] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("");
  const [specificConcerns, setSpecificConcerns] = useState("");
  const [goals, setGoals] = useState("");
  const [preferredCommunication, setPreferredCommunication] = useState("");
  const [previousTherapy, setPreviousTherapy] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    createConsultation.mutate({
      therapist_id: therapistId,
      consultation_type_id: selectedConsultationType,
      reason_for_seeking: reasonForSeeking,
      urgency_level: urgencyLevel,
      specific_concerns: specificConcerns,
      goals: goals,
      preferred_communication: preferredCommunication,
      previous_therapy: previousTherapy,
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Initial Consultation Details</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide some details to help the therapist prepare for your
            initial consultation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="consultation-type">Consultation Type</Label>
            <Select onValueChange={setSelectedConsultationType}>
              <SelectTrigger id="consultation-type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="individual">Individual Therapy</SelectItem>
                <SelectItem value="couples">Couples Therapy</SelectItem>
                <SelectItem value="family">Family Therapy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for Seeking Therapy</Label>
            <Textarea
              id="reason"
              placeholder="Briefly describe why you are seeking therapy"
              value={reasonForSeeking}
              onChange={(e) => setReasonForSeeking(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="urgency">Urgency Level</Label>
            <Select onValueChange={setUrgencyLevel}>
              <SelectTrigger id="urgency">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="concerns">Specific Concerns</Label>
            <Input
              id="concerns"
              placeholder="List any specific concerns you'd like to address"
              value={specificConcerns}
              onChange={(e) => setSpecificConcerns(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="goals">Therapy Goals</Label>
            <Textarea
              id="goals"
              placeholder="What do you hope to achieve through therapy?"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="communication">Preferred Communication Method</Label>
            <Input
              id="communication"
              placeholder="How would you prefer to communicate with your therapist?"
              value={preferredCommunication}
              onChange={(e) => setPreferredCommunication(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="previous-therapy">Previous Therapy Experience</Label>
            <Textarea
              id="previous-therapy"
              placeholder="Have you had therapy before? If so, please describe."
              value={previousTherapy}
              onChange={(e) => setPreviousTherapy(e.target.value)}
            />
          </div>
        </CardContent>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EnhancedInitialConsultationDialog;
