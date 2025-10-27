import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, User, Heart, Brain, Clock, CheckCircle } from "lucide-react";

interface PatientIntakeFormProps {
  onSuccess: () => void;
}

const PatientIntakeForm: React.FC<PatientIntakeFormProps> = ({ onSuccess }) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    reasonForSeekingTherapy: "",
    mentalHealthHistory: "",
    currentMedications: "",
    allergies: "",
    consentToTreatment: false,
    hipaaConsent: false,
    preferredCommunicationMethod: "email",
    sessionFrequencyPreference: "weekly",
    goalsForTherapy: "",
    additionalNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to submit the form",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("intake_forms")
        .insert([
          {
            ...formData,
            user_id: user.id,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      setSubmissionSuccess(true);
      toast({
        title: "Form Submitted!",
        description: "Your intake form has been successfully submitted.",
      });

      // Reset form after success
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          reasonForSeekingTherapy: "",
          mentalHealthHistory: "",
          currentMedications: "",
          allergies: "",
          consentToTreatment: false,
          hipaaConsent: false,
          preferredCommunicationMethod: "email",
          sessionFrequencyPreference: "weekly",
          goalsForTherapy: "",
          additionalNotes: "",
        });
        setSubmissionSuccess(false);
        onSuccess();
      }, 2000);

    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Failed to Submit Form",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Patient Intake Form
        </CardTitle>
        <CardDescription>
          Please fill out this form to help us understand your needs better.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {submissionSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Form Submitted!</h3>
            <p className="text-gray-600 text-center">
              Thank you for submitting the intake form. We will review it shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="Enter emergency contact phone"
                />
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="reasonForSeekingTherapy">Reason for Seeking Therapy</Label>
              <Textarea
                id="reasonForSeekingTherapy"
                name="reasonForSeekingTherapy"
                value={formData.reasonForSeekingTherapy}
                onChange={handleInputChange}
                placeholder="Describe your reason for seeking therapy"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="mentalHealthHistory">Mental Health History</Label>
              <Textarea
                id="mentalHealthHistory"
                name="mentalHealthHistory"
                value={formData.mentalHealthHistory}
                onChange={handleInputChange}
                placeholder="Please provide details of your mental health history"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="currentMedications">Current Medications</Label>
              <Textarea
                id="currentMedications"
                name="currentMedications"
                value={formData.currentMedications}
                onChange={handleInputChange}
                placeholder="List any current medications"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                value={formData.allergies}
                onChange={handleInputChange}
                placeholder="List any allergies"
                rows={2}
              />
            </div>

            <Separator />

            <div>
              <Label>Preferred Communication Method</Label>
              <Select
                onValueChange={(value) => setFormData(prev => ({ ...prev, preferredCommunicationMethod: value }))}
                defaultValue={formData.preferredCommunicationMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a communication method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Session Frequency Preference</Label>
              <Select
                onValueChange={(value) => setFormData(prev => ({ ...prev, sessionFrequencyPreference: value }))}
                defaultValue={formData.sessionFrequencyPreference}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a session frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goalsForTherapy">Goals for Therapy</Label>
              <Textarea
                id="goalsForTherapy"
                name="goalsForTherapy"
                value={formData.goalsForTherapy}
                onChange={handleInputChange}
                placeholder="What are your goals for therapy?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleInputChange}
                placeholder="Any additional notes you would like to add?"
                rows={3}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consentToTreatment"
                  name="consentToTreatment"
                  checked={formData.consentToTreatment}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentToTreatment: !!checked }))}
                />
                <Label htmlFor="consentToTreatment">
                  I consent to receive treatment from this provider.
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hipaaConsent"
                  name="hipaaConsent"
                  checked={formData.hipaaConsent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hipaaConsent: !!checked }))}
                />
                <Label htmlFor="hipaaConsent">
                  I acknowledge that I have received and reviewed the HIPAA privacy policy.
                </Label>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientIntakeForm;
