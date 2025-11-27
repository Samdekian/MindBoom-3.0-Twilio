
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Cloud, CloudOff, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppointmentSyncStatusProps {
  syncStatus: string;
  syncError?: string | null;
  lastSyncAttempt?: string | null;
  onRetry?: () => void;
  showRetry?: boolean;
}

const AppointmentSyncStatus: React.FC<AppointmentSyncStatusProps> = ({
  syncStatus,
  syncError,
  lastSyncAttempt,
  onRetry,
  showRetry = false,
}) => {
  const getStatusDetails = () => {
    switch (syncStatus) {
      case 'synced':
        return {
          icon: <Cloud className="h-4 w-4" />,
          label: "Synced",
          variant: "default" as const,
          description: lastSyncAttempt 
            ? `Last synced: ${new Date(lastSyncAttempt).toLocaleString()}`
            : "Successfully synced with calendar"
        };
      case 'failed':
        return {
          icon: <AlertTriangle className="h-4 w-4" />,
          label: "Sync Failed",
          variant: "destructive" as const,
          description: syncError || "Failed to sync with calendar"
        };
      case 'pending':
        return {
          icon: <Cloud className="h-4 w-4 animate-pulse" />,
          label: "Sync Pending",
          variant: "default" as const,
          description: "Waiting to sync with calendar"
        };
      default:
        return {
          icon: <CloudOff className="h-4 w-4" />,
          label: "Not Synced",
          variant: "secondary" as const,
          description: "Not yet synced with calendar"
        };
    }
  };

  const status = getStatusDetails();

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant={status.variant} className="flex items-center gap-1">
              {status.icon}
              <span>{status.label}</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{status.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showRetry && syncStatus === 'failed' && onRetry && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onRetry}
          className="h-6 px-2"
        >
          <RefreshCw className="h-3 w-3" />
          <span className="sr-only">Retry sync</span>
        </Button>
      )}
    </div>
  );
};

export default AppointmentSyncStatus;
