
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationPreferences } from "@/types/notification-preferences";

interface AppointmentNotificationsProps {
  preferences: NotificationPreferences;
  onToggle: (key: keyof NotificationPreferences, value: boolean) => void;
  onChange: (key: keyof NotificationPreferences, value: any) => void;
}

export const AppointmentNotifications = ({
  preferences,
  onToggle,
  onChange,
}: AppointmentNotificationsProps) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Calendar className="h-5 w-5" />
        {t("appointmentNotifications") || "Appointment Notifications"}
      </h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="appointment_reminders">
            {t("appointmentReminders") || "Appointment Reminders"}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t("appointmentRemindersDescription") || "Get reminders for upcoming appointments"}
          </p>
        </div>
        <Switch
          id="appointment_reminders"
          checked={preferences.appointment_reminders}
          onCheckedChange={(checked) => onToggle('appointment_reminders', checked)}
        />
      </div>
      
      {preferences.appointment_reminders && (
        <div className="space-y-2 pt-2 pl-6 border-l-2 border-muted">
          <Label>{t("reminderTime") || "Reminder Time"}</Label>
          <Select
            value={String(preferences.appointment_reminder_time)}
            onValueChange={(value) => onChange('appointment_reminder_time', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("selectReminderTime") || "Select reminder time"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 {t("minutesBefore") || "minutes before"}</SelectItem>
              <SelectItem value="30">30 {t("minutesBefore") || "minutes before"}</SelectItem>
              <SelectItem value="60">1 {t("hourBefore") || "hour before"}</SelectItem>
              <SelectItem value="120">2 {t("hoursBefore") || "hours before"}</SelectItem>
              <SelectItem value="1440">24 {t("hoursBefore") || "hours before"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};
