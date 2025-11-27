
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useGoogleCalendarWebhookSetup = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);

  useEffect(() => {
    // Construct the webhook URL using environment variables
    const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : 'http://localhost:3000'; // Fallback for local development
    const constructedWebhookUrl = `${baseUrl}/api/google-calendar-webhook`;
    setWebhookUrl(constructedWebhookUrl);
  }, []);

  // Query webhook configuration
  const { data: webhookConfig, refetch: refetchWebhook } = useQuery({
    queryKey: ['google-calendar-webhook-config', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('google_calendar_webhook_configs')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const isWebhookSetup = !!webhookConfig;

  const setupWebhook = useMutation({
    mutationFn: async (calendarId?: string) => {
      if (!webhookUrl) {
        throw new Error("Webhook URL is not defined.");
      }

      const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
        body: {
          action: 'setupWebhook',
          calendarId: calendarId || 'primary',
          webhookUrl: webhookUrl,
        }
      });

      if (error) {
        console.error("Error setting up webhook:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-webhook-config'] });
      toast({
        title: "Webhook Setup Successful",
        description: "Google Calendar webhook has been successfully set up.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Webhook Setup Failed",
        description: error.message || "Failed to set up Google Calendar webhook.",
        variant: "destructive",
      });
    },
  });

  const removeWebhook = useMutation({
    mutationFn: async (calendarId?: string) => {
      const { data, error } = await supabase.functions.invoke('google-calendar-oauth', {
        body: {
          action: 'removeWebhook',
          calendarId: calendarId || 'primary',
        }
      });

      if (error) {
        console.error("Error removing webhook:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-calendar-events'] });
      queryClient.invalidateQueries({ queryKey: ['google-calendar-webhook-config'] });
      toast({
        title: "Webhook Removed",
        description: "Google Calendar webhook has been successfully removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Webhook Removal Failed",
        description: error.message || "Failed to remove Google Calendar webhook.",
        variant: "destructive",
      });
    },
  });

  // Alias for deleteWebhook to match component expectations
  const deleteWebhook = removeWebhook;

  return { 
    setupWebhook, 
    removeWebhook,
    deleteWebhook,
    webhookConfig,
    isWebhookSetup,
    refetchWebhook
  };
};
