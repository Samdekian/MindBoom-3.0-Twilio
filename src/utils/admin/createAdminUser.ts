
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage } from "@/utils/error-utils";

export const createAdminUser = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Calling create-admin-user edge function...");
    
    // Call our secure edge function instead of using admin methods directly
    const { data, error } = await supabase.functions.invoke('create-admin-user', {
      method: 'POST',
      body: {} // No parameters needed
    });
    
    if (error) {
      console.error("Error invoking create-admin-user function:", error);
      return { success: false, message: getErrorMessage(error) };
    }
    
    if (!data) {
      console.error("No response from create-admin-user function");
      return { success: false, message: "No response from server" };
    }
    
    console.log("Response from create-admin-user function:", data);
    return data as { success: boolean; message: string };
    
  } catch (error: any) {
    console.error("Unexpected error creating admin user:", error);
    return { 
      success: false, 
      message: getErrorMessage(error) || "An unknown error occurred" 
    };
  }
};
