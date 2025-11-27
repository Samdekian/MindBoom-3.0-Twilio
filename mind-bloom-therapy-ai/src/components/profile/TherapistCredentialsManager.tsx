
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, Award, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Credential {
  id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiration_date?: string | null;
  credential_id?: string | null;
}

const TherapistCredentialsManager: React.FC = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newCredential, setNewCredential] = useState<Omit<Credential, 'id'>>({
    name: '',
    issuing_organization: '',
    issue_date: '',
    expiration_date: null,
    credential_id: null,
  });

  // Fetch credentials
  const { data: credentials = [], isLoading } = useQuery({
    queryKey: ['therapistCredentials', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('therapist_credentials')
        .select('*')
        .eq('therapist_id', user.id)
        .order('issue_date', { ascending: false });

      if (error) {
        throw error;
      }
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Mutation to add credential
  const addCredentialMutation = useMutation({
    mutationFn: async (credential: Omit<Credential, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('therapist_credentials')
        .insert([{ ...credential, therapist_id: user.id }])
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Credential Added',
        description: 'Your credential has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['therapistCredentials', user?.id] });
      setNewCredential({
        name: '',
        issuing_organization: '',
        issue_date: '',
        expiration_date: null,
        credential_id: null,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add credential.',
        variant: 'destructive',
      });
    },
  });

  // Mutation to delete credential
  const deleteCredentialMutation = useMutation({
    mutationFn: async (credentialId: string) => {
      const { error } = await supabase
        .from('therapist_credentials')
        .delete()
        .eq('id', credentialId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Credential Deleted',
        description: 'The credential has been removed.',
      });
      queryClient.invalidateQueries({ queryKey: ['therapistCredentials', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete credential.',
        variant: 'destructive',
      });
    },
  });

  const handleAddCredential = () => {
    if (!newCredential.name || !newCredential.issuing_organization || !newCredential.issue_date) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    addCredentialMutation.mutate(newCredential);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Therapist Credentials</CardTitle>
        <CardDescription>
          Manage your professional credentials and certifications.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading credentials...</p>
        ) : (
          <>
            {credentials.length === 0 ? (
              <p>No credentials added yet.</p>
            ) : (
              <ul className="space-y-3">
                {credentials.map((cred) => (
                  <li key={cred.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-semibold">{cred.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {cred.issuing_organization} &middot; Issued: {cred.issue_date}
                        {cred.expiration_date ? ` &middot; Expires: ${cred.expiration_date}` : ''}
                      </div>
                      {cred.credential_id && (
                        <div className="text-xs text-muted-foreground">ID: {cred.credential_id}</div>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteCredentialMutation.mutate(cred.id)}
                      disabled={deleteCredentialMutation.isPending}
                      aria-label={`Delete credential ${cred.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 space-y-4">
              <h4 className="text-lg font-semibold">Add New Credential</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credential-name">Credential Name *</Label>
                  <Input
                    id="credential-name"
                    type="text"
                    value={newCredential.name}
                    onChange={(e) => setNewCredential({ ...newCredential, name: e.target.value })}
                    placeholder="e.g. Licensed Clinical Social Worker"
                  />
                </div>
                <div>
                  <Label htmlFor="issuing-organization">Issuing Organization *</Label>
                  <Input
                    id="issuing-organization"
                    type="text"
                    value={newCredential.issuing_organization}
                    onChange={(e) => setNewCredential({ ...newCredential, issuing_organization: e.target.value })}
                    placeholder="e.g. State Board of Social Work"
                  />
                </div>
                <div>
                  <Label htmlFor="issue-date">Issue Date *</Label>
                  <Input
                    id="issue-date"
                    type="date"
                    value={newCredential.issue_date}
                    onChange={(e) => setNewCredential({ ...newCredential, issue_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiration-date">Expiration Date</Label>
                  <Input
                    id="expiration-date"
                    type="date"
                    value={newCredential.expiration_date || ''}
                    onChange={(e) => setNewCredential({ ...newCredential, expiration_date: e.target.value || null })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="credential-id">Credential ID</Label>
                  <Input
                    id="credential-id"
                    type="text"
                    value={newCredential.credential_id || ''}
                    onChange={(e) => setNewCredential({ ...newCredential, credential_id: e.target.value || null })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <Button
                onClick={handleAddCredential}
                disabled={addCredentialMutation.isPending}
                className="mt-4"
              >
                {addCredentialMutation.isPending ? 'Adding...' : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Credential
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TherapistCredentialsManager;
