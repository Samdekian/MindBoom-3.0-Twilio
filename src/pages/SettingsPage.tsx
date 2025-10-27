
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Shield, Palette, Database } from "lucide-react";
import { useCalendarPreferences } from "@/hooks/use-calendar-preferences";
import { useNotificationSettings } from "@/hooks/use-notification-settings";
import { toast } from "sonner";

const SettingsPage: React.FC = () => {
  const { preferences: calendarPrefs, updatePreferences: updateCalendarPrefs, isLoading: calendarLoading } = useCalendarPreferences();
  const { settings: notificationSettings, updateSettings: updateNotificationSettings, isLoading: notificationLoading } = useNotificationSettings();

  const handleCalendarUpdate = async (key: string, value: any) => {
    try {
      await updateCalendarPrefs({ [key]: value });
    } catch (error) {
      console.error('Error updating calendar preferences:', error);
      toast.error('Failed to update calendar preferences');
    }
  };

  const handleNotificationUpdate = async (key: string, value: any) => {
    try {
      await updateNotificationSettings({ [key]: value });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  };

  if (calendarLoading || notificationLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences and settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-save drafts</Label>
                    <p className="text-sm text-muted-foreground">Automatically save form drafts</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show help tooltips</Label>
                    <p className="text-sm text-muted-foreground">Display helpful tooltips throughout the app</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable analytics</Label>
                    <p className="text-sm text-muted-foreground">Help improve the app by sharing usage data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {notificationSettings && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.email_enabled}
                      onCheckedChange={(checked) => handleNotificationUpdate('email_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive push notifications</p>
                    </div>
                    <Switch
                      checked={notificationSettings.push_enabled}
                      onCheckedChange={(checked) => handleNotificationUpdate('push_enabled', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Updates</Label>
                      <p className="text-sm text-muted-foreground">Get notified about system updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.system_updates}
                      onCheckedChange={(checked) => handleNotificationUpdate('system_updates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional emails</p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketing_emails}
                      onCheckedChange={(checked) => handleNotificationUpdate('marketing_emails', checked)}
                    />
                  </div>
                </div>
              )}
              <Badge variant="secondary">Real notification settings from Supabase</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calendar Settings */}
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Calendar Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {calendarPrefs && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Calendar Notifications</Label>
                      <p className="text-sm text-muted-foreground">Enable calendar-based notifications</p>
                    </div>
                    <Switch
                      checked={calendarPrefs.enabled}
                      onCheckedChange={(checked) => handleCalendarUpdate('enabled', checked)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notification Type</Label>
                    <select
                      value={calendarPrefs.notification_type}
                      onChange={(e) => handleCalendarUpdate('notification_type', e.target.value)}
                      className="w-full p-2 border rounded"
                    >
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="push">Push Notification</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Reminder Time (minutes before)</Label>
                    <select
                      value={calendarPrefs.notification_time_minutes}
                      onChange={(e) => handleCalendarUpdate('notification_time_minutes', parseInt(e.target.value))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="1440">1 day</option>
                    </select>
                  </div>
                </div>
              )}
              <Badge variant="secondary">Real calendar preferences from Supabase</Badge>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <select className="w-full p-2 border rounded" defaultValue="system">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <select className="w-full p-2 border rounded" defaultValue="medium">
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact mode</Label>
                    <p className="text-sm text-muted-foreground">Use more compact spacing</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Reduce animations</Label>
                    <p className="text-sm text-muted-foreground">Minimize animations for better performance</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <Button variant="outline">Reset to defaults</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
