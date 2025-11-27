import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export interface CalendarPreferences {
  id: string;
  enabled: boolean;
  notification_type: 'email' | 'sms' | 'push';
  notification_time_minutes: number;
}

export function useCalendarPreferences() {
  const { user } = useAuthRBAC();
  const [preferences, setPreferences] = useState<CalendarPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const { data, error: prefsError } = await supabase
          .from('calendar_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (prefsError) {
          if (prefsError.code === 'PGRST116') {
            // No preferences found, create default ones
            const defaultPrefs = {
              user_id: user.id,
              enabled: true,
              notification_type: 'email' as const,
              notification_time_minutes: 30,
            };

            const { data: newPrefs, error: createError } = await supabase
              .from('calendar_preferences')
              .insert(defaultPrefs)
              .select()
              .single();

            if (createError) throw createError;
            setPreferences(newPrefs);
          } else {
            throw prefsError;
          }
        } else {
          setPreferences(data);
        }
      } catch (error) {
        console.error('Error fetching calendar preferences:', error);
        setError('Failed to load calendar preferences');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.id]);

  const updatePreferences = async (updates: Partial<CalendarPreferences>) => {
    if (!user?.id || !preferences) return;

    try {
      const { data, error } = await supabase
        .from('calendar_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setPreferences(data);
      return data;
    } catch (error) {
      console.error('Error updating calendar preferences:', error);
      throw error;
    }
  };

  return { preferences, isLoading, error, updatePreferences };
}