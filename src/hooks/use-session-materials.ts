
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface SessionMaterial {
  id: string;
  appointment_id: string;
  therapist_id: string;
  title: string;
  description?: string;
  content?: string;
  material_type: string;
  due_date?: string;
  file_urls?: string[];
  is_completed?: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export const useSessionMaterials = (appointmentId: string) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: materials, isLoading, error } = useQuery({
    queryKey: ['session-materials', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return [];

      const { data, error } = await supabase
        .from('session_materials')
        .select('*')
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching session materials:", error);
        throw error;
      }

      return data as SessionMaterial[];
    },
    enabled: !!appointmentId,
  });

  const addMaterial = useMutation({
    mutationFn: async (material: Omit<SessionMaterial, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('session_materials')
        .insert([{ ...material, therapist_id: user?.id }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-materials'] });
      toast({
        title: "Material Added",
        description: "Session material has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add session material.",
        variant: "destructive",
      });
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async (material: Partial<SessionMaterial> & { id: string }) => {
      const { data, error } = await supabase
        .from('session_materials')
        .update(material)
        .eq('id', material.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-materials'] });
      toast({
        title: "Material Updated",
        description: "Session material has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update session material.",
        variant: "destructive",
      });
    },
  });

  const deleteMaterial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('session_materials')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session-materials'] });
      toast({
        title: "Material Deleted",
        description: "Session material has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete session material.",
        variant: "destructive",
      });
    },
  });

  return {
    materials: materials || [],
    isLoading,
    error,
    addMaterial,
    createMaterial: addMaterial, // Alias for backward compatibility
    updateMaterial,
    deleteMaterial,
  };
};
