
export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  appointment_reminders: boolean;
  appointment_reminder_time: number;
  chat_notifications: boolean;
  marketing_emails: boolean;
  system_updates: boolean;
  created_at: string;
  updated_at: string;
}
