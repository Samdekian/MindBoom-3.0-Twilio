
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Star, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import type { BookingData } from "../ScheduleAppointmentModal";

interface TherapistSelectionTabProps {
  bookingData: BookingData;
  updateBookingData: (updates: Partial<BookingData>) => void;
  onNext: () => void;
}

interface Therapist {
  id: string;
  full_name: string | null;
  account_type: string;
  approval_status: string;
}

const TherapistSelectionTab: React.FC<TherapistSelectionTabProps> = ({
  bookingData,
  updateBookingData,
  onNext,
}) => {
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(
    bookingData.therapistId || null
  );

  const { data: therapists = [], isLoading } = useQuery<Therapist[]>({
    queryKey: ['available-therapists'],
    queryFn: async () => {
      console.log('Fetching therapists...');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, account_type, approval_status')
        .eq('account_type', 'therapist')
        .eq('approval_status', 'approved');
      
      if (error) {
        console.error('Error fetching therapists:', error);
        throw error;
      }
      
      console.log('Fetched therapists:', data);
      return data || [];
    },
  });

  const handleTherapistSelect = (therapist: Therapist) => {
    setSelectedTherapist(therapist.id);
    updateBookingData({
      therapistId: therapist.id,
      therapistName: therapist.full_name || 'Unknown Therapist'
    });
  };

  const handleContinue = () => {
    if (selectedTherapist) {
      onNext();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">Choose Your Therapist</h3>
        <p className="text-sm text-muted-foreground">
          Select a therapist for your initial consultation
        </p>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {therapists.map((therapist) => (
          <Card
            key={therapist.id}
            className={cn(
              "cursor-pointer transition-colors hover:bg-accent",
              selectedTherapist === therapist.id && "ring-2 ring-primary bg-accent"
            )}
            onClick={() => handleTherapistSelect(therapist)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {therapist.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'T'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-sm">
                        {therapist.full_name || 'Unknown Therapist'}
                      </h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Licensed Therapist
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">4.8</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                    Experienced therapist dedicated to helping clients achieve their mental health goals.
                  </p>

                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Cognitive Behavioral Therapy
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      Anxiety & Depression
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-muted-foreground">
                      5+ years experience • $120/session
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {therapists.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No available therapists found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Please check back later or contact support for assistance.
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button 
          onClick={handleContinue}
          disabled={!selectedTherapist}
        >
          Continue
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default TherapistSelectionTab;
