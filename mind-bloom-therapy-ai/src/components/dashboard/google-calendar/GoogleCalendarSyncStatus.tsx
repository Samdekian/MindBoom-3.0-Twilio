
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, AlertTriangle, Clock, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGoogleCalendarWebhookSetup } from "@/hooks/use-google-calendar-webhook-setup";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface GoogleCalendarSyncStatusProps {
  calendarId: string | null;
}

export const GoogleCalendarSyncStatus: React.FC<GoogleCalendarSyncStatusProps> = ({
  calendarId,
}) => {
  const {
    webhookConfig,
    isWebhookSetup,
    setupWebhook,
    deleteWebhook,
    refetchWebhook
  } = useGoogleCalendarWebhookSetup();
  
  // Calculate if the webhook is expired or about to expire
  const isExpired = React.useMemo(() => {
    if (!webhookConfig?.expiration_time) return false;
    return new Date(webhookConfig.expiration_time) < new Date();
  }, [webhookConfig]);
  
  const isExpiringSoon = React.useMemo(() => {
    if (!webhookConfig?.expiration_time) return false;
    const expiry = new Date(webhookConfig.expiration_time);
    const now = new Date();
    const daysDiff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff < 2 && daysDiff > 0; // Less than 2 days left
  }, [webhookConfig]);
  
  const syncStatusText = React.useMemo(() => {
    if (!calendarId) return "No calendar selected";
    if (!isWebhookSetup) return "Real-time sync not enabled";
    if (isExpired) return "Sync expired";
    if (isExpiringSoon) return "Sync expiring soon";
    return "Real-time sync active";
  }, [calendarId, isWebhookSetup, isExpired, isExpiringSoon]);
  
  const handleSetupWebhook = () => {
    setupWebhook.mutate(calendarId || 'primary');
  };
  
  const handleRenewWebhook = () => {
    setupWebhook.mutate(calendarId || 'primary');
  };
  
  const handleDeleteWebhook = () => {
    deleteWebhook.mutate(calendarId || 'primary');
  };
  
  if (!calendarId) {
    return (
      <div className="mt-4 p-2 bg-gray-50 rounded-md text-sm text-muted-foreground">
        Select a calendar to enable real-time sync
      </div>
    );
  }
  
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Real-time Sync Status</h3>
        <Badge 
          variant={
            isExpired ? "destructive" :
            isExpiringSoon ? "outline" :
            isWebhookSetup ? "default" : // Changed from "success" to "default"
            "secondary"
          }
          className="flex gap-1 items-center"
        >
          {isExpired ? <X className="h-3 w-3" /> : 
           isExpiringSoon ? <AlertTriangle className="h-3 w-3" /> : 
           isWebhookSetup ? <Check className="h-3 w-3" /> : 
           <Clock className="h-3 w-3" />}
          {syncStatusText}
        </Badge>
      </div>
      
      {isWebhookSetup && webhookConfig && (
        <div className="text-xs text-muted-foreground mb-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <span className="underline dotted">
                  Subscription expires: {format(new Date(webhookConfig.expiration_time), 'MMM d, yyyy')}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Google Calendar webhooks expire automatically after one week and need to be renewed</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
      
      <div className="flex gap-2">
        {!isWebhookSetup && (
          <Button 
            size="sm" 
            onClick={handleSetupWebhook}
            disabled={setupWebhook.isPending}
            variant="default"
          >
            {setupWebhook.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Enable Real-time Sync
          </Button>
        )}
        
        {(isWebhookSetup && (isExpired || isExpiringSoon)) && (
          <Button 
            size="sm" 
            onClick={handleRenewWebhook}
            disabled={setupWebhook.isPending}
            variant="default"
          >
            {setupWebhook.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Renew Sync
          </Button>
        )}
        
        {isWebhookSetup && (
          <Button 
            size="sm" 
            onClick={handleDeleteWebhook}
            disabled={deleteWebhook.isPending}
            variant="outline"
          >
            {deleteWebhook.isPending && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
            Disable Real-time Sync
          </Button>
        )}
      </div>
    </div>
  );
};
