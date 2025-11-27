
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Link, RefreshCw } from "lucide-react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleCalendar } from "@/hooks/use-google-calendar";
import { useAppointments } from "@/hooks/use-appointments";

const GoogleCalendarIntegration = () => {
  const { user } = useAuthRBAC();
  const { isConnected, isLoading } = useGoogleCalendar();
  const { appointments } = useAppointments();
  const [syncingAll, setSyncingAll] = React.useState(false);

  const handleConnect = () => {
    toast({
      title: "Google Calendar Integration",
      description: "Google Calendar integration is coming soon!",
      variant: "default",
    });
  };

  const handleDisconnect = async () => {
    toast({
      title: "Google Calendar Integration",
      description: "Google Calendar integration is coming soon!",
      variant: "default",
    });
  };
  
  const handleSyncAllAppointments = async () => {
    toast({
      title: "Google Calendar Integration",
      description: "Google Calendar integration is coming soon!",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse h-10 w-32 bg-muted rounded-md"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          {isConnected
            ? "Your Google Calendar is connected. Appointments will be synced automatically."
            : "Connect your Google Calendar to sync appointments (Coming Soon)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
            <p className="font-medium">Google Calendar integration is coming soon!</p>
            <p className="mt-2">This feature is currently under development and will be available in a future update.</p>
          </div>
          
          <Button 
            onClick={handleConnect} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled
          >
            <Link className="h-4 w-4 mr-2" />
            Connect Google Calendar
            <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Soon</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCalendarIntegration;
