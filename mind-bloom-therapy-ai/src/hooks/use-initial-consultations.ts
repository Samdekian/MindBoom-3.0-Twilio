
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useInitialConsultations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createConsultation = useMutation({
    mutationFn: async (consultationData: any) => {
      const { data, error } = await supabase
        .from('initial_consultations')
        .insert([consultationData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Consultation request submitted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['initial-consultations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit consultation request. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating consultation:', error);
    },
  });

  return {
    createConsultation,
  };
};
