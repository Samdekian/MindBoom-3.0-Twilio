
import { supabase } from "@/integrations/supabase/client";
import { getRolesFromUserMetadata } from "./userRoleUtils";

/**
 * Handle auth state changes
 */
export const handleAuthStateChange = async (event: string, session: any) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in!');
    
    const userId = session?.user?.id;
    if (!userId) return;
    
    try {
      // Log sign-in event
      await supabase.from('audit_logs').insert({
        user_id: userId,
        activity_type: 'user_signed_in',
        resource_type: 'auth',
        resource_id: userId,
        metadata: {
          provider: session?.user?.app_metadata?.provider || 'email',
          timestamp: new Date().toISOString()
        }
      });
      
      // Get user roles
      const roles = getRolesFromUserMetadata(session?.user);
      
      // Verify role consistency
      if (roles.length > 0) {
        await supabase.rpc('verify_user_role_consistency', { 
          p_user_id: userId  // Use p_user_id parameter name
        });
      }
    } catch (error) {
      console.error('Error handling sign-in:', error);
    }
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('User signed out!');
  }
};
