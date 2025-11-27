
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { usePatientManagement } from '@/hooks/use-patient-management';

export interface GroupMember {
  id: string;
  group_id: string;
  patient_id: string;
  joined_date: string;
  created_at: string;
}

export const useGroupMembers = (group: any, isOpen: boolean) => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { patients } = usePatientManagement();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: members = [], isLoading, error, refetch } = useQuery({
    queryKey: ['group-members', group?.id],
    queryFn: async () => {
      if (!group?.id) return [];

      const { data, error } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', group.id);

      if (error) {
        console.error("Error fetching group members:", error);
        throw error;
      }

      return data as GroupMember[];
    },
    enabled: !!group?.id && isOpen,
  });

  const addMember = useMutation({
    mutationFn: async (patientId: string) => {
      if (!group?.id) throw new Error("Group not found");

      const { data, error } = await supabase
        .from('group_members')
        .insert([{
          group_id: group.id,
          patient_id: patientId,
          joined_date: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error("Error adding group member:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      toast({
        title: "Member Added",
        description: "Patient has been added to the group.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add member to group.",
        variant: "destructive",
      });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId);

      if (error) {
        console.error("Error removing group member:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-members'] });
      toast({
        title: "Member Removed",
        description: "Patient has been removed from the group.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove member from group.",
        variant: "destructive",
      });
    },
  });

  // Filter available patients (not already in the group)
  const memberPatientIds = members.map(member => member.patient_id);
  const availablePatients = patients.filter(patient => !memberPatientIds.includes(patient.id));
  
  const filteredAvailablePatients = availablePatients.filter(patient =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    members,
    isLoading,
    error,
    addMember,
    removeMember,
    addMemberMutation: addMember,
    removeMemberMutation: removeMember,
    refetch,
    searchTerm,
    setSearchTerm,
    filteredAvailablePatients,
  };
};
