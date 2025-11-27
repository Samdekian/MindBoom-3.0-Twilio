import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Specialization {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface TherapistSpecialization extends Specialization {
  assignment_id: string;
}

interface TherapistSpecializationJunction {
  id: string;
  specialization_id: string;
  therapist_specializations: {
    id: string;
    name: string;
    description: string;
    category: string;
  };
}

const TherapistSpecializationsManager = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all available specializations
  const { data: allSpecializations = [] } = useQuery({
    queryKey: ['all-specializations'],
    queryFn: async (): Promise<Specialization[]> => {
      const { data, error } = await supabase
        .from('therapist_specializations')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch therapist's current specializations
  const { data: mySpecializations = [] } = useQuery({
    queryKey: ['therapist-specializations', user?.id],
    queryFn: async (): Promise<TherapistSpecialization[]> => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('therapist_profile_specializations')
        .select(`
          id,
          specialization_id,
          therapist_specializations (
            id,
            name,
            description,
            category
          )
        `)
        .eq('therapist_id', user.id) as { data: TherapistSpecializationJunction[] | null, error: any };
      
      if (error) throw error;
      
      return (data || []).map(item => {
        const specialization = item.therapist_specializations;
        return {
          assignment_id: item.id,
          id: specialization.id,
          name: specialization.name,
          description: specialization.description,
          category: specialization.category
        };
      });
    },
    enabled: !!user?.id
  });

  // Add specialization mutation
  const addSpecializationMutation = useMutation({
    mutationFn: async (specializationId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('therapist_profile_specializations')
        .insert({
          therapist_id: user.id,
          specialization_id: specializationId
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-specializations'] });
      toast({
        title: "Specialization Added",
        description: "The specialization has been added to your profile.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Remove specialization mutation
  const removeSpecializationMutation = useMutation({
    mutationFn: async (specializationId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('therapist_profile_specializations')
        .delete()
        .eq('therapist_id', user.id)
        .eq('specialization_id', specializationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['therapist-specializations'] });
      toast({
        title: "Specialization Removed",
        description: "The specialization has been removed from your profile.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter available specializations (not already selected)
  const availableSpecializations = allSpecializations.filter(spec => {
    const isAlreadySelected = mySpecializations.some(mySpec => mySpec.id === spec.id);
    const matchesSearch = spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         spec.description.toLowerCase().includes(searchTerm.toLowerCase());
    return !isAlreadySelected && matchesSearch;
  });

  // Group specializations by category
  const specializationsByCategory = availableSpecializations.reduce((acc, spec) => {
    if (!acc[spec.category]) {
      acc[spec.category] = [];
    }
    acc[spec.category].push(spec);
    return acc;
  }, {} as Record<string, Specialization[]>);

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'mental_health': 'Mental Health',
      'trauma': 'Trauma & Crisis',
      'relationships': 'Relationships & Family',
      'family': 'Family & Couples',
      'addiction': 'Addiction & Recovery',
      'developmental': 'Child & Adolescent',
      'life_transitions': 'Life Transitions',
      'eating_disorders': 'Eating Disorders',
      'neurodevelopmental': 'Neurodevelopmental',
      'career': 'Career & Work',
      'identity': 'Identity & Diversity',
      'therapy_approach': 'Therapy Approaches',
      'general': 'General'
    };
    return labels[category] || category;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Specializations</CardTitle>
        <CardDescription>
          Select your areas of expertise to help patients find the right therapist for their needs.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Specializations */}
        <div>
          <h3 className="font-medium mb-3">Your Specializations</h3>
          {mySpecializations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {mySpecializations.map((spec) => (
                <Badge key={spec.id} variant="default" className="flex items-center gap-1">
                  {spec.name}
                  <button
                    onClick={() => removeSpecializationMutation.mutate(spec.id)}
                    disabled={removeSpecializationMutation.isPending}
                    className="ml-1 hover:text-red-200"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No specializations selected yet. Add some below to help patients find you.
            </p>
          )}
        </div>

        {/* Add New Specializations */}
        <div>
          <h3 className="font-medium mb-3">Add Specializations</h3>
          
          {/* Search */}
          <div className="relative mb-4">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <Input
              id="search"
              placeholder="Search specializations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Available Specializations by Category */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(specializationsByCategory).map(([category, specializations]) => (
              <div key={category}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {getCategoryLabel(category)}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {specializations.map((spec) => (
                    <Badge
                      key={spec.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
                      onClick={() => addSpecializationMutation.mutate(spec.id)}
                    >
                      <Plus className="h-3 w-3" />
                      {spec.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {availableSpecializations.length === 0 && searchTerm && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No specializations found matching "{searchTerm}"
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistSpecializationsManager;
