import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthRBAC } from '@/contexts/AuthRBACContext';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  website_url: string | null;
  account_type: string | null;
  status: string | null;
  two_factor_enabled: boolean | null;
  two_factor_setup_complete: boolean | null;
  two_factor_updated_at: string | null;
  security_level: string;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuthRBAC();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              account_type: 'patient',
              security_level: 'basic'
            })
            .select()
            .single();

          if (createError) throw createError;
          return newProfile;
        }
        throw error;
      }

      return data;
    },
    enabled: !!user?.id
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
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
    onSuccess: (data) => {
      queryClient.setQueryData(['user-profile', user?.id], data);
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  });

  const updateAvatar = async (file: File) => {
    if (!user?.id) throw new Error('No user logged in');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Update profile with new avatar URL
    return updateProfileMutation.mutateAsync({
      avatar_url: publicUrl
    });
  };

  const enable2FA = async () => {
    if (!user?.id) throw new Error('No user logged in');

    return updateProfileMutation.mutateAsync({
      two_factor_enabled: true,
      two_factor_setup_complete: true,
      two_factor_updated_at: new Date().toISOString()
    });
  };

  const disable2FA = async () => {
    if (!user?.id) throw new Error('No user logged in');

    return updateProfileMutation.mutateAsync({
      two_factor_enabled: false,
      two_factor_setup_complete: false,
      two_factor_updated_at: new Date().toISOString()
    });
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutateAsync,
    updateAvatar,
    enable2FA,
    disable2FA,
    isUpdating: updateProfileMutation.isPending
  };
};