
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Settings, AlertTriangle } from "lucide-react";
import { useCalendarPreferences } from "@/hooks/use-calendar-preferences";
import { useSessionHistory } from "@/hooks/use-session-history";
import { format } from "date-fns";

const CalendarPage = () => {
  const { preferences, isLoading: prefsLoading, updatePreferences } = useCalendarPreferences();
  const { sessions, isLoading: sessionsLoading } = useSessionHistory();

  const upcomingSessions = sessions.filter(session => 
    new Date(session.start_time) > new Date() && 
    ['scheduled', 'confirmed'].includes(session.status)
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage your appointments</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Sessions</CardTitle>
                  <CardDescription>Your next therapy appointments</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : upcomingSessions.length > 0 ? (
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{session.title}</h4>
                        <Badge variant="secondary">{session.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.start_time), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No upcoming sessions</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Calendar Preferences</CardTitle>
              <CardDescription>Manage your notification settings</CardDescription>
            </CardHeader>
            <CardContent>
              {prefsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : preferences ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Notifications Enabled</span>
                    <Badge variant={preferences.enabled ? "default" : "secondary"}>
                      {preferences.enabled ? "On" : "Off"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Notification Type</span>
                    <Badge variant="outline">{preferences.notification_type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reminder Time</span>
                    <Badge variant="outline">{preferences.notification_time_minutes} min before</Badge>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => updatePreferences({ enabled: !preferences.enabled })}
                  >
                    {preferences.enabled ? "Disable" : "Enable"} Notifications
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
                  <p className="text-muted-foreground">Failed to load preferences</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
