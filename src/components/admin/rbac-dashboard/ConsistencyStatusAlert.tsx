
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";
import { ConsistencyCheckResult } from "@/types/utils/rbac/types";

interface ConsistencyStatusAlertProps {
  checkPerformed: boolean;
  inconsistentUsers: ConsistencyCheckResult[];
  isLoading: boolean;
}

const ConsistencyStatusAlert: React.FC<ConsistencyStatusAlertProps> = ({
  checkPerformed,
  inconsistentUsers,
  isLoading,
}) => {
  if (isLoading) {
    return null;
  }

  if (!checkPerformed) {
    return (
      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertTitle>Consistency Check</AlertTitle>
        <AlertDescription>
          Click "Check Consistency" to scan for users with mismatched metadata and roles.
        </AlertDescription>
      </Alert>
    );
  }

  if (inconsistentUsers.length === 0) {
    return (
      <Alert variant="default" className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle>No Inconsistencies Found</AlertTitle>
        <AlertDescription>
          All user accounts have consistent metadata and role information.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="mb-4 bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800">
      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle>Inconsistencies Detected</AlertTitle>
      <AlertDescription>
        Found {inconsistentUsers.length} users with inconsistencies between their metadata and database roles.
      </AlertDescription>
    </Alert>
  );
};

export default ConsistencyStatusAlert;
