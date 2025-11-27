import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useToast } from "@/components/ui/use-toast"; // Updated import path
import { supabase } from "@/integrations/supabase/client";
import { useOptimizedGoogleCalendar } from "@/hooks/use-optimized-google-calendar";
import { useAppointments } from "@/hooks/use-appointments";
import { GoogleCalendarStatus } from "./google-calendar/GoogleCalendarStatus";
import { GoogleCalendarSyncStats } from "./google-calendar/GoogleCalendarSyncStats";
import GoogleCalendarSelector from "./GoogleCalendarSelector";
import { useAppointmentSyncStatus } from "@/hooks/use-appointment-sync-status";
import { useBulkAppointmentSync } from "@/hooks/appointment/use-bulk-appointment-sync"; // Updated import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarSyncPerformance from "./CalendarSyncPerformance";

const OptimizedGoogleCalendarIntegration = () => {
  const { isLoading, isConnected, calendarId, calendarTitle } = useOptimizedGoogleCalendar();
  const { user } = useAuthRBAC();
  const { appointments } = useAppointments();
  const { toast } = useToast();
  const [connectLoading, setConnectLoading] = React.useState(false);
  const [disconnectLoading, setDisconnectLoading] = React.useState(false);
  const { syncAllPendingAppointments, isSyncing } = useBulkAppointmentSync(); // Updated to use the new hook directly

  useAppointmentSyncStatus();

  const pendingAppointments = appointments?.filter(apt => 
    apt.sync_status === 'pending' || !apt.sync_status
  ).length || 0;
  
  const failedAppointments = appointments?.filter(apt => 
    apt.sync_status === 'failed'
  ).length || 0;

  const handleConnect = async () => {
    try {
      setConnectLoading(true);
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("googleOAuthState", state);
      
      const { data, error } = await supabase.functions.invoke("google-calendar-oauth", {
        body: { action: "getAuthUrl", state },
      });
      
      if (error) throw error;
      
      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to start Google authentication:", error);
      toast({
        title: "Authentication Failed",
        description: "Could not connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setDisconnectLoading(true);
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      const { error } = await supabase
        .from("therapist_settings")
        .update({
          is_oauth_connected: false,
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          google_calendar_id: null
        })
        .eq("user_id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Calendar.",
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Failed to disconnect from Google Calendar:", error);
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect from Google Calendar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDisconnectLoading(false);
    }
  };

  const handleSyncAll = async () => {
    await syncAllPendingAppointments.mutateAsync();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Google Calendar Integration
        </CardTitle>
        <CardDescription>
          {isConnected
            ? calendarId 
              ? `Currently syncing with: ${calendarTitle || "Selected Calendar"}`
              : "Select a calendar to start syncing appointments"
            : "Connect your Google Calendar to sync appointments."}
        </CardDescription>
      </CardHeader>
      
      <GoogleCalendarStatus 
        isConnected={isConnected}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        isConnectLoading={connectLoading}
        isDisconnectLoading={disconnectLoading}
      />

      {isConnected && !isLoading && (
        <Tabs defaultValue="settings" className="w-full">
          <div className="px-6">
            <TabsList className="mb-4">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="settings">
            <GoogleCalendarSelector />
            <GoogleCalendarSyncStats 
              pendingCount={pendingAppointments}
              failedCount={failedAppointments}
              onSyncAll={handleSyncAll} 
              isSyncing={isSyncing}
            />
          </TabsContent>
          
          <TabsContent value="performance">
            <CalendarSyncPerformance />
          </TabsContent>
        </Tabs>
      )}
    </Card>
  );
};

export default OptimizedGoogleCalendarIntegration;
