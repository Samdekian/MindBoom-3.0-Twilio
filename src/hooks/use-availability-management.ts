
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface AvailabilitySlot {
  id: string;
  therapist_id: string;
  date: string;
  start_time: string;
  end_time: string;
  day_of_week: number;
  is_available: boolean;
  created_at: string;
}

export const useAvailabilityManagement = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: availability, isLoading, error } = useQuery({
    queryKey: ['availability-slots', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('therapist_availability')
        .select('*')
        .eq('therapist_id', user.id)
        .order('day_of_week', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error("Error fetching availability:", error);
        throw error;
      }

      return data as AvailabilitySlot[];
    },
    enabled: !!user?.id,
  });

  const createAvailabilitySlot = useMutation({
    mutationFn: async (slot: Omit<AvailabilitySlot, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('therapist_availability')
        .insert([slot])
        .select();

      if (error) {
        console.error("Error creating availability slot:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      toast({
        title: "Availability Updated",
        description: "Your availability has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability.",
        variant: "destructive",
      });
    },
  });

  const updateAvailabilitySlot = useMutation({
    mutationFn: async (slot: Partial<AvailabilitySlot> & { id: string }) => {
      const { data, error } = await supabase
        .from('therapist_availability')
        .update(slot)
        .eq('id', slot.id)
        .select();

      if (error) {
        console.error("Error updating availability slot:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      toast({
        title: "Availability Updated",
        description: "Your availability has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update availability.",
        variant: "destructive",
      });
    },
  });

  const deleteAvailabilitySlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('therapist_availability')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting availability slot:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability-slots'] });
      toast({
        title: "Availability Deleted",
        description: "Availability slot has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete availability.",
        variant: "destructive",
      });
    },
  });

  return {
    availability: availability || [],
    availabilitySlots: availability || [], // Add alias for backward compatibility
    isLoading,
    error,
    createAvailabilitySlot,
    updateAvailabilitySlot,
    deleteAvailabilitySlot,
  };
};
