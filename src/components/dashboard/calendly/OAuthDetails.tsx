
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw, Link2Icon, XCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface OAuthDetailsProps {
  isConnected: boolean;
  onConnect: () => void;
  lastTokenRefresh?: string | null;
  userUri?: string | null;
}

export const OAuthDetails = ({ 
  isConnected, 
  onConnect,
  lastTokenRefresh,
  userUri
}: OAuthDetailsProps) => {
  const { toast } = useToast();

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('therapist_settings')
        .update({
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          user_uri: null,
          organization_uri: null,
          is_oauth_connected: false
        })
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Calendly OAuth connection has been removed.",
      });

      // Refresh the page to update the state
      window.location.reload();
    } catch (err) {
      console.error("Error disconnecting Calendly:", err);
      toast({
        title: "Error",
        description: "Failed to disconnect Calendly. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefreshToken = () => {
    // Redirect to OAuth flow to get new tokens
    window.location.href = 'https://mlevmxueubhwfezfujxa.supabase.co/functions/v1/calendly-oauth';
  };

  if (!isConnected) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Calendly OAuth Connection</h3>
            <p className="text-sm text-muted-foreground">
              Connect your Calendly account securely using OAuth for enhanced integration
            </p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onConnect}
          >
            <Link2Icon className="h-4 w-4" />
            Connect Calendly
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <Alert variant="default" className="bg-green-50 dark:bg-green-900/30">
          <CheckCircle className="h-4 w-4 stroke-green-500" />
          <AlertDescription>
            Your Calendly account is successfully connected via OAuth
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          {userUri && (
            <p className="text-sm text-muted-foreground">
              Connected Account: {userUri.split('/').pop()}
            </p>
          )}
          {lastTokenRefresh && (
            <p className="text-sm text-muted-foreground">
              Last Token Refresh: {new Date(lastTokenRefresh).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleRefreshToken}
          >
            <RefreshCcw className="h-4 w-4" />
            Refresh Token
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleDisconnect}
          >
            <XCircle className="h-4 w-4" />
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
