import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Heart, CheckCircle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuthRBAC } from "@/contexts/AuthRBACContext";
import { useOnboarding } from "@/contexts/OnboardingContext";

interface Therapist {
  id: string;
  full_name: string | null;
  bio?: string | null;
  specializations?: string[] | null;
  hourly_rate?: number | null;
  years_experience?: number | null;
  avatar_url?: string | null;
  accepting_new_patients?: boolean | null;
  location?: string | null;
}

export const OnboardingTherapistDirectory = () => {
  const { user } = useAuthRBAC();
  const { markStepComplete, setStep } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | null>(null);
  
  const { data: therapists = [], isLoading } = useQuery<Therapist[]>({
    queryKey: ['onboarding-therapists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          bio, 
          specializations, 
          hourly_rate, 
          years_experience, 
          avatar_url, 
          accepting_new_patients,
          location
        `)
        .eq('account_type', 'therapist')
        .eq('approval_status', 'approved')
        .eq('accepting_new_patients', true);
      
      if (error) throw error;
      return data || [];
    },
  });

  const selectTherapistMutation = useMutation({
    mutationFn: async (therapistId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Create patient-therapist relationship
      const { error } = await supabase
        .from('patient_therapist_relationships')
        .insert({
          patient_id: user.id,
          therapist_id: therapistId,
          relationship_status: 'active',
          start_date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;
      return therapistId;
    },
    onSuccess: (therapistId) => {
      toast({
        title: "Therapist Selected!",
        description: "You can now schedule your first session.",
      });
      
      // Invalidate queries to update onboarding status
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      
      // Mark step complete and move to next step
      markStepComplete('hasSelectedTherapist');
      setStep('session');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to select therapist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectTherapist = (therapistId: string) => {
    setSelectedTherapistId(therapistId);
    selectTherapistMutation.mutate(therapistId);
  };

  const getSpecializationColor = (spec: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-orange-100 text-orange-800',
    ];
    return colors[spec.length % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Choose Your Therapist
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Choose Your Therapist
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Find a therapist who feels right for you. This is an important decision, so take your time.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {therapists.map((therapist) => (
            <Card 
              key={therapist.id} 
              className={`overflow-hidden transition-all hover:shadow-md ${
                selectedTherapistId === therapist.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <Avatar className="h-16 w-16 sm:h-20 sm:w-20 shrink-0">
                    <AvatarImage src={therapist.avatar_url || undefined} alt={therapist.full_name || 'Therapist'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                      {therapist.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="mb-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        {therapist.full_name || 'Therapist'}
                      </h3>
                      {therapist.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{therapist.location}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3">
                      {therapist.bio || "Experienced therapist dedicated to helping clients achieve their mental health goals."}
                    </p>

                    {therapist.specializations && therapist.specializations.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Areas of Focus:</h4>
                        <div className="flex flex-wrap gap-2">
                          {therapist.specializations.slice(0, 4).map((spec, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className={`text-xs ${getSpecializationColor(spec)}`}
                            >
                              {spec}
                            </Badge>
                          ))}
                          {therapist.specializations.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{therapist.specializations.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {therapist.years_experience && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{therapist.years_experience} years experience</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {/* TODO: View profile */}}
                          className="w-full sm:w-auto min-w-[120px]"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Learn More
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSelectTherapist(therapist.id)}
                          disabled={selectTherapistMutation.isPending}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto min-w-[160px]"
                        >
                          {selectedTherapistId === therapist.id ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Heart className="h-4 w-4" />
                          )}
                          <span className="whitespace-nowrap">
                            {selectTherapistMutation.isPending && selectedTherapistId === therapist.id
                              ? 'Selecting...'
                              : selectedTherapistId === therapist.id
                              ? 'Selected'
                              : 'Choose This Therapist'
                            }
                          </span>
                        </Button>
                      </div>
                    </div>

                    {/* Why choose this therapist */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="text-xs sm:text-sm font-medium text-blue-800 mb-1">
                        Why this might be a good match:
                      </h4>
                      <p className="text-xs sm:text-sm text-blue-700">
                        {therapist.specializations && therapist.specializations.length > 0
                          ? `Specializes in ${therapist.specializations.slice(0, 2).join(' and ')}`
                          : 'Experienced in general therapy approaches'
                        }
                        {therapist.years_experience && ` with ${therapist.years_experience} years of experience`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {therapists.length === 0 && (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Therapists Available</h3>
              <p className="text-gray-600">
                There are currently no therapists accepting new patients. Please check back later.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};