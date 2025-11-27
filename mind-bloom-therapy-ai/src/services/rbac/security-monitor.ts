
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/utils/rbac/types";

// Security monitor service
class RBACSecurityMonitor {
  /**
   * Monitor role assignments for suspicious activity
   */
  async monitorRoleAssignment(
    performedBy: string,
    targetUser: string,
    role: UserRole,
    success: boolean
  ): Promise<boolean> {
    try {
      // Log the event in audit_logs instead of rbac_security_alerts
      const { error } = await supabase.from("audit_logs").insert({
        user_id: performedBy,
        activity_type: "rbac_security_role_assignment",
        resource_type: "user_roles",
        resource_id: targetUser,
        metadata: {
          role,
          target_user: targetUser,
          success,
          timestamp: new Date().toISOString(),
          severity: this.determineRoleSeverity(role)
        }
      });

      if (error) {
        console.error("Error logging security event:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in monitorRoleAssignment:", error);
      return false;
    }
  }

  /**
   * Determine security level for different roles
   */
  private determineRoleSeverity(role: UserRole): 'low' | 'medium' | 'high' | 'critical' {
    switch (role) {
      case 'admin':
        return 'critical';
      case 'therapist':
        return 'high';
      case 'support':
        return 'medium';
      default:
        return 'low';
    }
  }
}

// Export the singleton instance
export const rbacSecurityMonitor = new RBACSecurityMonitor();
