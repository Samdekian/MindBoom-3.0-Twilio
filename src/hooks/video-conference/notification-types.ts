
export type NotificationType = 'email' | 'sms' | 'push' | 'both' | 'none';

export interface NotificationPreference {
  type: NotificationType;
  reminderTime: number;
  phoneNumber?: string;
}
