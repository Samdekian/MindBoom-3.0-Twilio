import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Shield } from 'lucide-react';

interface Insurance {
  id: string;
  name: string;
  provider: string;
  policy_number: string;
}

const TherapistInsuranceManager: React.FC = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newInsurance, setNewInsurance] = useState({
    name: '',
    provider: '',
    policy_number: ''
  });
  const [editingInsurance, setEditingInsurance] = useState<Insurance | null>(null);

  // Fetch insurance records
  const { data: insuranceRecords, isLoading } = useQuery({
    queryKey: ['therapist-insurance', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('therapist_insurance')
        .select('*')
        .eq('therapist_id', user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Create insurance mutation
  const createInsuranceMutation = useMutation({
    mutationFn: async (insuranceData: Omit<Insurance, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('therapist_insurance')
        .insert([{
          ...insuranceData,
          therapist_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-insurance'] });
      toast({
        title: 'Success',
        description: 'Insurance record created successfully',
      });
      setNewInsurance({ name: '', provider: '', policy_number: '' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create insurance record',
        variant: 'destructive',
      });
    },
  });

  // Update insurance mutation
  const updateInsuranceMutation = useMutation({
    mutationFn: async (insuranceData: Insurance) => {
      const { data, error } = await supabase
        .from('therapist_insurance')
        .update(insuranceData)
        .eq('id', insuranceData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-insurance'] });
      toast({
        title: 'Success',
        description: 'Insurance record updated successfully',
      });
      setEditingInsurance(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update insurance record',
        variant: 'destructive',
      });
    },
  });

  // Delete insurance mutation
  const deleteInsuranceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('therapist_insurance')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-insurance'] });
      toast({
        title: 'Success',
        description: 'Insurance record deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete insurance record',
        variant: 'destructive',
      });
    },
  });

  const handleAddInsurance = () => {
    if (!newInsurance.name || !newInsurance.provider || !newInsurance.policy_number) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }
    createInsuranceMutation.mutate(newInsurance);
  };

  const handleUpdateInsurance = () => {
    if (!editingInsurance) return;
    updateInsuranceMutation.mutate(editingInsurance);
  };

  const handleDeleteInsurance = (id: string) => {
    deleteInsuranceMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Insurance Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading insurance records...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Insurance Information
        </CardTitle>
        <CardDescription>
          Manage your professional insurance policies and coverage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Insurance Records */}
        <div className="space-y-4">
          <h3 className="font-medium">Current Insurance Policies</h3>
          {insuranceRecords && insuranceRecords.length > 0 ? (
            <div className="space-y-3">
              {insuranceRecords.map((insurance) => (
                <div key={insurance.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    {editingInsurance?.id === insurance.id ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          value={editingInsurance.name}
                          onChange={(e) => setEditingInsurance({
                            ...editingInsurance,
                            name: e.target.value
                          })}
                          placeholder="Insurance Name"
                        />
                        <Input
                          value={editingInsurance.provider}
                          onChange={(e) => setEditingInsurance({
                            ...editingInsurance,
                            provider: e.target.value
                          })}
                          placeholder="Provider"
                        />
                        <Input
                          value={editingInsurance.policy_number}
                          onChange={(e) => setEditingInsurance({
                            ...editingInsurance,
                            policy_number: e.target.value
                          })}
                          placeholder="Policy Number"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{insurance.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Provider: {insurance.provider} | Policy: {insurance.policy_number}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {editingInsurance?.id === insurance.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={handleUpdateInsurance}
                          disabled={updateInsuranceMutation.isPending}
                        >
                          {updateInsuranceMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingInsurance(null)}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingInsurance(insurance)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteInsurance(insurance.id)}
                          disabled={deleteInsuranceMutation.isPending}
                        >
                          {deleteInsuranceMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No insurance records found. Add your first insurance policy below.
            </div>
          )}
        </div>

        {/* Add New Insurance */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Insurance Policy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="insurance-name">Insurance Name</Label>
              <Input
                id="insurance-name"
                value={newInsurance.name}
                onChange={(e) => setNewInsurance({ ...newInsurance, name: e.target.value })}
                placeholder="Professional Liability"
              />
            </div>
            <div>
              <Label htmlFor="provider">Provider</Label>
              <Input
                id="provider"
                value={newInsurance.provider}
                onChange={(e) => setNewInsurance({ ...newInsurance, provider: e.target.value })}
                placeholder="Insurance Company"
              />
            </div>
            <div>
              <Label htmlFor="policy-number">Policy Number</Label>
              <Input
                id="policy-number"
                value={newInsurance.policy_number}
                onChange={(e) => setNewInsurance({ ...newInsurance, policy_number: e.target.value })}
                placeholder="Policy #"
              />
            </div>
          </div>
          <Button
            onClick={handleAddInsurance}
            disabled={createInsuranceMutation.isPending}
            className="w-full md:w-auto"
          >
            {createInsuranceMutation.isPending ? 'Adding...' : 'Add Insurance Policy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistInsuranceManager;
