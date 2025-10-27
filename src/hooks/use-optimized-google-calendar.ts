import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

export const useOptimizedGoogleCalendar = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [calendarTitle, setCalendarTitle] = useState<string | null>(null);

  // Fetch events from Google Calendar
  const { data: events, refetch: refetchEvents } = useQuery({
    queryKey: ['google-calendar-events', calendarId],
    queryFn: async () => {
      if (!calendarId || !isConnected) return [];

      const { data, error } = await supabase.functions.invoke('google-calendar-events', {
        body: { calendarId }
      });

      if (error) {
        console.error("Error fetching calendar events:", error);
        return [];
      }

      return data?.events || [];
    },
    enabled: !!calendarId && isConnected,
  });

  useEffect(() => {
    const checkConnection = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('therapist_settings')
          .select('is_oauth_connected, google_calendar_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching therapist settings:", error);
          setIsLoading(false);
          return;
        }

        setIsConnected(data?.is_oauth_connected || false);
        setCalendarId(data?.google_calendar_id || null);
        
        // Fetch calendar title if calendarId exists
        if (data?.google_calendar_id) {
          const { data: calendarData, error: calendarError } = await supabase.functions.invoke('google-calendar-oauth', {
            body: {
              action: 'getCalendar',
              calendarId: data.google_calendar_id
            }
          });

          if (calendarError) {
            console.error("Error fetching calendar title:", calendarError);
          } else {
            setCalendarTitle(calendarData?.summary || null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();
  }, [user?.id, supabase]);

  const connect = async () => {
    try {
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("googleOAuthState", state);

      const { data, error } = await supabase.functions.invoke("google-calendar-oauth", {
        body: { action: "getAuthUrl", state },
      });

      if (error) throw error;

      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to start Google authentication:", error);
      toast({
        title: "Authentication Failed",
        description: "Could not connect to Google Calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const disconnect = async () => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase
        .from("therapist_settings")
        .update({
          is_oauth_connected: false,
          access_token: null,
          refresh_token: null,
          token_expires_at: null,
          google_calendar_id: null
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Calendar.",
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['therapist_settings'] });
      setIsConnected(false);
      setCalendarId(null);
    } catch (error) {
      console.error("Failed to disconnect from Google Calendar:", error);
      toast({
        title: "Disconnection Failed",
        description: "Could not disconnect from Google Calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  return { 
    isConnected, 
    isLoading, 
    calendarId, 
    calendarTitle, 
    events: events || [], 
    refetchEvents, 
    connect, 
    disconnect 
  };
};
