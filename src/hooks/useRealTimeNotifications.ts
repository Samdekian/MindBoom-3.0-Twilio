
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

interface NotificationData {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuthRBAC();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const { data: initialNotifications, isLoading, error } = useQuery({
    queryKey: ['realtime-notifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (initialNotifications) {
      setNotifications(initialNotifications);
    }
  }, [initialNotifications]);

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('public:notifications')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log('Change received!', payload)
          // Optimistically update the notifications state
          setNotifications((prevNotifications) => {
            const newNotification = payload.new as NotificationData;
            if (newNotification && newNotification.id) {
              // Check if the notification already exists
              const existingIndex = prevNotifications.findIndex((notif) => notif.id === newNotification.id);

              if (existingIndex !== -1) {
                // If it exists, replace it
                const newNotifications = [...prevNotifications];
                newNotifications[existingIndex] = newNotification;
                return newNotifications;
              } else {
                // If it doesn't exist, add it to the beginning
                return [newNotification, ...prevNotifications];
              }
            }
            return prevNotifications;
          });
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id]);

  return {
    notifications,
    isLoading,
    error,
  };
};
