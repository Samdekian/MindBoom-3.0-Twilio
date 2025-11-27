
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@supabase/supabase-js";

export type TwoFactorStatus = {
  isEnabled: boolean;
  setupComplete: boolean;
  secretKey?: string;
  qrCodeUrl?: string;
  recoveryFactors?: string[];
};

export const useTwoFactorAuth = (user: User | null) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<TwoFactorStatus>({ 
    isEnabled: false, 
    setupComplete: false 
  });
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkTwoFactorStatus();
    }
  }, [user]);

  const checkTwoFactorStatus = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // In a real implementation, check if 2FA is enabled for the user
      // For now, we'll simulate the check
      const { data, error } = await supabase
        .from('profiles')
        .select('two_factor_enabled')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking 2FA status:', error);
        return;
      }
      
      setStatus({
        isEnabled: data?.two_factor_enabled || false,
        setupComplete: data?.two_factor_enabled || false
      });
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startTwoFactorSetup = async (): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      // In a real implementation, this would generate a secret key and QR code
      // For now, we'll simulate the setup
      const secretKey = 'DEMO_SECRET_KEY';
      const qrCodeUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      const recoveryFactors = ['DEMO001', 'DEMO002', 'DEMO003'];
      
      setStatus({
        isEnabled: false,
        setupComplete: false,
        secretKey,
        qrCodeUrl,
        recoveryFactors
      });
      
      return true;
    } catch (error) {
      console.error('Error starting 2FA setup:', error);
      toast({
        title: "Setup Failed",
        description: "Failed to start two-factor authentication setup.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ two_factor_enabled: false })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setStatus({
        isEnabled: false,
        setupComplete: false
      });
      
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    status,
    loading,
    setLoading: setIsLoading,
    startTwoFactorSetup,
    disableTwoFactor,
    checkTwoFactorStatus
  };
};
