import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PatientResource {
  id: string;
  title: string;
  description?: string;
  resource_type: 'article' | 'video' | 'audio' | 'exercise';
  content_url?: string;
  file_path?: string;
  tags?: string[];
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePatientResources = () => {
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['patient-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_resources')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as PatientResource[];
    },
  });

  const featuredResources = resources.filter(resource => resource.is_featured);
  const recentResources = resources.filter(resource => !resource.is_featured);

  return {
    resources,
    featuredResources,
    recentResources,
    isLoading,
  };
};