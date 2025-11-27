
/**
 * Utility for monitoring and measuring calendar sync operations
 */
interface SyncOperation {
  id: string;
  type: string;
  startTime: number;
  endTime?: number;
  success?: boolean;
  error?: string;
  itemCount?: number;
}

interface SyncStats {
  totalOperations: number;
  successCount: number;
  failCount: number;
  successRate: number;
  averageDuration: number;
  lastSync?: number;
}

class CalendarSyncMonitoring {
  private operations: SyncOperation[] = [];
  private maxOperations = 50;
  
  // Start tracking a sync operation
  startOperation(type: string): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.operations.unshift({
      id,
      type,
      startTime: Date.now()
    });
    
    // Trim history to prevent memory leaks
    if (this.operations.length > this.maxOperations) {
      this.operations = this.operations.slice(0, this.maxOperations);
    }
    
    return id;
  }
  
  // End tracking a sync operation
  endOperation(id: string, success: boolean, itemCount: number = 0, error?: string): void {
    const operation = this.operations.find(op => op.id === id);
    
    if (operation) {
      operation.endTime = Date.now();
      operation.success = success;
      operation.itemCount = itemCount;
      operation.error = error;
    }
  }
  
  // Get sync statistics
  getStats(): SyncStats {
    const completedOps = this.operations.filter(op => op.endTime !== undefined);
    const successOps = completedOps.filter(op => op.success === true);
    const failOps = completedOps.filter(op => op.success === false);
    
    const totalDuration = completedOps.reduce((sum, op) => {
      return sum + (op.endTime! - op.startTime);
    }, 0);
    
    return {
      totalOperations: this.operations.length,
      successCount: successOps.length,
      failCount: failOps.length,
      successRate: completedOps.length ? (successOps.length / completedOps.length) * 100 : 0,
      averageDuration: completedOps.length ? totalDuration / completedOps.length : 0,
      lastSync: completedOps.length ? completedOps[0].endTime : undefined
    };
  }
  
  // Get recent operations
  getRecentOperations(): SyncOperation[] {
    return [...this.operations];
  }
  
  // Clear operation history
  clear(): void {
    this.operations = [];
  }
}

export const syncMonitoring = new CalendarSyncMonitoring();
