
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

const AccessDeniedAlert: React.FC = () => {
  return (
    <Alert variant="destructive">
      <ShieldAlert className="h-4 w-4" />
      <AlertTitle>Access Denied</AlertTitle>
      <AlertDescription>
        You need admin permissions to access the RBAC consistency check tools.
      </AlertDescription>
    </Alert>
  );
};

export default AccessDeniedAlert;
