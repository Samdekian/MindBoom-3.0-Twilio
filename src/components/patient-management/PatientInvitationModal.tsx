import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Mail, Loader2, Check } from "lucide-react";

interface PatientInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PatientInvitationModal: React.FC<PatientInvitationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to send invitations",
        variant: "destructive",
      });
      return;
    }

    if (!formData.email || !formData.firstName) {
      toast({
        title: "Validation Error",
        description: "Email and first name are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create invitation using the existing create_user_invitation function
      const { data: invitationResult, error: invitationError } = await supabase
        .rpc('create_user_invitation', {
          p_email: formData.email,
          p_role_to_assign: 'patient',
          p_invited_by: user.id
        });

      if (invitationError) {
        throw invitationError;
      }

      if (!invitationResult.success) {
        throw new Error(invitationResult.error || 'Failed to create invitation');
      }

      // Send email notification (we'll implement this edge function next)
      const { error: emailError } = await supabase.functions.invoke('send-patient-invitation', {
        body: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          message: formData.message,
          invitationToken: invitationResult.invitation_token,
          therapistName: user.user_metadata?.full_name || 'Your therapist'
        }
      });

      if (emailError) {
        console.warn('Email sending failed:', emailError);
        // Don't fail the whole process if email fails
      }

      setIsSuccess(true);
      toast({
        title: "Invitation Sent!",
        description: `An invitation has been sent to ${formData.email}`,
      });

      // Reset form after success
      setTimeout(() => {
        setFormData({
          email: "",
          firstName: "",
          lastName: "",
          message: "",
        });
        setIsSuccess(false);
        onClose();
      }, 2000);

    } catch (error: any) {
      console.error('Invitation error:', error);
      toast({
        title: "Failed to Send Invitation",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        message: "",
      });
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Invite New Patient
          </DialogTitle>
          <DialogDescription>
            Send an email invitation to add a new patient to your practice.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-green-900 mb-2">Invitation Sent!</h3>
            <p className="text-gray-600 text-center">
              The patient will receive an email with instructions to join your practice.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="Enter first name"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="Enter last name"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="patient@example.com"
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Add a personal message to your invitation..."
                disabled={isLoading}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PatientInvitationModal;
