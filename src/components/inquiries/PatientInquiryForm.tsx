import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatientInquiries } from "@/hooks/usePatientInquiries";
import { MessageSquare, Phone, Mail, Video } from "lucide-react";

interface PatientInquiryFormProps {
  therapistId: string;
  therapistName?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

const PatientInquiryForm = ({ therapistId, therapistName, onClose, onSuccess }: PatientInquiryFormProps) => {
  const { createInquiry, isCreatingInquiry } = usePatientInquiries();
  const [formData, setFormData] = useState({
    inquiry_type: 'general',
    subject: '',
    message: '',
    priority: 'normal',
    preferred_contact_method: 'email',
    patient_phone: '',
    patient_email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      return;
    }

    createInquiry({
      therapist_id: therapistId,
      ...formData,
      source: 'website'
    });

    if (onSuccess) {
      onSuccess();
    }

    if (onClose) {
      onClose();
    }
  };

  const getContactIcon = (method: string) => {
    switch (method) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'video_call': return <Video className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Contact {therapistName || "Therapist"}
        </CardTitle>
        <CardDescription>
          Send a message to start the conversation about your therapy needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inquiry_type">Inquiry Type</Label>
              <Select 
                value={formData.inquiry_type} 
                onValueChange={(value) => setFormData({ ...formData, inquiry_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Question</SelectItem>
                  <SelectItem value="consultation_request">Consultation Request</SelectItem>
                  <SelectItem value="insurance_question">Insurance Question</SelectItem>
                  <SelectItem value="scheduling">Scheduling</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="Brief description of your inquiry"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Please describe your needs, questions, or what you're looking for in therapy..."
              rows={5}
              required
            />
          </div>

          <div>
            <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
            <Select 
              value={formData.preferred_contact_method} 
              onValueChange={(value) => setFormData({ ...formData, preferred_contact_method: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                </SelectItem>
                <SelectItem value="phone">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                </SelectItem>
                <SelectItem value="video_call">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Video Call
                  </div>
                </SelectItem>
                <SelectItem value="in_app">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    In-App Message
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.preferred_contact_method === 'phone' && (
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.patient_phone}
                onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                placeholder="Your phone number"
                type="tel"
              />
            </div>
          )}

          {formData.preferred_contact_method === 'email' && (
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={formData.patient_email}
                onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                placeholder="Your email address"
                type="email"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isCreatingInquiry} className="flex-1">
              {isCreatingInquiry ? "Sending..." : "Send Inquiry"}
            </Button>
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PatientInquiryForm;
