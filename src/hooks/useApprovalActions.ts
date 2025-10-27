import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

export const useApprovalActions = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: approvals, isLoading, error } = useQuery({
    queryKey: ['approvals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('approvals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching approvals:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const approveItem = useMutation({
    mutationFn: async (approvalId: string) => {
      const { data, error } = await supabase
        .from('approvals')
        .update({ status: 'approved' })
        .eq('id', approvalId)
        .select();

      if (error) {
        console.error("Error approving item:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast({
        title: "Approved",
        description: "The item has been approved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve the item.",
        variant: "destructive",
      });
    },
  });

  const rejectItem = useMutation({
    mutationFn: async (approvalId: string) => {
      const { data, error } = await supabase
        .from('approvals')
        .update({ status: 'rejected' })
        .eq('id', approvalId)
        .select();

      if (error) {
        console.error("Error rejecting item:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
      toast({
        title: "Rejected",
        description: "The item has been rejected.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject the item.",
        variant: "destructive",
      });
    },
  });

  return {
    approvals: approvals || [],
    isLoading,
    error,
    approveItem,
    rejectItem,
  };
};
