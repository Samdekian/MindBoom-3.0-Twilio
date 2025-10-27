
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { AlertTriangle, CheckCircle, Clock, Webhook } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const WebhookTester = ({ webhookSecret }: { webhookSecret?: string }) => {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [eventType, setEventType] = useState<string>("invitee.created");
  const [testMode, setTestMode] = useState<"basic" | "advanced">("basic");

  const calendlyEvents = [
    { value: "invitee.created", label: "Invitee Created" },
    { value: "invitee.canceled", label: "Invitee Canceled" },
    { value: "routing_form.submission", label: "Form Submission" },
    { value: "invitee.no_show", label: "No Show" }
  ];

  const testWebhookSignature = async () => {
    if (!webhookSecret) {
      toast({
        title: "Error",
        description: "Please configure a webhook signing secret first",
        variant: "destructive",
      });
      return;
    }

    setIsTestingWebhook(true);
    setTestResult(null);

    try {
      const testPayload = {
        event: eventType,
        payload: {
          scheduling_user: {
            uri: `https://api.calendly.com/users/${(await supabase.auth.getUser()).data.user?.id}`
          },
          created_at: new Date().toISOString(),
          event_uuid: `test-event-${Date.now()}`,
          invitee: {
            email: "test@example.com",
            name: "Test User"
          }
        }
      };

      const response = await fetch('https://mlevmxueubhwfezfujxa.supabase.co/functions/v1/calendly-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Generate a test signature using a similar method as Calendly
          'calendly-webhook-signature': `v1=${testPayload.event}${testPayload.payload.created_at}`,
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        setTestResult('success');
        toast({
          title: "Success",
          description: `Webhook test with event "${eventType}" passed`,
        });
      } else {
        setTestResult('error');
        throw new Error('Webhook test failed');
      }
    } catch (error) {
      console.error('Webhook test error:', error);
      setTestResult('error');
      toast({
        title: "Error",
        description: "Webhook signature verification test failed",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Tester
        </CardTitle>
        <CardDescription>
          Test your webhook configuration with simulated Calendly events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="basic" onValueChange={(value) => setTestMode(value as "basic" | "advanced")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Test</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Test</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={testWebhookSignature}
                disabled={isTestingWebhook || !webhookSecret}
                variant="outline"
                className="w-full"
              >
                {isTestingWebhook ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Webhook className="mr-2 h-4 w-4" />
                    Test Webhook Signature
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Type</label>
                <Select
                  value={eventType}
                  onValueChange={setEventType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {calendlyEvents.map((event) => (
                      <SelectItem key={event.value} value={event.value}>
                        {event.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button
                onClick={testWebhookSignature}
                disabled={isTestingWebhook || !webhookSecret}
                variant="outline"
                className="w-full"
              >
                {isTestingWebhook ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Testing {eventType}...
                  </>
                ) : (
                  <>
                    <Webhook className="mr-2 h-4 w-4" />
                    Test With Selected Event
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {testResult && (
          <Alert variant={testResult === 'success' ? "default" : "destructive"} className={testResult === 'success' ? "bg-green-50 dark:bg-green-900/30" : undefined}>
            {testResult === 'success' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Test Passed</AlertTitle>
                <AlertDescription>
                  Webhook signature verification is working correctly
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Test Failed</AlertTitle>
                <AlertDescription>
                  Webhook signature verification failed. Please check your configuration
                </AlertDescription>
              </>
            )}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
