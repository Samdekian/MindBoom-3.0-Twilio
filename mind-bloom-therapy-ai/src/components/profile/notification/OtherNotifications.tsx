
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationPreferences } from "@/types/notification-preferences";

interface OtherNotificationsProps {
  preferences: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences, value: boolean) => void;
}

export const OtherNotifications = ({
  preferences,
  onToggle,
}: OtherNotificationsProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Bell className="h-5 w-5" />
        {t("otherNotifications") || "Other Notifications"}
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="marketing_emails">
            {t("marketingEmails") || "Marketing Emails"}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t("marketingEmailsDescription") || "Receive updates about new features and promotions"}
          </p>
        </div>
        <Switch
          id="marketing_emails"
          checked={preferences.marketing_emails}
          onCheckedChange={(checked) => onToggle('marketing_emails', checked)}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="system_updates">
            {t("systemUpdates") || "System Updates"}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t("systemUpdatesDescription") || "Receive important system updates and notifications"}
          </p>
        </div>
        <Switch
          id="system_updates"
          checked={preferences.system_updates}
          onCheckedChange={(checked) => onToggle('system_updates', checked)}
        />
      </div>
    </div>
  );
};
