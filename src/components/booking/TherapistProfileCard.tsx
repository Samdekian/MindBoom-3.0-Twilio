
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, DollarSign, Clock, MessageSquare, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import PatientInquiryForm from "@/components/inquiries/PatientInquiryForm";

interface TherapistProfileCardProps {
  therapist: {
    id: string;
    full_name: string;
    bio?: string;
    specializations?: string[];
    hourly_rate?: number;
    years_experience?: number;
    avatar_url?: string;
    accepting_new_patients?: boolean;
    rating?: number;
    location?: string;
  };
  onBook?: (therapistId: string) => void;
  compact?: boolean;
}

const TherapistProfileCard: React.FC<TherapistProfileCardProps> = ({ 
  therapist, 
  onBook,
  compact = false 
}) => {
  const [inquiryDialogOpen, setInquiryDialogOpen] = useState(false);

  const handleBookSession = () => {
    if (onBook) {
      onBook(therapist.id);
    }
  };

  const handleInquirySuccess = () => {
    setInquiryDialogOpen(false);
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 ${compact ? 'h-full' : ''}`}>
      <CardHeader className={compact ? "pb-3" : ""}>
        <div className="flex items-start gap-4">
          <Avatar className={compact ? "h-12 w-12" : "h-16 w-16"}>
            <AvatarImage src={therapist.avatar_url} alt={therapist.full_name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {therapist.full_name?.split(' ').map(n => n[0]).join('') || 'T'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <CardTitle className={compact ? "text-lg" : "text-xl"}>
                {therapist.full_name}
              </CardTitle>
              {therapist.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{therapist.rating}</span>
                </div>
              )}
            </div>
            <CardDescription className={`mt-1 ${compact ? 'line-clamp-2' : 'line-clamp-3'}`}>
              {therapist.bio || "Experienced therapist dedicated to helping clients achieve their mental health goals."}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {therapist.specializations?.slice(0, compact ? 2 : 3).map((spec, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {spec}
            </Badge>
          ))}
          {therapist.specializations && therapist.specializations.length > (compact ? 2 : 3) && (
            <Badge variant="outline" className="text-xs">
              +{therapist.specializations.length - (compact ? 2 : 3)} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
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
          {therapist.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{therapist.location}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button 
            onClick={handleBookSession}
            className="flex-1"
            disabled={!therapist.accepting_new_patients}
          >
            <Calendar className="h-4 w-4 mr-2" />
            {therapist.accepting_new_patients ? 'Book Session' : 'Not Available'}
          </Button>
          
          <Dialog open={inquiryDialogOpen} onOpenChange={setInquiryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Contact {therapist.full_name}</DialogTitle>
                <DialogDescription>
                  Send an inquiry to this therapist. They will respond to your message and help you get started.
                </DialogDescription>
              </DialogHeader>
              <PatientInquiryForm 
                therapistId={therapist.id}
                therapistName={therapist.full_name}
                onSuccess={handleInquirySuccess}
                onClose={() => setInquiryDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {!therapist.accepting_new_patients && (
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            This therapist is currently not accepting new patients
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TherapistProfileCard;
