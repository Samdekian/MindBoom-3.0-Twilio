
import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { NotificationChannels } from "./notification/NotificationChannels";
import { AppointmentNotifications } from "./notification/AppointmentNotifications";
import { OtherNotifications } from "./notification/OtherNotifications";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { NotificationPreferences as NotificationPreferencesType } from "@/types/notification-preferences";

const NotificationPreferences = () => {
  const { t } = useLanguage();
  const { preferences, isLoading, updatePreferences } = useNotificationPreferences();

  const handleToggle = (key: keyof NotificationPreferencesType, value: boolean) => {
    updatePreferences.mutate({ [key]: value });
  };

  const handleChange = (key: keyof NotificationPreferencesType, value: any) => {
    updatePreferences.mutate({ [key]: value });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("notificationPreferences") || "Notification Preferences"}</CardTitle>
        <CardDescription>
          {t("notificationPreferencesDescription") || "Manage how and when you receive notifications"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <NotificationChannels 
          preferences={preferences} 
          onToggle={handleToggle} 
        />
        
        <Separator />
        
        <AppointmentNotifications 
          preferences={preferences} 
          onToggle={handleToggle}
          onChange={handleChange}
        />
        
        <Separator />
        
        <OtherNotifications 
          preferences={preferences} 
          onToggle={handleToggle}
        />
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
