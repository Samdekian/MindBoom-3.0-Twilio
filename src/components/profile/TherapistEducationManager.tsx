
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Save, GraduationCap } from 'lucide-react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  field_of_study: string;
  start_year: string;
  end_year: string;
  description?: string;
}

const TherapistEducationManager: React.FC = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [newEducation, setNewEducation] = useState<Omit<EducationEntry, 'id'>>({
    institution: '',
    degree: '',
    field_of_study: '',
    start_year: '',
    end_year: '',
    description: '',
  });

  const { data: educationEntries, isLoading } = useQuery<EducationEntry[], Error>({
    queryKey: ['therapistEducation', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('therapist_education')
        .select('*')
        .eq('therapist_id', user.id)
        .order('start_year', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const addEducationMutation = useMutation({
    mutationFn: async (education: Omit<EducationEntry, 'id'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('therapist_education')
        .insert([{ ...education, therapist_id: user.id }]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Education Added',
        description: 'New education entry has been added successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['therapistEducation', user?.id] });
      setNewEducation({
        institution: '',
        degree: '',
        field_of_study: '',
        start_year: '',
        end_year: '',
        description: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add education entry.',
        variant: 'destructive',
      });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('therapist_education')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Education Deleted',
        description: 'Education entry has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['therapistEducation', user?.id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete education entry.',
        variant: 'destructive',
      });
    },
  });

  const handleAddEducation = () => {
    if (
      !newEducation.institution.trim() ||
      !newEducation.degree.trim() ||
      !newEducation.field_of_study.trim() ||
      !newEducation.start_year.trim() ||
      !newEducation.end_year.trim()
    ) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }
    addEducationMutation.mutate(newEducation);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Therapist Education</CardTitle>
        <CardDescription>
          Manage your educational background and credentials.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading education entries...</p>
        ) : (
          <>
            {educationEntries && educationEntries.length > 0 ? (
              <div className="space-y-4">
                {educationEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border rounded p-4 flex justify-between items-start"
                  >
                    <div>
                      <h4 className="font-semibold text-lg">{entry.degree} in {entry.field_of_study}</h4>
                      <p className="text-sm text-muted-foreground">{entry.institution}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.start_year} - {entry.end_year}
                      </p>
                      {entry.description && (
                        <p className="mt-2 text-sm">{entry.description}</p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteEducationMutation.mutate(entry.id)}
                      disabled={deleteEducationMutation.isPending}
                      aria-label={`Delete education entry ${entry.degree} at ${entry.institution}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No education entries found.</p>
            )}
          </>
        )}

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold">Add New Education</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="institution">Institution</Label>
              <Input
                id="institution"
                value={newEducation.institution}
                onChange={(e) =>
                  setNewEducation((prev) => ({ ...prev, institution: e.target.value }))
                }
                placeholder="University or College"
              />
            </div>
            <div>
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                value={newEducation.degree}
                onChange={(e) =>
                  setNewEducation((prev) => ({ ...prev, degree: e.target.value }))
                }
                placeholder="e.g. Bachelor of Science"
              />
            </div>
            <div>
              <Label htmlFor="field_of_study">Field of Study</Label>
              <Input
                id="field_of_study"
                value={newEducation.field_of_study}
                onChange={(e) =>
                  setNewEducation((prev) => ({ ...prev, field_of_study: e.target.value }))
                }
                placeholder="e.g. Psychology"
              />
            </div>
            <div>
              <Label htmlFor="start_year">Start Year</Label>
              <Input
                id="start_year"
                type="number"
                value={newEducation.start_year}
                onChange={(e) =>
                  setNewEducation((prev) => ({ ...prev, start_year: e.target.value }))
                }
                placeholder="YYYY"
                min={1900}
                max={new Date().getFullYear()}
              />
            </div>
            <div>
              <Label htmlFor="end_year">End Year</Label>
              <Input
                id="end_year"
                type="number"
                value={newEducation.end_year}
                onChange={(e) =>
                  setNewEducation((prev) => ({ ...prev, end_year: e.target.value }))
                }
                placeholder="YYYY or 'Present'"
                min={1900}
                max={new Date().getFullYear() + 10}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newEducation.description}
                onChange={(e) =>
                  setNewEducation((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Additional details about your education"
                rows={3}
              />
            </div>
          </div>
          <Button
            onClick={handleAddEducation}
            disabled={addEducationMutation.isPending}
            className="mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Education
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistEducationManager;
