
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { NotificationType, NotificationPreference } from './video-conference/notification-types';

export function useAppointmentNotifications(appointmentId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const getNotificationPreferences = async (appointmentId: string) => {
    try {
      // In a real app, this would fetch from a notification_preferences table
      // For now, return mock data
      return {
        type: 'email' as NotificationType,
        reminderTime: 24,
        phoneNumber: ''
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  };

  const saveNotificationPreferences = async (
    appointmentId: string, 
    preferences: NotificationPreference
  ) => {
    setIsSaving(true);
    try {
      // In a real application, this would save to a notification_preferences table
      // For now, just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Notification preferences saved',
        description: 'Your notification preferences have been updated'
      });
      
      return { success: true };
    } catch (error) {
      toast({
        title: 'Error saving preferences',
        description: 'There was a problem saving your notification preferences',
        variant: 'destructive'
      });
      
      return { success: false };
    } finally {
      setIsSaving(false);
    }
  };

  const sendTestNotification = async (type: NotificationType, phoneNumber?: string) => {
    try {
      // In a real app, this would send an actual test notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Test notification sent',
        description: `A test notification was sent via ${type}${type === 'sms' || type === 'both' ? ' to ' + phoneNumber : ''}`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Error sending test notification',
        description: 'There was a problem sending the test notification',
        variant: 'destructive'
      });
      
      return false;
    }
  };

  return {
    getNotificationPreferences,
    saveNotificationPreferences,
    sendTestNotification,
    isSaving
  };
}

// Re-export the NotificationType
export type { NotificationType, NotificationPreference } from './video-conference/notification-types';
