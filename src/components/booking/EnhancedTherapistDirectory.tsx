
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar, User, MapPin, Star, DollarSign, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ScheduleAppointmentModal from "./ScheduleAppointmentModal";

interface Therapist {
  id: string;
  full_name: string | null;
  bio?: string | null;
  specializations?: string[] | null;
  hourly_rate?: number | null;
  years_experience?: number | null;
  avatar_url?: string | null;
  accepting_new_patients?: boolean | null;
  rating?: number | null;
  location?: string | null;
}

export const EnhancedTherapistDirectory = () => {
  const navigate = useNavigate();
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const { data: therapists = [], isLoading } = useQuery<Therapist[]>({
    queryKey: ['enhanced-therapists'],
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
        .eq('approval_status', 'approved');
      
      if (error) throw error;
      return data || [];
    },
  });

  const handleSelectTherapist = (therapist: Therapist) => {
    setSelectedTherapist(therapist);
    setShowBookingModal(true);
  };

  const handleViewProfile = (therapistId: string) => {
    navigate(`/therapist/${therapistId}`);
  };

  const handleBookingComplete = () => {
    setShowBookingModal(false);
    setSelectedTherapist(null);
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
    <>
      <div className="grid gap-6">
        {therapists.map((therapist) => (
          <Card key={therapist.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={therapist.avatar_url || undefined} alt={therapist.full_name || 'Therapist'} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg">
                    {therapist.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {therapist.full_name || 'Unnamed Therapist'}
                      </h3>
                      {therapist.location && (
                        <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                          <MapPin className="h-4 w-4" />
                          <span>{therapist.location}</span>
                        </div>
                      )}
                    </div>
                    {therapist.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{therapist.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {therapist.bio || "Experienced therapist dedicated to helping clients achieve their mental health goals."}
                  </p>

                  {therapist.specializations && therapist.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {therapist.specializations.slice(0, 4).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                      {therapist.specializations.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{therapist.specializations.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {therapist.years_experience && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{therapist.years_experience} years</span>
                        </div>
                      )}
                      {therapist.hourly_rate && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${therapist.hourly_rate}/session</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewProfile(therapist.id)}
                      >
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSelectTherapist(therapist)}
                        disabled={therapist.accepting_new_patients === false}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4" />
                        {therapist.accepting_new_patients === false ? 'Not Available' : 'Book Session'}
                      </Button>
                    </div>
                  </div>

                  {therapist.accepting_new_patients === false && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                      This therapist is currently not accepting new patients
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {therapists.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Therapists Available</h3>
              <p className="text-gray-600">
                There are currently no approved therapists available. Please check back later.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {selectedTherapist && (
        <ScheduleAppointmentModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          therapistId={selectedTherapist.id}
          onBookingComplete={handleBookingComplete}
        />
      )}
    </>
  );
};
