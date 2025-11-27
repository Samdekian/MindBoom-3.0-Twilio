import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { toast } from 'sonner';

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  appointment_reminders: boolean;
  appointment_reminder_time: number;
  chat_notifications: boolean;
  marketing_emails: boolean;
  system_updates: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationSettings = () => {
  const { user } = useAuthRBAC();
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['notification-settings', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Settings don't exist, create default ones
          const defaultSettings = {
            user_id: user.id,
            email_enabled: true,
            push_enabled: true,
            sms_enabled: false,
            appointment_reminders: true,
            appointment_reminder_time: 60,
            chat_notifications: true,
            marketing_emails: false,
            system_updates: true
          };

          const { data: newSettings, error: createError } = await supabase
            .from('notification_preferences')
            .insert(defaultSettings)
            .select()
            .single();

          if (createError) throw createError;
          return newSettings;
        }
        throw error;
      }

      return data;
    },
    enabled: !!user?.id
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (updates: Partial<NotificationSettings>) => {
      if (!user?.id) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['notification-settings', user?.id], data);
      toast.success('Notification settings updated');
    },
    onError: (error) => {
      console.error('Error updating notification settings:', error);
      toast.error('Failed to update notification settings');
    }
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending
  };
};