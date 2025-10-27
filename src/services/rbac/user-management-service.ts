
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/core/rbac';
import { getRoleIdString } from '@/utils/rbac/role-type-helpers';
import { isValidUserRole, mapLegacyRoleToUserRole } from '@/utils/rbac/role-type-helpers';

/**
 * Centralized service for managing user roles and metadata
 */
export class UserManagementService {
  /**
   * Assigns a role to a user
   * @param userId The user ID
   * @param roleName The role to assign
   * @returns Success status and message
   */
  static async assignRole(userId: string, roleName: string): Promise<{success: boolean; message: string}> {
    try {
      // Validate and convert the role name to a valid UserRole
      if (!isValidUserRole(roleName)) {
        const mappedRole = mapLegacyRoleToUserRole(roleName);
        console.info(`Role "${roleName}" mapped to "${mappedRole}"`);
        roleName = mappedRole;
      }
      
      // Now we know roleName is a valid UserRole
      const validatedRole = roleName as UserRole;
      
      const { data, error } = await supabase.rpc('manage_user_role', { 
        p_user_id: userId,
        p_role_name: validatedRole,
        p_operation: 'assign'
      });
      
      if (error) throw error;
      
      return {
        success: true,
        message: `Successfully assigned ${validatedRole} role to user`
      };
    } catch (error: any) {
      console.error('Error assigning role:', error);
      return {
        success: false,
        message: error.message || 'Failed to assign role'
      };
    }
  }
  
  /**
   * Gets or creates a role, ensuring it exists in the database
   * @param roleName The role name to get or create
   * @returns The role ID as string
   */
  static async getOrCreateRole(roleName: string): Promise<string> {
    try {
      // Ensure we're working with a valid role name
      if (!isValidUserRole(roleName)) {
        roleName = mapLegacyRoleToUserRole(roleName);
      }
      
      const validatedRole = roleName as UserRole;
      
      // First, try to get the role
      let { data: role, error } = await supabase
        .from('roles')
        .select('id')
        .eq('name', validatedRole)
        .maybeSingle();
        
      if (role?.id) {
        return role.id;
      }
      
      // If role doesn't exist, create it
      if (error || !role) {
        // Try to create the role
        const { data: newRole, error: createError } = await supabase
          .from('roles')
          .insert({
            name: validatedRole,
            description: `${validatedRole.charAt(0).toUpperCase() + validatedRole.slice(1)} role`
          })
          .select('id')
          .single();
          
        if (createError) {
          // If we still have errors, use the RPC function
          const { data: createdRole, error: rpcError } = await supabase
            .rpc('create_admin_role_if_needed');
            
          if (rpcError) {
            throw new Error(`Failed to create role: ${rpcError.message}`);
          }
          
          if (createdRole) {
            return getRoleIdString(createdRole);
          }
        } else if (newRole) {
          return newRole.id;
        }
      }
      
      throw new Error('Failed to get or create role');
    } catch (error: any) {
      console.error('Error getting or creating role:', error);
      throw error;
    }
  }
  
  /**
   * Fixes user metadata by ensuring the approval status and roles are correctly set
   * @param userId The user ID to fix
   * @returns Results of the operation
   */
  static async fixUserMetadata(userId: string): Promise<{
    success: boolean;
    steps: Record<string, 'pending' | 'complete' | 'error'>;
    error?: string;
  }> {
    const steps: Record<string, 'pending' | 'complete' | 'error'> = {
      'approvalStatus': 'pending',
      'adminRole': 'pending',
      'roleAssignment': 'pending',
      'profileUpdate': 'pending'
    };
    
    try {
      // Step 1: Set approval status to 'approved'
      console.log("Step 1: Fixing approval status");
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', userId);
          
      if (updateError) {
        steps.approvalStatus = 'error';
        throw updateError;
      }
      
      steps.approvalStatus = 'complete';
      
      // Step 2: Get or create admin role
      console.log("Step 2: Getting admin role ID");
      let adminRoleId: string;
      
      try {
        adminRoleId = await this.getOrCreateRole('admin');
        steps.adminRole = 'complete';
      } catch (error) {
        steps.adminRole = 'error';
        throw error;
      }
      
      console.log("Got admin role ID:", adminRoleId);
      
      // Step 3: Assign the admin role to the user
      console.log("Step 3: Assigning admin role");
      const assignResult = await this.assignRole(userId, 'admin');
      
      if (!assignResult.success) {
        steps.roleAssignment = 'error';
        throw new Error(`Failed to assign admin role: ${assignResult.message}`);
      }
      
      steps.roleAssignment = 'complete';
      
      // Step 4: Update user profile
      console.log("Step 4: Updating user profile and metadata");
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ account_type: 'admin' })
        .eq('id', userId);
        
      if (profileError) {
        steps.profileUpdate = 'error';
        throw profileError;
      }
      
      steps.profileUpdate = 'complete';
      
      return {
        success: true,
        steps
      };
    } catch (error: any) {
      console.error('Error fixing user metadata:', error);
      return {
        success: false,
        steps,
        error: error.message || "Unknown error occurred"
      };
    }
  }
  
  /**
   * Logs an audit event for a user action
   * @param eventType The type of event
   * @param resourceType The resource type
   * @param resourceId The resource ID
   * @param metadata Additional metadata
   */
  static async logAuditEvent(
    eventType: string,
    resourceType: string,
    resourceId: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        user_id: resourceId,
        activity_type: eventType,
        resource_type: resourceType,
        resource_id: resourceId,
        metadata
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }
}
