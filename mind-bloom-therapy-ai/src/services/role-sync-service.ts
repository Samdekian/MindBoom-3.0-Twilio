
import { User } from "@supabase/supabase-js";
import { verifyUserRoleConsistency, syncUserRoles } from "./role-synchronization";

/**
 * Manages background role synchronization
 */
class RoleSyncService {
  private syncQueue: string[] = [];
  private processing: boolean = false;
  private syncInterval: number | null = null;
  private retryTimeout: number | null = null;
  private checkInterval: number = 60 * 1000; // 1 minute
  private maxRetries: number = 5;
  private retryDelays: number[] = [2000, 5000, 10000, 30000, 60000]; // Increasing backoff delays
  private retryAttempts: Map<string, number> = new Map();
  private persistedQueue: string[] = [];
  
  constructor() {
    this.loadPersistedQueue();
    window.addEventListener('beforeunload', () => this.persistQueue());
  }
  
  /**
   * Begin periodic checking for the current user
   * @param user The current user
   */
  startBackgroundSync(user: User | null) {
    this.stopBackgroundSync();
    
    if (!user) return;
    
    // Initial check
    this.checkAndSyncUserRoles(user.id);
    
    // Set up periodic checks
    this.syncInterval = window.setInterval(() => {
      this.checkAndSyncUserRoles(user.id);
    }, this.checkInterval);
    
    // Process any queued items from previous sessions
    if (this.persistedQueue.length > 0) {
      console.log(`Processing ${this.persistedQueue.length} persisted sync requests`);
      this.persistedQueue.forEach(userId => this.queueRoleSync(userId));
      this.persistedQueue = [];
      this.savePersistedQueue();
    }
  }
  
  /**
   * Stop background sync
   */
  stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
      this.retryTimeout = null;
    }
  }
  
  /**
   * Set the check interval for automatic synchronization
   * @param intervalMs Interval in milliseconds
   */
  setCheckInterval(intervalMs: number) {
    if (intervalMs < 5000) {
      console.warn('Check interval cannot be less than 5000ms, setting to 5000ms');
      intervalMs = 5000;
    }
    
    this.checkInterval = intervalMs;
    
    // Restart interval if active
    if (this.syncInterval) {
      this.stopBackgroundSync();
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.startBackgroundSync(currentUser);
      }
    }
  }
  
  /**
   * Get current user from local storage or session
   */
  private getCurrentUser(): User | null {
    try {
      const supabaseSession = localStorage.getItem('supabase.auth.token');
      if (supabaseSession) {
        const session = JSON.parse(supabaseSession);
        return session?.currentSession?.user || null;
      }
    } catch (error) {
      console.error("Error retrieving current user:", error);
    }
    return null;
  }
  
  /**
   * Check if user roles are consistent and sync if needed
   */
  private async checkAndSyncUserRoles(userId: string) {
    try {
      const { isConsistent } = await verifyUserRoleConsistency(userId);
      
      if (!isConsistent) {
        console.log(`Role inconsistency detected for user ${userId}, queueing sync`);
        this.queueRoleSync(userId);
      }
    } catch (error) {
      console.error("Error in background role check:", error);
    }
  }
  
  /**
   * Queue a user for role synchronization
   */
  queueRoleSync(userId: string) {
    // Only add to queue if not already there
    if (!this.syncQueue.includes(userId)) {
      this.syncQueue.push(userId);
      
      // Start processing if not already
      if (!this.processing) {
        this.processQueue();
      }
    }
  }
  
  /**
   * Force immediate synchronization for a user
   * @param userId User ID to synchronize
   * @returns Promise resolving to success status
   */
  async forceSyncUser(userId: string): Promise<boolean> {
    try {
      const success = await syncUserRoles(userId);
      // Reset retry count on success
      if (success) {
        this.retryAttempts.delete(userId);
      }
      return success;
    } catch (error) {
      console.error(`Forced sync failed for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Process the sync queue
   */
  private async processQueue() {
    if (this.processing || this.syncQueue.length === 0) return;
    
    this.processing = true;
    
    try {
      const userId = this.syncQueue.shift()!;
      console.log(`Processing role sync for user ${userId}`);
      
      const success = await syncUserRoles(userId);
      
      if (!success) {
        console.log(`Sync failed for user ${userId}`);
        
        // Get current retry count
        const retryCount = this.retryAttempts.get(userId) || 0;
        
        // Check if we should retry
        if (retryCount < this.maxRetries) {
          this.retryAttempts.set(userId, retryCount + 1);
          
          // Re-add to queue with exponential backoff
          const delay = this.retryDelays[Math.min(retryCount, this.retryDelays.length - 1)];
          console.log(`Will retry in ${delay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
          
          setTimeout(() => {
            this.syncQueue.push(userId);
            this.processQueue();
          }, delay);
        } else {
          console.error(`Max retries (${this.maxRetries}) exceeded for user ${userId}`);
          // Reset retry count but don't try again automatically
          this.retryAttempts.delete(userId);
        }
      } else {
        // Reset retry count on success
        this.retryAttempts.delete(userId);
      }
    } catch (error) {
      console.error("Error in role sync queue processing:", error);
    } finally {
      this.processing = false;
      
      // Persist queue in case of page unload
      this.persistQueue();
      
      // Continue processing queue with delay
      if (this.syncQueue.length > 0) {
        this.retryTimeout = window.setTimeout(() => {
          this.processQueue();
        }, 500); // Short delay between processing items
      }
    }
  }
  
  /**
   * Persist queue to localStorage to survive page reloads
   */
  private persistQueue() {
    try {
      const queueToSave = [...this.syncQueue];
      localStorage.setItem('role_sync_queue', JSON.stringify(queueToSave));
    } catch (error) {
      console.error("Error persisting sync queue:", error);
    }
  }
  
  /**
   * Load persisted queue from localStorage
   */
  private loadPersistedQueue() {
    try {
      const savedQueue = localStorage.getItem('role_sync_queue');
      if (savedQueue) {
        this.persistedQueue = JSON.parse(savedQueue);
        // Clear storage after loading
        localStorage.removeItem('role_sync_queue');
      }
    } catch (error) {
      console.error("Error loading persisted sync queue:", error);
    }
  }
  
  /**
   * Save persisted queue to localStorage
   */
  private savePersistedQueue() {
    try {
      localStorage.setItem('role_sync_queue', JSON.stringify(this.persistedQueue));
    } catch (error) {
      console.error("Error saving persisted sync queue:", error);
    }
  }
  
  /**
   * Clean up any resources
   */
  cleanup() {
    this.stopBackgroundSync();
    this.persistQueue();
  }
}

// Create singleton instance
export const roleSyncService = new RoleSyncService();
export default roleSyncService;
