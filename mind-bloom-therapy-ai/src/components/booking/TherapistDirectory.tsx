
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TherapistProfile {
  id: string;
  full_name: string | null;
}

export const TherapistDirectory = () => {
  const navigate = useNavigate();
  
  const { data: therapists, isLoading } = useQuery<TherapistProfile[]>({
    queryKey: ['therapists'],
    queryFn: async () => {
      // Use explicit table alias for profiles to avoid ambiguous column references
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('account_type', 'therapist');
      
      if (error) throw error;
      return data;
    },
  });

  const handleSelectTherapist = (therapistId: string) => {
    navigate(`/book/${therapistId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Available Therapists
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {therapists?.map((therapist) => (
            <Card key={therapist.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <User className="h-5 w-5" />
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{therapist.full_name || 'Unnamed Therapist'}</h3>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleSelectTherapist(therapist.id)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    View Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {!therapists?.length && (
            <div className="text-center py-6 text-muted-foreground">
              No therapists available at the moment.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
