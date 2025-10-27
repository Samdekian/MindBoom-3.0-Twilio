
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VideoConsentFormProps {
  appointmentId: string;
  onConsentGiven: (value: boolean) => void;
}

const VideoConsentForm: React.FC<VideoConsentFormProps> = ({ 
  appointmentId,
  onConsentGiven,
}) => {
  const { toast } = useToast();

  const handleConsent = async (consent: boolean) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ recording_consent: consent })
        .eq('id', appointmentId);
        
      if (error) throw error;
      
      onConsentGiven(consent);
      
      toast({
        title: "Consent Updated",
        description: consent 
          ? "You have given consent to record this session"
          : "You have declined consent to record this session",
      });
    } catch (error) {
      console.error("Error updating consent:", error);
      toast({
        title: "Error",
        description: "Failed to update recording consent",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Session Recording Consent</CardTitle>
        <CardDescription>
          Your therapist has requested permission to record this session
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>Recording this session can help:</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Provide a reference for your treatment progress</li>
          <li>Allow you to review the session later</li>
          <li>Help your therapist provide better care</li>
        </ul>
        <p className="text-sm text-muted-foreground mt-4">
          All recordings are stored securely and encrypted in compliance with HIPAA regulations.
          You can withdraw your consent at any time before the session begins.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => handleConsent(false)}>
          Decline
        </Button>
        <Button onClick={() => handleConsent(true)}>
          Give Consent
        </Button>
      </CardFooter>
    </Card>
  );
};

export default VideoConsentForm;
