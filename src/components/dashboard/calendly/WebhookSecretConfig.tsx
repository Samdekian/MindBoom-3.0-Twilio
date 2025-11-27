
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WebhookTester } from "./WebhookTester";

interface WebhookSecretConfigProps {
  webhookSecret: string;
  setWebhookSecret: (secret: string) => void;
  onSave: () => void;
  settings: any;
}

export const WebhookSecretConfig = ({
  webhookSecret,
  setWebhookSecret,
  onSave,
  settings,
}: WebhookSecretConfigProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Webhook Configuration</CardTitle>
            <CardDescription>
              Set up your Calendly webhook signing secret for secure event verification
            </CardDescription>
          </div>
          {settings?.calendly_webhook_signing_secret && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              Configured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              Webhook secret is {settings?.calendly_webhook_signing_secret ? "configured" : "not configured"}. 
              {settings?.calendly_webhook_signing_secret ? " You can update or test it." : " Set one to enable secure webhook event verification."}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 whitespace-nowrap">
                <Key className="h-4 w-4" />
                {settings?.calendly_webhook_signing_secret ? "Update" : "Configure"} Secret
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configure Webhook Secret</DialogTitle>
                <DialogDescription>
                  Enter your Calendly webhook signing secret to verify incoming webhook events
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Input
                    type="password"
                    placeholder="Enter webhook signing secret"
                    value={webhookSecret}
                    onChange={(e) => setWebhookSecret(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={onSave}
                  disabled={!webhookSecret}
                  className="w-full"
                >
                  Save Webhook Secret
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {settings?.calendly_webhook_signing_secret && (
          <WebhookTester webhookSecret={settings.calendly_webhook_signing_secret} />
        )}
      </CardContent>
    </Card>
  );
};
