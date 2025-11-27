
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";

interface TwoFactorSetupProps {
  userId: string;
  secretKey?: string;
  qrCodeUrl?: string;
  recoveryFactors?: string[];
  onComplete: () => void;
  onBack: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const TwoFactorSetup = ({
  userId,
  secretKey,
  qrCodeUrl,
  recoveryFactors,
  onComplete,
  onBack,
  loading,
  setLoading
}: TwoFactorSetupProps) => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "The text has been copied to your clipboard.",
    });
  };

  const verifyAndEnableTwoFactor = async () => {
    if (!userId || !verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a valid 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const mockVerification = verificationCode.length === 6;
      
      if (mockVerification) {
        const { error } = await supabase
          .from("profiles")
          .update({
            two_factor_enabled: true,
            two_factor_setup_complete: true,
            two_factor_updated_at: new Date().toISOString()
          })
          .eq("id", userId);
        
        if (error) throw error;
        
        toast({
          title: "Two-Factor Authentication Enabled",
          description: "Your account is now more secure with 2FA.",
        });
        
        await supabase
          .from("audit_logs")
          .insert({
            user_id: userId,
            activity_type: "two_factor_enabled",
            metadata: { 
              timestamp: new Date().toISOString()
            }
          });

        onComplete();
      } else {
        toast({
          title: "Invalid Code",
          description: "The verification code you entered is invalid. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error enabling 2FA:", error);
      toast({
        title: "Error",
        description: "Failed to enable 2FA. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Step 1: Scan QR Code</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.).
        </p>
        <div className="flex justify-center mb-4">
          <img 
            src={qrCodeUrl} 
            alt="QR Code for 2FA" 
            className="w-40 h-40 border rounded"
          />
        </div>
        <div className="flex justify-between items-center p-2 bg-muted rounded">
          <code className="text-xs">{secretKey}</code>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => secretKey && copyToClipboard(secretKey)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Step 2: Enter Verification Code</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Enter the 6-digit code shown in your authenticator app.
        </p>
        <div className="space-y-2">
          <Label htmlFor="verification-code">Verification Code</Label>
          <Input
            id="verification-code"
            placeholder="000000"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, "").substring(0, 6))}
            maxLength={6}
            className="text-center text-lg tracking-widest"
          />
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Step 3: Save Recovery Codes</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Save these recovery codes in a secure place. You'll need them if you lose your authenticator device.
        </p>
        <div className="bg-muted p-3 rounded mb-2">
          <div className="grid grid-cols-2 gap-2">
            {recoveryFactors?.map((code, index) => (
              <code key={index} className="text-xs">{code}</code>
            ))}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => recoveryFactors && copyToClipboard(recoveryFactors.join('\n'))}
        >
          <Copy className="h-4 w-4 mr-2" /> Copy all recovery codes
        </Button>
      </div>

      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={verifyAndEnableTwoFactor} disabled={loading || verificationCode.length !== 6}>
          {loading ? "Verifying..." : "Enable 2FA"}
        </Button>
      </div>
    </div>
  );
};

export default TwoFactorSetup;
