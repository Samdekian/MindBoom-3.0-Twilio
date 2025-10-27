
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface RegisterResult {
  data: {
    user: any | null;
  } | null;
  error: Error | null;
}

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);

  const register = async (email: string, password: string, metadata?: any): Promise<RegisterResult> => {
    if (!email) throw new Error("Email is required");
    if (!password) throw new Error("Password is required");
    
    // Ensure metadata has required fields
    if (metadata) {
      if (!metadata.full_name && metadata.name) {
        metadata.full_name = metadata.name;
      } else if (!metadata.full_name && !metadata.name) {
        metadata.full_name = "New User";
      }

      if (!metadata.name && metadata.full_name) {
        metadata.name = metadata.full_name;
      }
      
      if (!metadata.accountType) {
        metadata.accountType = "patient";
      }
    }
    
    console.log("Registration metadata:", metadata);
    
    setIsLoading(true);
    try {
      const options = metadata ? { data: metadata } : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });

      if (error) {
        return { data: null, error };
      }

      // The database trigger now handles profile creation and role assignment
      return { data, error: null };
    } catch (error) {
      return { 
        data: null, 
        error: error instanceof Error ? error : new Error('Registration failed')
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { register, isLoading };
};
