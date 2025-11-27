import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";

interface RecordingConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointmentId: string;
  onConsentGiven: (consent: boolean) => void;
}

const RecordingConsentDialog: React.FC<RecordingConsentDialogProps> = ({
  open,
  onOpenChange,
  appointmentId,
  onConsentGiven
}) => {
  const { user } = useAuthRBAC();

  const handleConsent = async (consent: boolean) => {
    try {
      // Update appointment with consent status
      const { error } = await supabase
        .from('appointments')
        .update({ recording_consent: consent })
        .eq('id', appointmentId);
      
      if (error) throw error;
      
      // Log the consent in audit logs with required user_id field
      await supabase.from('audit_logs').insert({
        activity_type: consent ? 'recording_consent_given' : 'recording_consent_denied',
        resource_type: 'appointment',
        resource_id: appointmentId,
        user_id: user?.id || 'anonymous', // Add the required user_id field
        metadata: { 
          timestamp: new Date().toISOString(),
          consentGiven: consent 
        }
      });
      
      // Close dialog and notify parent
      onConsentGiven(consent);
      onOpenChange(false);
    } catch (err) {
      console.error("Error updating recording consent:", err);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">Session Recording Consent</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your therapist would like to record this session for treatment purposes.
            All recordings are securely encrypted and strictly confidential.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">End-to-End Encryption</h4>
              <p className="text-sm text-muted-foreground">
                All recordings are encrypted and can only be accessed by you and your therapist.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">HIPAA Compliant</h4>
              <p className="text-sm text-muted-foreground">
                Our platform follows strict healthcare privacy regulations to protect your data.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <ShieldAlert className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">You can revoke consent</h4>
              <p className="text-sm text-muted-foreground">
                You may withdraw your consent at any time during the session.
              </p>
            </div>
          </div>
        </div>
        <AlertDialogFooter className="flex-col sm:flex-row sm:justify-between gap-2">
          <AlertDialogCancel onClick={() => handleConsent(false)}>Decline Recording</AlertDialogCancel>
          <AlertDialogAction onClick={() => handleConsent(true)}>I Consent to Recording</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default RecordingConsentDialog;
