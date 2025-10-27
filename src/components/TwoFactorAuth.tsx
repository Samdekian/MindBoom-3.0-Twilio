
import React, { useState } from "react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TwoFactorStatus from "@/components/security/TwoFactorStatus";
import TwoFactorSetup from "@/components/security/TwoFactorSetup";
import TwoFactorSetupComplete from "@/components/security/TwoFactorSetupComplete";
import { useTwoFactorAuth } from "@/hooks/useTwoFactorAuth";

type SetupStep = "start" | "verify" | "complete";

const TwoFactorAuth = () => {
  const { user } = useAuthRBAC();
  const { t } = useLanguage();
  const [setupStep, setSetupStep] = useState<SetupStep>("start");
  const { 
    status, 
    loading, 
    setLoading,
    startTwoFactorSetup,
    disableTwoFactor
  } = useTwoFactorAuth(user);

  const handleStartSetup = async () => {
    const success = await startTwoFactorSetup();
    if (success) {
      setSetupStep("verify");
    }
  };

  const handleSetupComplete = () => {
    setSetupStep("complete");
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account by enabling two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status.isEnabled && setupStep === "start" && (
          <TwoFactorStatus 
            isEnabled={status.isEnabled} 
            onStartSetup={handleStartSetup}
            loading={loading}
          />
        )}

        {!status.isEnabled && setupStep === "start" && (
          <TwoFactorStatus 
            isEnabled={status.isEnabled} 
            onStartSetup={handleStartSetup}
            loading={loading}
          />
        )}

        {!status.isEnabled && setupStep === "verify" && (
          <TwoFactorSetup
            userId={user.id}
            secretKey={status.secretKey}
            qrCodeUrl={status.qrCodeUrl}
            recoveryFactors={status.recoveryFactors}
            onComplete={handleSetupComplete}
            onBack={() => setSetupStep("start")}
            loading={loading}
            setLoading={setLoading}
          />
        )}

        {setupStep === "complete" && (
          <TwoFactorSetupComplete />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {status.isEnabled && setupStep === "start" && (
          <Button variant="destructive" onClick={disableTwoFactor} disabled={loading}>
            {loading ? "Disabling..." : "Disable 2FA"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default TwoFactorAuth;
