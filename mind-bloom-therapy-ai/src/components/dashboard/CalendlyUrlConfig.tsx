
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Save, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendlyUrlField } from "./calendly/CalendlyUrlField";
import { VideoConferenceField } from "./calendly/VideoConferenceField";
import { VideoProviderField } from "./calendly/VideoProviderField";
import { WebhookSecretConfig } from "./calendly/WebhookSecretConfig";
import { OAuthStatus } from "./calendly/OAuthStatus";
import { WebhookInstructions } from "./calendly/WebhookInstructions";
import { WebhookEventLog } from "./calendly/WebhookEventLog";
import { useCalendlySettings } from "@/hooks/use-calendly-settings";
import { useCalendlyForm } from "@/hooks/use-calendly-form";
import { getValidVideoProvider } from "@/utils/calendly-validation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CalendlyUrlConfig = () => {
  const { settings, isLoading, error, updateSettings } = useCalendlySettings();
  const [webhookSecret, setWebhookSecret] = React.useState("");
  const form = useCalendlyForm({
    defaultValues: {
      calendlyUrl: "",
      enableVideo: true,
      videoProvider: "zoom",
    },
  });

  React.useEffect(() => {
    if (settings) {
      form.reset({
        calendlyUrl: settings.calendly_url || "",
        enableVideo: settings.video_enabled ?? true,
        videoProvider: getValidVideoProvider(settings.video_provider),
      });
    }
  }, [settings, form]);

  const handleOAuthConnect = () => {
    window.location.href = 'https://mlevmxueubhwfezfujxa.supabase.co/functions/v1/calendly-oauth';
  };

  const handleWebhookSecretSave = async () => {
    try {
      await updateSettings.mutateAsync({
        ...form.getValues(),
        calendly_webhook_signing_secret: webhookSecret,
      });
      setWebhookSecret("");
    } catch (err) {
      console.error("Error saving webhook secret:", err);
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Settings</CardTitle>
          <CardDescription>Could not load your calendar settings. Please try again later.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error.message || "An unexpected error occurred while loading your settings."}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Fetching your calendar settings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const onSubmit = async (data) => {
    try {
      await updateSettings.mutateAsync(data);
    } catch (err) {
      console.error("Error saving Calendly settings:", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendly Integration</CardTitle>
        <CardDescription>Configure your Calendly URL and webhook management</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                  <CalendlyUrlField form={form} />
                  <VideoConferenceField form={form} />
                  <VideoProviderField form={form} show={form.watch("enableVideo")} />
                  
                  <OAuthStatus
                    isConnected={settings?.is_oauth_connected}
                    onConnect={handleOAuthConnect}
                    lastTokenRefresh={settings?.token_expires_at}
                    userUri={settings?.user_uri}
                  />

                  {updateSettings.isError && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>Failed to save settings. Please try again.</AlertDescription>
                    </Alert>
                  )}
                </div>
                <CardFooter className="px-0">
                  <Button 
                    type="submit"
                    className="w-full md:w-auto"
                    disabled={updateSettings.isPending}
                  >
                    {updateSettings.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-6">
            <WebhookInstructions />
            
            <WebhookSecretConfig
              webhookSecret={webhookSecret}
              setWebhookSecret={setWebhookSecret}
              onSave={handleWebhookSecretSave}
              settings={settings}
            />
            
            {settings?.calendly_webhook_signing_secret && (
              <>
                {settings?.calendly_webhook_signing_secret && (
                  <WebhookEventLog />
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CalendlyUrlConfig;
