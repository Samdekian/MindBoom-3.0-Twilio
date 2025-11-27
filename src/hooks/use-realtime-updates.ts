import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { RealtimeChannel } from "@supabase/supabase-js";

export const useRealTimeUpdates = (userId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  useEffect(() => {
    if (!userId) {
      setIsConnected(false);
      return;
    }

    const channelList: RealtimeChannel[] = [];

    // Subscribe to mood entries changes
    const moodChannel = supabase
      .channel('mood-entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_entries',
          filter: `patient_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Real-time] Mood entry change:', payload);
          queryClient.invalidateQueries({ queryKey: ['mood-entries', userId] });
          queryClient.invalidateQueries({ queryKey: ['mood-streak', userId] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "Mood logged successfully",
              description: "Your mood entry has been saved.",
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });
    
    channelList.push(moodChannel);

    // Subscribe to patient goals changes
    const goalsChannel = supabase
      .channel('patient-goals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_goals',
          filter: `patient_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Real-time] Goal change:', payload);
          queryClient.invalidateQueries({ queryKey: ['patient-goals', userId] });
          queryClient.invalidateQueries({ queryKey: ['patient-dashboard-stats', userId] });
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
            toast({
              title: "Goal completed! 🎉",
              description: `Congratulations on completing "${payload.new.title}"`,
            });
          }
        }
      )
      .subscribe();
    
    channelList.push(goalsChannel);

    // Subscribe to appointments changes
    const appointmentsChannel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `patient_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Real-time] Appointment change:', payload);
          queryClient.invalidateQueries({ queryKey: ['patient-dashboard-stats', userId] });
          queryClient.invalidateQueries({ queryKey: ['patient-session-history', userId] });
          
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New appointment scheduled",
              description: "You have a new appointment.",
            });
          } else if (payload.eventType === 'UPDATE') {
            const status = payload.new.status;
            if (status === 'cancelled') {
              toast({
                title: "Appointment cancelled",
                description: "Your appointment has been cancelled.",
                variant: "destructive"
              });
            } else if (status === 'confirmed') {
              toast({
                title: "Appointment confirmed",
                description: "Your appointment has been confirmed.",
              });
            }
          }
        }
      )
      .subscribe();

    channelList.push(appointmentsChannel);

    // Subscribe to patient inquiries changes
    const inquiriesChannel = supabase
      .channel('patient-inquiries-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_inquiries',
          filter: `patient_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Real-time] Inquiry change:', payload);
          queryClient.invalidateQueries({ queryKey: ['patient-inquiries', userId] });
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'responded') {
            toast({
              title: "New response received",
              description: "Your therapist has responded to your inquiry.",
            });
          }
        }
      )
      .subscribe();

    channelList.push(inquiriesChannel);

    // Subscribe to inquiry responses changes
    const responsesChannel = supabase
      .channel('inquiry-responses-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inquiry_responses'
        },
        async (payload) => {
          console.log('[Real-time] New inquiry response:', payload);
          
          // Check if this response is for the current user's inquiry
          const { data: inquiry } = await supabase
            .from('patient_inquiries')
            .select('patient_id')
            .eq('id', payload.new.inquiry_id)
            .single();
            
          if (inquiry?.patient_id === userId) {
            queryClient.invalidateQueries({ queryKey: ['patient-inquiries', userId] });
            
            toast({
              title: "New message received",
              description: "You have a new response to your inquiry.",
            });
          }
        }
      )
      .subscribe();

    channelList.push(responsesChannel);

    // Subscribe to patient resources changes
    const resourcesChannel = supabase
      .channel('patient-resources-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_resources'
        },
        (payload) => {
          console.log('[Real-time] Resource change:', payload);
          queryClient.invalidateQueries({ queryKey: ['patient-resources'] });
          
          if (payload.eventType === 'INSERT' && payload.new.is_featured) {
            toast({
              title: "New featured resource",
              description: `New resource available: "${payload.new.title}"`,
            });
          }
        }
      )
      .subscribe();

    channelList.push(resourcesChannel);

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('[Real-time] New notification:', payload);
          
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });
        }
      )
      .subscribe();

    channelList.push(notificationsChannel);

    // Store channels in state
    setChannels(channelList);

    // Cleanup function
    return () => {
      console.log('[Real-time] Cleaning up subscriptions');
      channelList.forEach((channel) => {
        supabase.removeChannel(channel);
      });
      setChannels([]);
      setIsConnected(false);
    };
  }, [userId, queryClient, toast]);

  return {
    isConnected,
    channels
  };
};