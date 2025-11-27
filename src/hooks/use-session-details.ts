import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { useToast } from '@/hooks/use-toast';

export const useSessionDetails = () => {
  const { user } = useAuthRBAC();
  const { toast } = useToast();

  return {
    // placeholder return
  };
};
