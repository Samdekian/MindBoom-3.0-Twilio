
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAppointmentVideo = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateAppointmentVideoDetails = useMutation({
    mutationFn: async ({ 
      id, 
      video_enabled, 
      video_provider, 
      video_url, 
      video_meeting_id 
    }: {
      id: string;
      video_enabled?: boolean;
      video_provider?: string;
      video_url?: string;
      video_meeting_id?: string;
    }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          video_enabled: video_enabled !== undefined ? video_enabled : true,
          video_provider,
          video_url,
          video_meeting_id
        })
        .eq('id', id);
        
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      toast({
        title: "Success",
        description: "Video conference details updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update video conference details",
        variant: "destructive",
      });
      console.error("Error updating video details:", error);
    },
  });

  return {
    updateAppointmentVideoDetails,
  };
};
