
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { CalendlyFormData } from "@/utils/calendly-validation";

export const useCalendlySettings = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['therapist-settings'],
    queryFn: async () => {
      try {
        const user = await supabase.auth.getUser();
        
        if (!user.data.user?.id) {
          throw new Error("User not authenticated");
        }
        
        const { data, error } = await supabase
          .from('therapist_settings')
          .select('*')
          .eq('user_id', user.data.user.id);
        
        if (error) {
          console.error("Error fetching therapist settings:", error);
          throw error;
        }
        
        // Return the first record or null if none exist
        return data && data.length > 0 ? data[0] : null;
      } catch (err) {
        console.error("Failed to load settings:", err);
        throw err;
      }
    },
    retry: 1,
  });

  const updateSettings = useMutation({
    mutationFn: async (data: Partial<CalendlyFormData> = {}) => {
      try {
        const user = await supabase.auth.getUser();
        const userId = user.data.user?.id;

        if (!userId) {
          throw new Error("No authenticated user found");
        }

        const { error } = await supabase
          .from('therapist_settings')
          .upsert({
            user_id: userId,
            calendly_url: data.calendlyUrl || settings?.calendly_url,
            video_enabled: data.enableVideo !== undefined ? data.enableVideo : settings?.video_enabled,
            video_provider: data.videoProvider || settings?.video_provider,
            calendly_webhook_signing_secret: data.calendly_webhook_signing_secret || settings?.calendly_webhook_signing_secret,
          });

        if (error) {
          console.error("Error updating settings:", error);
          throw error;
        }
        
        return data;
      } catch (err) {
        console.error("Failed to update settings:", err);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-settings'] });
      toast({
        title: "Success",
        description: "Your availability settings have been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
};
