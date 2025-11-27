import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export interface GoogleCalendar {
  id: string;
  summary: string;
  description?: string;
  accessRole: string;
  primary?: boolean;
}

export function useGoogleCalendarCalendars() {
  const { user } = useAuthRBAC();

  const { 
    data: calendarList, 
    isLoading, 
    error,
    refetch: refetchCalendars
  } = useQuery({
    queryKey: ['google-calendar-calendars'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("google-calendar-list-calendars");
      if (error) {
        throw error;
      }
      return (data?.calendars || []) as GoogleCalendar[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const { 
    data: selectedSettings, 
    refetch: refetchSettings 
  } = useQuery({
    queryKey: ['google-calendar-selected-calendar'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("therapist_settings")
        .select("google_calendar_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data?.google_calendar_id || null;
    },
    enabled: !!user,
  });
  
  const refetch = async () => {
    await Promise.all([
      refetchCalendars(),
      refetchSettings()
    ]);
  };

  return {
    calendarList,
    isLoading,
    error,
    selectedCalendarId: selectedSettings,
    refetch,
  };
}
