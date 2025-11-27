
import React, { useState } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HipaaConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: () => void;
}

const HipaaConsentDialog = ({ open, onOpenChange, onConsent }: HipaaConsentDialogProps) => {
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthRBAC();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!consent || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          hipaa_consent: true,
          hipaa_consent_date: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Consent Recorded",
        description: "Your HIPAA consent has been recorded successfully.",
      });

      onConsent();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating HIPAA consent:", error);
      toast({
        title: "Error",
        description: "Failed to record consent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = (checked: boolean | "indeterminate") => {
    setConsent(checked === true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>HIPAA Consent Required</DialogTitle>
          <DialogDescription>
            To continue using our healthcare services, we need your consent for handling your protected health information.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                By providing consent, you acknowledge that you have read and understood our Privacy Policy 
                and agree to the use and disclosure of your protected health information for:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Treatment purposes</li>
                <li>Payment processing</li>
                <li>Healthcare operations</li>
                <li>Communication with healthcare providers</li>
              </ul>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hipaa-consent" 
                checked={consent}
                onCheckedChange={handleConsentChange}
              />
              <label 
                htmlFor="hipaa-consent" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I consent to the use and disclosure of my protected health information as described above
              </label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!consent || loading}
            className="w-full"
          >
            {loading ? "Recording Consent..." : "Give Consent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HipaaConsentDialog;
