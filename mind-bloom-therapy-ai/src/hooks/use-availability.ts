
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface AvailabilitySlot {
  id: string;
  therapist_id: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  is_available: boolean;
  slot_type?: string;
  max_bookings?: number;
  current_bookings?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export const useAvailability = () => {
  const { user } = useAuthRBAC();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [therapistId, setTherapistId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setTherapistId(user.id);
    }
  }, [user?.id]);

  const { data: availability, isLoading, error } = useQuery({
    queryKey: ['availability', therapistId],
    queryFn: async () => {
      if (!therapistId) return [];

      const { data, error } = await supabase
        .from('therapist_availability_slots')
        .select('*')
        .eq('therapist_id', therapistId)
        .order('slot_date', { ascending: true });

      if (error) {
        console.error("Error fetching availability:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!therapistId,
  });

  const createAvailabilitySlot = useMutation({
    mutationFn: async (newSlot: Omit<AvailabilitySlot, 'id' | 'created_at' | 'therapist_id'>) => {
      const { data, error } = await supabase
        .from('therapist_availability_slots')
        .insert([{
          ...newSlot,
          therapist_id: therapistId
        }])
        .select();

      if (error) {
        console.error("Error creating availability slot:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', therapistId] });
      toast({
        title: "Availability Slot Created",
        description: "New availability slot has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create availability slot.",
        variant: "destructive",
      });
    },
  });

  const updateAvailabilitySlot = useMutation({
    mutationFn: async (updatedSlot: Partial<AvailabilitySlot> & { id: string }) => {
      const { data, error } = await supabase
        .from('therapist_availability_slots')
        .update(updatedSlot)
        .eq('id', updatedSlot.id)
        .select();

      if (error) {
        console.error("Error updating availability slot:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', therapistId] });
      toast({
        title: "Availability Slot Updated",
        description: "Availability slot has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability slot.",
        variant: "destructive",
      });
    },
  });

  const deleteAvailabilitySlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('therapist_availability_slots')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting availability slot:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability', therapistId] });
      toast({
        title: "Availability Slot Deleted",
        description: "Availability slot has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete availability slot.",
        variant: "destructive",
      });
    },
  });

  return {
    availability,
    isLoading,
    error,
    createAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
  };
};
