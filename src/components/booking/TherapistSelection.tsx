
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Star, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTherapistAvailability } from "@/hooks/use-therapist-availability";
import { format } from "date-fns";

interface Therapist {
  id: string;
  full_name: string;
  specialization?: string;
  location?: string;
  rating?: number;
  hourly_rate?: number;
  account_type: string;
}

interface TherapistSelectionProps {
  onSelectTherapist: (therapist: Therapist) => void;
  selectedDate?: Date;
}

const TherapistSelection: React.FC<TherapistSelectionProps> = ({ 
  onSelectTherapist, 
  selectedDate 
}) => {
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("");
  
  // Fetch approved therapists
  const { data: therapists, isLoading: therapistsLoading } = useQuery({
    queryKey: ['therapists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('account_type', 'therapist')
        .eq('approval_status', 'approved');
      
      if (error) throw error;
      return data as Therapist[];
    }
  });

  // Get specializations for filtering
  const specializations = useMemo(() => {
    if (!therapists) return [];
    const specs = therapists
      .map(t => t.specialization)
      .filter(Boolean)
      .filter((spec, index, arr) => arr.indexOf(spec) === index);
    return specs;
  }, [therapists]);

  // Filter therapists based on selected specialization
  const filteredTherapists = useMemo(() => {
    if (!therapists) return [];
    if (!selectedSpecialization) return therapists;
    return therapists.filter(t => t.specialization === selectedSpecialization);
  }, [therapists, selectedSpecialization]);

  if (therapistsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Select a Therapist</h2>
        {selectedDate && (
          <Badge variant="outline">
            {format(selectedDate, "EEEE, MMMM dd, yyyy")}
          </Badge>
        )}
      </div>

      {/* Specialization Filter */}
      {specializations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedSpecialization === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSpecialization("")}
          >
            All Specializations
          </Button>
          {specializations.map((spec) => (
            <Button
              key={spec}
              variant={selectedSpecialization === spec ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSpecialization(spec)}
            >
              {spec}
            </Button>
          ))}
        </div>
      )}

      {/* Therapist Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTherapists?.map((therapist) => (
          <TherapistCard
            key={therapist.id}
            therapist={therapist}
            onSelect={onSelectTherapist}
            selectedDate={selectedDate}
          />
        ))}
      </div>

      {filteredTherapists?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Therapists Available</h3>
            <p className="text-muted-foreground text-center">
              No therapists match your current filters. Try adjusting your criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface TherapistCardProps {
  therapist: Therapist;
  onSelect: (therapist: Therapist) => void;
  selectedDate?: Date;
}

const TherapistCard: React.FC<TherapistCardProps> = ({ therapist, onSelect, selectedDate }) => {
  const { availabilitySlots, isLoading } = useTherapistAvailability(therapist.id);
  
  // Check if therapist has availability for selected date
  const hasAvailabilityForDate = useMemo(() => {
    if (!selectedDate || !availabilitySlots) return true;
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return availabilitySlots.some(slot => 
      slot.slot_date === dateStr && 
      slot.is_available && 
      slot.current_bookings < slot.max_bookings
    );
  }, [selectedDate, availabilitySlots]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !availabilitySlots) return [];
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return availabilitySlots.filter(slot => 
      slot.slot_date === dateStr && 
      slot.is_available && 
      slot.current_bookings < slot.max_bookings
    );
  }, [selectedDate, availabilitySlots]);

  return (
    <Card className={`transition-all hover:shadow-md ${!hasAvailabilityForDate ? 'opacity-60' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{therapist.full_name}</CardTitle>
            {therapist.specialization && (
              <CardDescription>{therapist.specialization}</CardDescription>
            )}
          </div>
          {therapist.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">{therapist.rating}</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {therapist.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {therapist.location}
          </div>
        )}
        
        {therapist.hourly_rate && (
          <div className="text-lg font-semibold text-primary">
            ${therapist.hourly_rate}/session
          </div>
        )}

        {selectedDate && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Available Times
            </div>
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading availability...</div>
            ) : availableSlots.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {availableSlots.slice(0, 3).map((slot) => (
                  <Badge key={slot.id} variant="secondary" className="text-xs">
                    {slot.slot_start_time} - {slot.slot_end_time}
                  </Badge>
                ))}
                {availableSlots.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{availableSlots.length - 3} more
                  </Badge>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No availability</div>
            )}
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={() => onSelect(therapist)}
          disabled={selectedDate ? !hasAvailabilityForDate : false}
        >
          {selectedDate && !hasAvailabilityForDate ? 'No Availability' : 'Select Therapist'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TherapistSelection;
