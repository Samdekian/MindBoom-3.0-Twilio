import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';

export const useGoogleCalendarWebhook = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [webhookId, setWebhookId] = useState<string | null>(null);
  const [isWebhookActive, setIsWebhookActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWebhookStatus = async () => {
      setIsLoading(true);
      try {
        if (!user?.id) {
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('therapist_settings')
          .select('google_webhook_id, is_webhook_active')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching webhook settings:", error);
          setIsLoading(false);
          return;
        }

        setWebhookId(data?.google_webhook_id || null);
        setIsWebhookActive(data?.is_webhook_active || false);
      } finally {
        setIsLoading(false);
      }
    };

    checkWebhookStatus();
  }, [user?.id, supabase]);

  const setupWebhook = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase.functions.invoke('google-calendar-webhook', {
        body: { action: 'setupWebhook' }
      });

      if (error) {
        console.error("Error setting up webhook:", error);
        throw error;
      }

      return data;
    },
    onSuccess: async () => {
      toast({
        title: "Webhook Setup",
        description: "Google Calendar webhook has been successfully set up.",
      });
      await queryClient.invalidateQueries({ queryKey: ['therapist_settings'] });
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
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.functions.invoke('google-calendar-webhook', {
        body: { action: 'removeWebhook', webhookId }
      });

      if (error) {
        console.error("Error removing webhook:", error);
        throw error;
      }
    },
    onSuccess: async () => {
      toast({
        title: "Webhook Removed",
        description: "Google Calendar webhook has been successfully removed.",
      });
      await queryClient.invalidateQueries({ queryKey: ['therapist_settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Webhook Removal Failed",
        description: error.message || "Failed to remove Google Calendar webhook.",
        variant: "destructive",
      });
    },
  });

  return {
    webhookId,
    isWebhookActive,
    isLoading,
    setupWebhook,
    removeWebhook,
  };
};
