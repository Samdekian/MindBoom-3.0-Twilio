
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { NotificationPreferences } from "@/types/notification-preferences";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationChannelsProps {
  preferences: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences, value: boolean) => void;
}

export const NotificationChannels = ({ preferences, onToggle }: NotificationChannelsProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">
        {t("notificationChannels") || "Notification Channels"}
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="email_enabled">{t("emailNotifications") || "Email Notifications"}</Label>
          <p className="text-sm text-muted-foreground">
            {t("emailNotificationsDescription") || "Receive notifications via email"}
          </p>
        </div>
        <Switch
          id="email_enabled"
          checked={preferences.email_enabled}
          onCheckedChange={(checked) => onToggle('email_enabled', checked)}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="sms_enabled">{t("smsNotifications") || "SMS Notifications"}</Label>
          <p className="text-sm text-muted-foreground">
            {t("smsNotificationsDescription") || "Receive notifications via SMS"}
          </p>
        </div>
        <Switch
          id="sms_enabled"
          checked={preferences.sms_enabled}
          onCheckedChange={(checked) => onToggle('sms_enabled', checked)}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="push_enabled">{t("pushNotifications") || "Push Notifications"}</Label>
          <p className="text-sm text-muted-foreground">
            {t("pushNotificationsDescription") || "Receive browser push notifications"}
          </p>
        </div>
        <Switch
          id="push_enabled"
          checked={preferences.push_enabled}
          onCheckedChange={(checked) => onToggle('push_enabled', checked)}
        />
      </div>
    </div>
  );
};
