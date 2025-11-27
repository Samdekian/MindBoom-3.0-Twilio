
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Apple, Check, Link, RefreshCw } from "lucide-react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAppleCalendar } from "@/hooks/use-apple-calendar";
import { useAppointments } from "@/hooks/use-appointments";

const AppleCalendarIntegration = () => {
  const { user } = useAuthRBAC();
  const { isConnected, isLoading } = useAppleCalendar();
  const { appointments } = useAppointments();
  const [syncingAll, setSyncingAll] = React.useState(false);

  const handleConnect = () => {
    toast({
      title: "Apple Calendar Integration",
      description: "Apple Calendar integration is coming soon!",
      variant: "default",
    });
  };

  const handleDisconnect = async () => {
    toast({
      title: "Apple Calendar Integration",
      description: "Apple Calendar integration is coming soon!",
      variant: "default",
    });
  };
  
  const handleSyncAllAppointments = async () => {
    toast({
      title: "Apple Calendar Integration",
      description: "Apple Calendar integration is coming soon!",
      variant: "default",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Apple Calendar Integration
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
          <Apple className="h-5 w-5" />
          Apple Calendar Integration
        </CardTitle>
        <CardDescription>
          {isConnected
            ? "Your Apple Calendar is connected. Appointments will be synced automatically."
            : "Connect your Apple Calendar to sync appointments (Coming Soon)."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
            <p className="font-medium">Apple Calendar integration is coming soon!</p>
            <p className="mt-2">This feature is currently under development and will be available in a future update.</p>
          </div>
          
          <Button 
            onClick={handleConnect} 
            className="bg-slate-800 hover:bg-slate-950 text-white"
            disabled
          >
            <Link className="h-4 w-4 mr-2" />
            Connect Apple Calendar
            <span className="ml-2 text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full">Soon</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppleCalendarIntegration;
