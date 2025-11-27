
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Therapist {
  id: string;
  name: string;
  specialties?: string[];
  avatarUrl?: string;
  rating?: number;
  available?: boolean;
}

interface UseTherapistListResult {
  therapists: Therapist[];
  isLoading: boolean;
  error: Error | null;
  filterTherapists: (searchTerm: string) => void;
  refreshTherapists: () => void;
}

export function useTherapistList(): UseTherapistListResult {
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const loadTherapists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch actual therapists from the database
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('account_type', 'therapist')
        .eq('approval_status', 'approved');
      
      if (profilesError) {
        throw profilesError;
      }
      
      // Transform the data to match the expected Therapist interface
      const transformedTherapists: Therapist[] = profiles.map(profile => ({
        id: profile.id,
        name: profile.full_name || 'Therapist',
        specialties: ['Therapy'], // Default specialties, could be fetched from another table
        avatarUrl: `https://i.pravatar.cc/150?u=${profile.id}`, // Using a placeholder avatar
        rating: 4.5, // Default rating, could be calculated or fetched from reviews table
        available: true
      }));
      
      setTherapists(transformedTherapists);
      setFilteredTherapists(transformedTherapists);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load therapists');
      setError(error);
      toast({
        title: 'Error loading therapists',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTherapists();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTherapists(therapists);
      return;
    }
    
    const filtered = therapists.filter(therapist => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        therapist.name.toLowerCase().includes(searchTermLower) ||
        therapist.specialties?.some(s => s.toLowerCase().includes(searchTermLower))
      );
    });
    
    setFilteredTherapists(filtered);
  }, [searchTerm, therapists]);

  const filterTherapists = (term: string) => {
    setSearchTerm(term);
  };

  const refreshTherapists = () => {
    loadTherapists();
  };

  return {
    therapists: filteredTherapists,
    isLoading,
    error,
    filterTherapists,
    refreshTherapists
  };
}
