
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StarIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import StepInstructions from './StepInstructions';
import { useToast } from '@/hooks/use-toast';

interface Therapist {
  id: string;
  name: string;
  specialties?: string[];
  avatarUrl?: string;
  rating?: number;
  available?: boolean;
}

interface TherapistSelectorProps {
  therapists: Therapist[];
  isLoading: boolean;
  error: Error | null;
  onTherapistSelect: (therapistId: string) => void;
  selectedTherapistId?: string;
}

const TherapistSelector: React.FC<TherapistSelectorProps> = ({
  therapists,
  isLoading,
  error,
  onTherapistSelect,
  selectedTherapistId
}) => {
  const [selected, setSelected] = useState<string | undefined>(selectedTherapistId);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedTherapistId) {
      setSelected(selectedTherapistId);
    }
  }, [selectedTherapistId]);

  const handleSelect = (therapist: Therapist) => {
    setSelected(therapist.id);
    onTherapistSelect(therapist.id);
    
    toast({
      title: "Therapist Selected",
      description: `You've selected ${therapist.name}`,
      variant: "success",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading therapists: {error.message}
      </div>
    );
  }

  if (!therapists || therapists.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No therapists available at this time.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <StepInstructions instructions="Select a therapist from the list below to begin scheduling your appointment. Click on any card to choose that therapist." />
      
      {therapists.map((therapist) => (
        <Card 
          key={therapist.id}
          className={cn(
            "cursor-pointer transition-all duration-300",
            selected === therapist.id 
              ? "ring-2 ring-primary ring-offset-2 shadow-lg transform translate-y-[-2px]" 
              : "hover:shadow-md"
          )}
          onClick={() => handleSelect(therapist)}
        >
          <CardContent className="p-4 relative">
            {selected === therapist.id && (
              <div className="absolute top-2 right-2 bg-green-100 text-green-700 rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            <div className="flex items-start space-x-4">
              <Avatar className={cn(
                "h-12 w-12",
                selected === therapist.id && "ring-2 ring-primary"
              )}>
                <AvatarImage src={therapist.avatarUrl} alt={therapist.name} />
                <AvatarFallback>{therapist.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{therapist.name}</h3>
                  {therapist.available && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Available
                    </Badge>
                  )}
                </div>
                
                {therapist.specialties && therapist.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {therapist.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {therapist.rating && (
                  <div className="flex items-center mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <StarIcon 
                        key={i} 
                        size={14}
                        className={i < Math.floor(therapist.rating || 0) 
                          ? "fill-yellow-400 text-yellow-400" 
                          : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="text-xs ml-1 text-muted-foreground">
                      {therapist.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TherapistSelector;
