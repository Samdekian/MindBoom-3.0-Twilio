
import { supabase } from "@/integrations/supabase/client";
import { logRBACEvent } from "@/utils/rbac/fetchRBACEvents";

interface HealthCheckResult {
  totalChecks: number;
  passedChecks: number;
  inconsistencies: number;
  autoFixed: number;
  errors: string[];
}

interface LastRunInfo {
  lastRunTime: Date | null;
  checkInterval: number;
  isRunning: boolean;
}

class RBACHealthMonitor {
  private lastRunTime: Date | null = null;
  private checkInterval: number = 0;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  /**
   * Run a comprehensive RBAC health check
   */
  async runHealthCheck(autoFix: boolean = false): Promise<HealthCheckResult> {
    if (this.isRunning) {
      return {
        totalChecks: 0,
        passedChecks: 0,
        inconsistencies: 0,
        autoFixed: 0,
        errors: ['Health check already in progress']
      };
    }

    const result: HealthCheckResult = {
      totalChecks: 0,
      passedChecks: 0,
      inconsistencies: 0,
      autoFixed: 0,
      errors: []
    };

    try {
      this.isRunning = true;
      this.lastRunTime = new Date();

      // Get all users (limited to 100 for performance)
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id')
        .limit(100);

      if (usersError) {
        throw usersError;
      }

      if (!users || users.length === 0) {
        return result;
      }

      result.totalChecks = users.length;

      // Check each user for consistency
      for (const user of users) {
        try {
          const { data, error } = await supabase.rpc(
            'check_and_repair_user_role_consistency',
            {
              p_user_id: user.id,
              p_auto_repair: autoFix
            }
          );

          if (error) {
            throw error;
          }

          const dataObj = data as Record<string, any>;
          
          if (dataObj.is_consistent) {
            result.passedChecks++;
          } else {
            result.inconsistencies++;
            
            if (autoFix && dataObj.auto_repaired) {
              result.autoFixed++;
            }
          }
        } catch (error: any) {
          result.errors.push(`Error checking user ${user.id}: ${error.message}`);
        }
      }

      // Log the health check
      await logRBACEvent(
        '00000000-0000-0000-0000-000000000000', // System ID
        'rbac_health_check',
        'rbac_system',
        '00000000-0000-0000-0000-000000000000',
        {
          totalChecks: result.totalChecks,
          passedChecks: result.passedChecks,
          inconsistencies: result.inconsistencies,
          autoFixed: result.autoFixed,
          errors: result.errors.length
        }
      );

      return result;
    } catch (error: any) {
      console.error("RBAC health check error:", error);
      result.errors.push(`Global error: ${error.message}`);
      return result;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Start automated health checks
   */
  startAutomatedChecks(intervalMs: number = 3600000, autoFix: boolean = false): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.checkInterval = intervalMs;
    this.intervalId = setInterval(() => {
      this.runHealthCheck(autoFix).catch(error => {
        console.error("Scheduled health check error:", error);
      });
    }, intervalMs);
  }

  /**
   * Stop automated health checks
   */
  stopAutomatedChecks(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.checkInterval = 0;
    }
  }

  /**
   * Get information about the last health check run
   */
  getLastRunInfo(): LastRunInfo {
    return {
      lastRunTime: this.lastRunTime,
      checkInterval: this.checkInterval,
      isRunning: this.isRunning
    };
  }
}

export const rbacHealthMonitor = new RBACHealthMonitor();
