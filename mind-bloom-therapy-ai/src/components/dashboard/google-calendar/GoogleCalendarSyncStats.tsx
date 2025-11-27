
import React from 'react';
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface GoogleCalendarSyncStatsProps {
  pendingCount: number;
  failedCount: number;
  onSyncAll: () => void;
  isSyncing: boolean;
}

export const GoogleCalendarSyncStats: React.FC<GoogleCalendarSyncStatsProps> = ({
  pendingCount,
  failedCount,
  onSyncAll,
  isSyncing
}) => {
  const navigate = useNavigate();
  
  const hasIssues = pendingCount > 0 || failedCount > 0;
  
  const handleViewDetailed = () => {
    navigate('/calendar-settings');
  };
  
  return (
    <CardContent className="space-y-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium">Sync Status</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-start bg-muted p-3 rounded-lg space-x-3">
            <div className="mt-0.5">
              {failedCount > 0 ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div>
              <p className="font-medium">{failedCount} Failed</p>
              <p className="text-xs text-muted-foreground">
                {failedCount === 0 
                  ? "No sync errors!" 
                  : `${failedCount} appointment${failedCount !== 1 ? 's' : ''} failed to sync`}
              </p>
            </div>
          </div>
          
          <div className="flex items-start bg-muted p-3 rounded-lg space-x-3">
            <div className="mt-0.5">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="font-medium">{pendingCount} Pending</p>
              <p className="text-xs text-muted-foreground">
                {pendingCount === 0 
                  ? "Everything is synced!" 
                  : `${pendingCount} appointment${pendingCount !== 1 ? 's' : ''} awaiting sync`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-center bg-muted p-3 rounded-lg">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={onSyncAll} 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    disabled={isSyncing || (pendingCount === 0 && failedCount === 0)}
                  >
                    {isSyncing ? (
                      <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Syncing...</>
                    ) : (
                      <><RefreshCw className="mr-2 h-4 w-4" /> Sync All</>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sync all pending appointments with Google Calendar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
      
      {hasIssues && (
        <div className="flex justify-end">
          <Button 
            variant="link" 
            size="sm"
            onClick={handleViewDetailed}
            className="text-xs"
          >
            View detailed sync status
          </Button>
        </div>
      )}
    </CardContent>
  );
};
