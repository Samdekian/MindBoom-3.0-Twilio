
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyRound, ArrowRight } from "lucide-react";

interface TwoFactorVerificationProps {
  email: string;
  password: string;
  onVerify: (code: string) => Promise<void>;
  onCancel: () => void;
}

const TwoFactorVerification = ({ email, password, onVerify, onCancel }: TwoFactorVerificationProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: t("invalidCode") || "Invalid Code",
        description: t("enterValidCode") || "Please enter a valid 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await onVerify(verificationCode);
    } catch (error) {
      console.error("2FA verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <div className="flex justify-center mb-4">
          <KeyRound className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-center">{t("twoFactorVerification") || "Two-Factor Verification"}</CardTitle>
        <CardDescription className="text-center">
          {t("enterCodeFromApp") || "Enter the 6-digit code from your authenticator app"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Input
          id="verification-code"
          placeholder="000000"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, "").substring(0, 6))}
          maxLength={6}
          className="text-center text-lg tracking-widest mb-4"
          autoFocus
          autoComplete="one-time-code"
        />
        <p className="text-sm text-muted-foreground text-center">
          {t("checkAuthenticator") || "Open your authenticator app to view your verification code."}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {t("back") || "Back"}
        </Button>
        <Button 
          onClick={handleVerify} 
          disabled={loading || verificationCode.length !== 6}
          className="flex items-center"
        >
          {loading ? 
            (t("verifying") || "Verifying...") : 
            (
              <>
                {t("verify") || "Verify"} 
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TwoFactorVerification;
