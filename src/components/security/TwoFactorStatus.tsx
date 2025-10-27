
import React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TwoFactorStatusProps {
  isEnabled: boolean;
  onStartSetup: () => void;
  loading: boolean;
}

const TwoFactorStatus = ({ isEnabled, onStartSetup, loading }: TwoFactorStatusProps) => {
  return (
    <div className="space-y-4">
      {isEnabled ? (
        <Alert className="mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>2FA is enabled</AlertTitle>
          <AlertDescription>
            Your account is secured with two-factor authentication.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>2FA is not enabled</AlertTitle>
            <AlertDescription>
              We strongly recommend enabling two-factor authentication for enhanced security.
            </AlertDescription>
          </Alert>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Two-factor authentication adds an additional layer of security to your account by requiring a code from your authenticator app in addition to your password.
            </p>
            <Button onClick={onStartSetup} disabled={loading}>
              {loading ? "Setting up..." : "Set up two-factor authentication"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default TwoFactorStatus;
