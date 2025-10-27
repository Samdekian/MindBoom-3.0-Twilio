import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRBACtesting = () => {
  const { user, hasRole, hasPermission } = useAuthRBAC();
  const { toast } = useToast();

  const [roleCheck, setRoleCheck] = useState('');
  const [permissionCheck, setPermissionCheck] = useState('');
  const [roleResult, setRoleResult] = useState<boolean | null>(null);
  const [permissionResult, setPermissionResult] = useState<boolean | null>(null);

  const checkRole = () => {
    setRoleResult(hasRole(roleCheck));
  };

  const checkPermission = () => {
    setPermissionResult(hasPermission(permissionCheck));
  };

  return {
    roleCheck,
    setRoleCheck,
    permissionCheck,
    setPermissionCheck,
    roleResult,
    permissionResult,
    checkRole,
    checkPermission,
  };
};
