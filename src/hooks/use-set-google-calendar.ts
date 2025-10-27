
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

export const useSetGoogleCalendar = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const setGoogleCalendar = useMutation({
    mutationFn: async (calendarId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .update({ google_calendar_id: calendarId })
        .eq('id', user.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-calendars'] });
      toast({
        title: "Calendar Updated",
        description: "Google Calendar has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update Google Calendar.",
        variant: "destructive",
      });
    },
  });

  const clearGoogleCalendar = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({ google_calendar_id: null })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-calendars'] });
      toast({
        title: "Calendar Cleared",
        description: "Google Calendar has been cleared.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Clear Failed",
        description: error.message || "Failed to clear Google Calendar.",
        variant: "destructive",
      });
    },
  });

  return {
    mutate: setGoogleCalendar.mutate,
    isPending: setGoogleCalendar.isPending,
    setGoogleCalendar,
    clearGoogleCalendar,
    isSettingCalendar: setGoogleCalendar.isPending,
    isClearingCalendar: clearGoogleCalendar.isPending,
    selectedCalendarId: null, // This would come from a query
    isLoading: false,
  };
};
