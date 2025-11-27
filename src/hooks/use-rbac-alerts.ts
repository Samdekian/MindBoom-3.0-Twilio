
import { useState, useEffect } from 'react';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRBACAlerts = () => {
  const { user } = useAuthRBAC();
  const [alerts, setAlerts] = useState<string[]>([]);

  const { data: roles, isLoading, error } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data?.map(item => item.role_id) || [];
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (isLoading) return;

    const newAlerts: string[] = [];

    if (!roles || roles.length === 0) {
      newAlerts.push('No roles assigned to user. Please assign roles.');
    }

    setAlerts(newAlerts);
  }, [roles, isLoading]);

  return {
    alerts,
    isLoading,
    error,
  };
};
