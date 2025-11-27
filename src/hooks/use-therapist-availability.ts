
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

export interface AvailabilitySlot {
  id: string;
  therapist_id: string;
  slot_date: string;
  slot_start_time: string;
  slot_end_time: string;
  is_available: boolean;
  max_bookings: number;
  current_bookings: number;
  created_at: string;
  slot_type?: string;
  notes?: string;
}

export const useTherapistAvailability = (therapistId?: string) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availabilitySlots, isLoading, error } = useQuery({
    queryKey: ['therapist-availability', therapistId || user?.id],
    queryFn: async () => {
      const id = therapistId || user?.id;
      if (!id) return [];

      const { data, error } = await supabase
        .from('therapist_availability_slots')
        .select('*')
        .eq('therapist_id', id)
        .order('slot_date', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!(therapistId || user?.id),
  });

  const createAvailabilitySlot = useMutation({
    mutationFn: async (slotData: Omit<AvailabilitySlot, 'id' | 'created_at' | 'therapist_id'>) => {
      const { data, error } = await supabase
        .from('therapist_availability_slots')
        .insert([{
          ...slotData,
          therapist_id: user?.id,
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-availability'] });
      toast({
        title: "Success",
        description: "Availability slot created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create availability slot",
        variant: "destructive",
      });
    },
  });

  const deleteAvailabilitySlot = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase
        .from('therapist_availability_slots')
        .delete()
        .eq('id', slotId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-availability'] });
      toast({
        title: "Success",
        description: "Availability slot deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete availability slot",
        variant: "destructive",
      });
    },
  });

  return {
    availabilitySlots: availabilitySlots || [],
    isLoading,
    error,
    createAvailabilitySlot,
    deleteAvailabilitySlot,
  };
};
