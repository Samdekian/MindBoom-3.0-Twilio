
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { ConsistencyCheckResult } from "@/types/utils/rbac/types";

interface ConsistencyCheckFooterProps {
  inconsistentUsers: ConsistencyCheckResult[];
  isLoading: boolean;
  onCheckConsistency: () => Promise<void>;
  onFixAll: () => Promise<number>;
}

const ConsistencyCheckFooter: React.FC<ConsistencyCheckFooterProps> = ({
  inconsistentUsers,
  isLoading,
  onCheckConsistency,
  onFixAll,
}) => {
  return (
    <div className="flex justify-between border-t p-4">
      <Button 
        variant="outline" 
        onClick={onCheckConsistency}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="mr-2 h-4 w-4" />
        )}
        Check Consistency
      </Button>
      
      {inconsistentUsers.length > 0 && (
        <Button 
          variant="default" 
          onClick={onFixAll}
          disabled={isLoading}
        >
          Fix All Inconsistencies
        </Button>
      )}
    </div>
  );
};

export default ConsistencyCheckFooter;
