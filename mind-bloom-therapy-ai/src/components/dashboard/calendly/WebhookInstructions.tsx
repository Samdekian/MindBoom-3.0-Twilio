
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export const WebhookInstructions = () => {
  return (
    <Alert variant="default" className="bg-blue-50 dark:bg-blue-900/30">
      <AlertTriangle className="h-4 w-4 stroke-blue-500" />
      <AlertDescription>
        <div className="space-y-2">
          <p>
            To complete Calendly integration:
          </p>
          <ol className="list-decimal list-inside text-sm">
            <li>Copy the webhook URL: <code>https://mlevmxueubhwfezfujxa.supabase.co/functions/v1/calendly-webhook</code></li>
            <li>Add this URL to your Calendly webhook settings</li>
            <li>Select relevant events like 'Invitee Created' and 'Invitee Canceled'</li>
          </ol>
        </div>
      </AlertDescription>
    </Alert>
  );
};
