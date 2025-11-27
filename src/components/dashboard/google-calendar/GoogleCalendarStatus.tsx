
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Link, Loader2 } from "lucide-react";

interface GoogleCalendarStatusProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isConnectLoading?: boolean;
  isDisconnectLoading?: boolean;
}

export const GoogleCalendarStatus: React.FC<GoogleCalendarStatusProps> = ({
  isConnected,
  onConnect,
  onDisconnect,
  isConnectLoading = false,
  isDisconnectLoading = false,
}) => {
  return (
    <CardContent>
      {isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span>Connected to Google Calendar</span>
          </div>
          <Button 
            variant="outline" 
            onClick={onDisconnect}
            className="mt-2"
            disabled={isDisconnectLoading}
          >
            {isDisconnectLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Disconnect Calendar
          </Button>
        </div>
      ) : (
        <Button 
          onClick={onConnect} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isConnectLoading}
        >
          {isConnectLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Link className="h-4 w-4 mr-2" />
          )}
          Connect Google Calendar
        </Button>
      )}
    </CardContent>
  );
};
