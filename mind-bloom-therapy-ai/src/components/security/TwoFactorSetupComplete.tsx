
import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const TwoFactorSetupComplete = () => {
  return (
    <div className="space-y-4">
      <Alert variant="default" className="border-green-500 bg-green-50 dark:bg-green-900/20">
        <CheckCircle2 className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-700 dark:text-green-300">Setup Complete</AlertTitle>
        <AlertDescription className="text-green-600 dark:text-green-400">
          Two-factor authentication has been successfully enabled for your account.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TwoFactorSetupComplete;
