import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { toast } from 'sonner';

export interface UserSecurity {
  user_id: string;
  two_factor_enabled: boolean;
  two_factor_setup_complete: boolean;
  security_level: string;
  last_login_at?: string;
  login_count?: number;
  failed_login_attempts?: number;
}

export const useAccountSecurity = () => {
  const { user } = useAuthRBAC();
  const queryClient = useQueryClient();

  const { data: securityData, isLoading } = useQuery({
    queryKey: ['account-security', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('two_factor_enabled, two_factor_setup_complete, security_level, updated_at')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Get recent login activity from audit logs
      const { data: loginLogs, error: logsError } = await supabase
        .from('audit_logs')
        .select('activity_timestamp, metadata')
        .eq('user_id', user.id)
        .eq('activity_type', 'user_login')
        .order('activity_timestamp', { ascending: false })
        .limit(10);

      if (logsError) console.error('Error fetching login logs:', logsError);

      return {
        user_id: user.id,
        two_factor_enabled: data.two_factor_enabled || false,
        two_factor_setup_complete: data.two_factor_setup_complete || false,
        security_level: data.security_level || 'basic',
        login_history: loginLogs || []
      };
    },
    enabled: !!user?.id
  });

  const updateSecurityMutation = useMutation({
    mutationFn: async (updates: Partial<UserSecurity>) => {
      if (!user?.id) throw new Error('No user logged in');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['account-security', user?.id] });
      toast.success('Security settings updated');
    },
    onError: (error) => {
      console.error('Error updating security settings:', error);
      toast.error('Failed to update security settings');
    }
  });

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Log password change
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          activity_type: 'password_changed',
          resource_type: 'user_security',
          metadata: { timestamp: new Date().toISOString() }
        });

      toast.success('Password updated successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
      throw error;
    }
  };

  const enableTwoFactor = async () => {
    return updateSecurityMutation.mutateAsync({
      two_factor_enabled: true,
      two_factor_setup_complete: true
    });
  };

  const disableTwoFactor = async () => {
    return updateSecurityMutation.mutateAsync({
      two_factor_enabled: false,
      two_factor_setup_complete: false
    });
  };

  return {
    securityData,
    isLoading,
    updateSecurity: updateSecurityMutation.mutateAsync,
    changePassword,
    enableTwoFactor,
    disableTwoFactor,
    isUpdating: updateSecurityMutation.isPending
  };
};