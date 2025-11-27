
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  address: string;
  created_at: string;
  updated_at: string;
  // Additional computed properties for UI
  name: string;
  fullName: string;
  status: string;
  moodTrend: string;
  lastSessionDate?: string;
  upcomingSessionDate?: string;
  activeTreatmentPlan?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const usePatientManagement = () => {
  const { user } = useAuthRBAC();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching patients:", error);
        throw error;
      }

      // Transform the data to include computed properties
      return (data || []).map((patient: any) => ({
        ...patient,
        name: `${patient.first_name} ${patient.last_name}`,
        fullName: `${patient.first_name} ${patient.last_name}`,
        status: 'active', // Default status
        moodTrend: 'stable', // Default mood trend
        createdAt: patient.created_at,
        updatedAt: patient.updated_at,
        activeTreatmentPlan: false, // Default treatment plan status
      })) as Patient[];
    },
  });

  const filterPatients = (searchTerm: string) => {
    if (!patients || !searchTerm) return patients || [];
    
    return patients.filter(patient => 
      patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const createPatient = useMutation({
    mutationFn: async (newPatient: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'name' | 'fullName' | 'status' | 'moodTrend' | 'createdAt' | 'updatedAt' | 'activeTreatmentPlan'>) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([newPatient])
        .select();

      if (error) {
        console.error("Error creating patient:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Patient Created",
        description: "New patient has been created.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create patient.",
        variant: "destructive",
      });
    },
  });

  const updatePatient = useMutation({
    mutationFn: async (updatedPatient: Partial<Patient> & { id: string }) => {
      const { data, error } = await supabase
        .from('patients')
        .update(updatedPatient)
        .eq('id', updatedPatient.id)
        .select();

      if (error) {
        console.error("Error updating patient:", error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Patient Updated",
        description: "Patient information has been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update patient.",
        variant: "destructive",
      });
    },
  });

  const deletePatient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error deleting patient:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: "Patient Deleted",
        description: "Patient has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete patient.",
        variant: "destructive",
      });
    },
  });

  return {
    patients: patients || [],
    isLoading,
    error,
    filterPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
};
